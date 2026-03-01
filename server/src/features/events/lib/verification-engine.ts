import { logger } from '@/lib/logger';
import { accessSheets } from './access-sheets';
import * as EventModel from '../events.model';
import * as UserModel from '@/features/user/user.model';

// A temporary function to split full name into first and last name, for better profile creation.
// This is a naive implmentation and DOES NOT cover all edge cases
function nameSplitter(fullName: string) {
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0] || ''; // Handle empty name case
  const lastName = nameParts.slice(1).join(' ') || ''; // Handle cases where there's only one name part

  return { firstName, lastName };
}

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
    '🛠️ Preparing to generate points sheet with the following data samples:',
  );
  logger.debug('Signup Data Sample:', signupData[1]);
  logger.debug('Feedback Data Sample:', feedbackData[1]);
  logger.debug('Helper Data Sample:', helperData[1]);

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
  const participantArray: string[][] = [];
  let invalidCount = 0;
  let courseTurnup: Record<string, number> = {};

  // Omit headers and loop
  for (const student of signupData.slice(1)) {
    // We are assuming fixed form positions here for simplicity
    /**
     * Signup form columns:
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

    // Check if the student already has a registered profile
    let existingProfile = await UserModel.getProfileByAdminNo({
      adminNumber: studentAdminNum,
    });

    if (!existingProfile) {
      logger.debug(
        `No user profile found for admin number: ${studentAdminNum}. Creating new profile.`,
      );

      existingProfile = await UserModel.createUserProfile({
        ...nameSplitter(student[1]),
        course: studentCourse,
        ichat: student[3],
        adminNumber: studentAdminNum,
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

    await EventModel.createEventParticipationRecord({
      profileId: existingProfile.profileId,
      eventReportId: eventReport.eventReportId,
      attended: true,
      eventRole: 'PARTICIPANT',
      pointsAwarded: 1, // TODO: Change to Participation, Leadership, etc.
    });

    participantArray.push(student);
  }

  const overallTurnupRate = (
    (participantArray.length / signupCount) *
    100
  ).toFixed(2);

  return {
    participants: participantArray,
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
