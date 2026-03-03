import { logger } from '@/lib/logger';
import { accessSheets, insertIntoSheet } from './access-sheets';
import * as EventModel from '../events.model';
import * as UserModel from '@/features/user/user.model';
import { capitalizeFirst } from '@/lib/formatters';

// A temporary function to split full name into first and last name, for better profile creation.
// This is a naive implmentation and DOES NOT cover all edge cases
function nameSplitter(fullName: string) {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || ''; // Handle empty name case
  const lastName = nameParts.slice(1).join(' ') || ''; // Handle cases where there's only one name part

  return { firstName, lastName };
}

// TODO Add a class comparer to check for invalid class regressions

interface VerifyParticipantsArgs {
  eventId: string;
  userId: string; // for tracking who generated the report
  signupUrl: string;
  feedbackUrl: string;
  helpersUrl: string;
}

export async function verifyParticipants(args: VerifyParticipantsArgs) {
  const { eventId, userId, signupUrl, feedbackUrl, helpersUrl } = args;
  // TODO: add url validation and error handling
  // TODO: in the future, make a UI for user to select which columns is for what
  // For now assume general structure.

  // Get responses from each form (including questions headers)
  const signupData = await accessSheets({
    spreadsheetId: signupUrl.split('/')[5] as string,
  });
  const feedbackData = await accessSheets({
    spreadsheetId: feedbackUrl.split('/')[5] as string,
  });
  const helperData = await accessSheets({
    spreadsheetId: helpersUrl.split('/')[5] as string,
  });

  logger.debug(
    '🛠️ Data loaded from spreadsheets. Preparing to generate points sheet...',
  );

  // Exclude header row
  const signupCount = signupData.length - 1;
  const feedbackCount = feedbackData.length - 1;
  const helperCount = helperData.length - 1;

  // Generate base event report
  const eventReport = await EventModel.createEventReport({
    eventId: eventId as string,
    signupCount,
    feedbackCount,
    createdBy: userId,
  });
  logger.info(
    `Event report initialized with ID: ${eventReport.eventReportId}.`,
  );

  // --- --- ---

  logger.debug(`🧮 Calculating participant validity and stats...`);
  const pointsRecordsArray: string[][] = [];
  let serialCount = 1; // For generating serial numbers in points sheet
  let invalidCount = 0;
  let courseTurnup: Record<string, number> = {};

  // Omit headers and loop
  for (const student of signupData.slice(1)) {
    // We are assuming fixed form positions here for simplicity
    /**
     * Signup form columns:
     * 0: Timestamp
     * 1: Full Name
     * 2: Admin Number
     * 3: iChat
     * 4: Class
     * 5: Course
     */
    // Extract admin number from data entry
    const studentAdminNum = student[2];
    // TODO: TEMPORARY FIX - some ppl put DISM/DCDF in the forms
    const studentCourse = student[5].split('/')[0].trim();
    const studentClass = student[4];

    // Check if the student already has a registered profile
    let existingProfile = await UserModel.getProfileByAdminNo({
      adminNumber: studentAdminNum,
    });
    // Use admin number as unique identifier to create profile if not exist, and update class if mismatch
    if (!existingProfile) {
      logger.debug(
        `No user profile found for admin number: ${studentAdminNum}. Creating new profile.`,
      );

      existingProfile = await UserModel.createUserProfile({
        ...nameSplitter(student[1]),
        course: studentCourse,
        ichat: student[3],
        studentClass,
        adminNumber: studentAdminNum,
      });
    } else if (
      existingProfile &&
      existingProfile.studentClass !== studentClass
    ) {
      logger.warn(
        `Student class mismatch for admin number: ${studentAdminNum}. Expected: ${existingProfile.studentClass}, Got: ${studentClass}`,
      );
      // For now, we will update the class to the latest one from the form
      // Optimisitically assume user entered correct class
      await UserModel.updateUserProfile({
        profileId: existingProfile.profileId,
        studentClass,
      });
    }

    // Find matching entries in feedback and helper data using admin number
    const feedbackEntry = feedbackData.find(
      (entry) => entry[3] === studentAdminNum,
    );
    const helperEntry = helperData.find(
      (entry) => entry[4] === studentAdminNum,
    );

    // Handle edge cases and validity checks
    if (!feedbackEntry) {
      logger.debug(
        `No feedback found for student with admin number: ${studentAdminNum}. Marking as invalid participant.`,
      );
      invalidCount++;

      // Record participation but as unattended
      await EventModel.createEventParticipationRecord({
        profileId: existingProfile.profileId,
        eventReportId: eventReport.eventReportId,
      });

      // Skip to next participant without awarding points or counting towards turnup stats
      continue;
    } else if (helperEntry) {
      logger.debug(
        `Helper entry found for student with admin number: ${studentAdminNum}. Marking as invalid participant.`,
      );
      invalidCount++;
      continue;
    }

    // Calculate course turnup stats
    if (studentCourse)
      courseTurnup[studentCourse] = (courseTurnup[studentCourse] || 0) + 1;

    // Record the participation in the database
    const participationRecord = await EventModel.createEventParticipationRecord(
      {
        profileId: existingProfile.profileId,
        eventReportId: eventReport.eventReportId,
        attended: true,
        eventRole: 'PARTICIPANT',
        pointsAwarded: 1,
      },
    );

    // Translate data into sheet format
    pointsRecordsArray.push([
      serialCount.toString(),
      existingProfile.firstName + ' ' + existingProfile.lastName,
      existingProfile.adminNumber,
      existingProfile.studentClass,
      capitalizeFirst(participationRecord.pointsType || '') +
        `(${participationRecord.pointsType?.charAt(0)})`,
      // This is the duration of service
      // TODO: MMake this easily customisable
      participationRecord.pointsType === 'LEADERSHIP' ? 'one week' : 'half day',
      participationRecord.pointsType === 'LEADERSHIP'
        ? 'Organising Committee'
        : 'Participants',
    ]);

    serialCount++;
  }

  // Do the same for helpers
  for (const helper of helperData.slice(1)) {
    const helperAdminNum = helper[4];

    const eventRole = helper[7].toLowerCase().includes('[Event IC]')
      ? 'ORGANIZER'
      : 'HELPER';
    const points = eventRole === 'ORGANIZER' ? 2 : 1;

    // TODO: Abstract this into a function to avoid repetition
    let existingProfile = await UserModel.getProfileByAdminNo({
      adminNumber: helperAdminNum,
    });

    if (!existingProfile) {
      logger.debug(
        `No user profile found for helper with admin number: ${helperAdminNum}. Creating new profile.`,
      );
      existingProfile = await UserModel.createUserProfile({
        ...nameSplitter(helper[1]),
        course: helper[2].split('/')[0].trim(),
        ichat: helper[3],
        studentClass: helper[5],
        adminNumber: helperAdminNum,
      });
    } else if (existingProfile && existingProfile.studentClass !== helper[5]) {
      logger.warn(
        `Student class mismatch for admin number: ${helperAdminNum}. Expected: ${existingProfile.studentClass}, Got: ${helper[5]}`,
      );
      await UserModel.updateUserProfile({
        profileId: existingProfile.profileId,
        studentClass: helper[5],
      });
    }

    // Record helper participation
    const participationRecord = await EventModel.createEventParticipationRecord(
      {
        profileId: existingProfile.profileId,
        eventReportId: eventReport.eventReportId,
        attended: true,
        eventRole: eventRole,
        pointsType: 'LEADERSHIP',
        pointsAwarded: points,
      },
    );

    // Translate data into sheet format
    pointsRecordsArray.push([
      serialCount.toString(),
      existingProfile.firstName + ' ' + existingProfile.lastName,
      existingProfile.adminNumber,
      existingProfile.studentClass,
      capitalizeFirst(participationRecord.pointsType || '') +
        `(${participationRecord.pointsType?.charAt(0)})`,
      // This is the duration of service
      // TODO: MMake this easily customisable
      participationRecord.pointsType === 'LEADERSHIP' ? 'one week' : 'half day',
      participationRecord.pointsType === 'LEADERSHIP'
        ? 'Organising Committee'
        : 'Participants',
    ]);

    serialCount++;
  }

  const overallTurnupRate = (
    (pointsRecordsArray.length / signupCount) *
    100
  ).toFixed(2);

  return {
    participants: pointsRecordsArray,
    stats: {
      signupCount,
      feedbackCount,
      helperCount,
      invalidCount,
      overallTurnupRate,
      courseTurnup,
    },
  };
}

// Note: For now, we will temporarily write to a google sheet first
// export async function generatePointsSheet() {

// }
