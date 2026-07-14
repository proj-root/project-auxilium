import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { EventsService } from '../event.service';
import { UserService } from '@/modules/user/user.service';
import { SheetsService } from './sheets.service';
import { capitalizeFirst } from '@/lib/formatters';
import { UserProfileDTO } from '@/modules/user/user.dto';
import { EventRolesConfig } from '@auxilium/configs/roles';

export interface VerifyParticipantsInput {
  eventId: string;
  userId: string;
  signupUrl: string;
  feedbackUrl: string;
}

export interface VerifyParticipantsResult {
  participants: string[][];
  stats: {
    signupCount: number;
    feedbackCount: number;
    invalidCount: number;
    overallTurnupRate: string;
    courseTurnup: Record<string, number>;
  };
}

@Injectable()
export class VerificationEngineService {
  private readonly logger = new Logger(VerificationEngineService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly userService: UserService,
    private readonly sheetsService: SheetsService,
  ) {}

  /**
   * Split full name into first and last name
   * Note: This is a naive implementation and does NOT cover all edge cases
   */
  private splitName(fullName: string): { firstName: string; lastName: string } {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return { firstName, lastName };
  }

  /**
   * Verify participants by cross-referencing signup, feedback, and helper sheets
   */
  async verifyParticipants(
    args: VerifyParticipantsInput,
  ): Promise<VerifyParticipantsResult> {
    const { eventId, userId, signupUrl, feedbackUrl } = args;

    // Validate URLs and extract spreadsheet IDs
    if (!signupUrl || !feedbackUrl) {
      throw new BadRequestException(
        'Missing required URLs: signupUrl, feedbackUrl',
      );
    }

    this.logger.debug('Extracting spreadsheet IDs from URLs...');
    const signupSpreadsheetId =
      this.sheetsService.extractSpreadsheetId(signupUrl);
    const feedbackSpreadsheetId =
      this.sheetsService.extractSpreadsheetId(feedbackUrl);

    // Get responses from each form
    this.logger.debug('Fetching data from spreadsheets...');
    const signupData = await this.sheetsService.getSheetData({
      spreadsheetId: signupSpreadsheetId,
    });
    const feedbackData = await this.sheetsService.getSheetData({
      spreadsheetId: feedbackSpreadsheetId,
    });

    // Fetch all helpers and extract their profile
    const helperData = (
      await this.eventsService.getEventHelpersByEventId({ eventId })
    ).map((helper) => ({
      ...(helper.user?.userProfile as UserProfileDTO),
      eventRole: helper.eventRole,
    }));

    this.logger.debug(
      '✅ Data loaded from spreadsheets. Preparing to verify participants...',
    );

    // Exclude header row
    const signupCount = signupData.length - 1;
    const feedbackCount = feedbackData.length - 1;

    // Create event report
    this.logger.debug('Creating event report...');
    const eventReport = await this.eventsService.createEventReport({
      eventId,
      signupCount,
      feedbackCount,
      createdBy: userId,
    });
    this.logger.debug(
      `✅ Event report created with ID: ${eventReport.eventReportId}`,
    );

    // Process participant data
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
    this.logger.debug('Processing participant data...');
    const pointsRecordsArray: string[][] = [];
    let serialCount = 1;
    let invalidCount = 0;
    const courseTurnup: Record<string, number> = {};

    // Process signup entries
    for (const student of signupData.slice(1)) {
      const studentFullName = student[1];
      const studentAdminNum = student[2];
      const studentIchat = student[3];
      const studentClass = student[4];
      const studentCourse = student[5]?.split('/')[0]?.trim() || '';

      if (
        !studentFullName ||
        !studentAdminNum ||
        !studentIchat ||
        !studentCourse ||
        !studentClass
      ) {
        throw new BadRequestException(
          'Full name, admin number, iChat, course, and class are required in signup data',
        );
      }

      // Get or create user profile
      let existingProfile = await this.userService.getProfileByAdminNumber({
        adminNumber: studentAdminNum,
      });

      if (!existingProfile) {
        this.logger.debug(
          `Creating new profile for admin number: ${studentAdminNum}`,
        );
        existingProfile = await this.userService.createUserProfile({
          ...this.splitName(studentFullName),
          course: studentCourse,
          ichat: studentIchat,
          studentClass,
          adminNumber: studentAdminNum,
        });
      } else if (
        existingProfile &&
        existingProfile.studentClass !== studentClass
      ) {
        this.logger.warn(
          `Class mismatch for ${studentAdminNum}: expected ${existingProfile.studentClass}, got ${studentClass}. Updating...`,
        );
        await this.userService.updateUserProfile({
          profileId: existingProfile.profileId,
          studentClass,
        });
      }

      // Find matching feedback entry
      const feedbackEntry = feedbackData.find(
        (entry) => entry[2] === studentAdminNum,
      );
      const helperEntry = helperData.find(
        (entry) => entry?.adminNumber === studentAdminNum,
      );

      // Handle invalid cases
      if (!feedbackEntry) {
        this.logger.debug(
          `No feedback for ${studentAdminNum}. Marking as invalid.`,
        );
        invalidCount++;

        await this.eventsService.createEventParticipationRecord({
          profileId: existingProfile.profileId,
          eventReportId: eventReport.eventReportId,
          attended: false,
        });
        continue;
      }

      if (helperEntry) {
        this.logger.debug(
          `Helper entry found for ${studentAdminNum}. Marking as invalid.`,
        );
        invalidCount++;
        continue;
      }

      // Track course turnup
      if (studentCourse) {
        courseTurnup[studentCourse] = (courseTurnup[studentCourse] || 0) + 1;
      }

      // Record participation
      const participationRecord =
        await this.eventsService.createEventParticipationRecord({
          profileId: existingProfile.profileId,
          eventReportId: eventReport.eventReportId,
          attended: true,
          eventRoleId: EventRolesConfig.PARTICIPANT,
        });

      // Format for points sheet
      pointsRecordsArray.push([
        serialCount.toString(),
        `${existingProfile.firstName} ${existingProfile.lastName}`,
        existingProfile.adminNumber,
        existingProfile.studentClass,
        `${capitalizeFirst(participationRecord?.eventRole?.pointsType || '')}(${participationRecord?.eventRole?.pointsType?.charAt(0) || ''})`,
        'half day',
        'Participants',
      ]);

      serialCount++;
    }

    // Process helper entries
    for (const helper of helperData) {
      const helperFullName = helper?.firstName + helper?.lastName;
      const helperAdminNum = helper.adminNumber;
      const helperIchat = helper.ichat;
      const helperClass = helper.studentClass;
      const helperCourse = helper.course;
      const isEventIC = helper.eventRole?.eventRoleId === EventRolesConfig.COORDINATOR;
      const eventRole = isEventIC ? 'ORGANIZER' : 'HELPER';
      const points = helper.eventRole?.pointsAwarded;

      if (
        !helperFullName ||
        !helperAdminNum ||
        !helperIchat ||
        !helperClass ||
        !helperCourse
      ) {
        throw new BadRequestException(
          'Full name, iChat, admin number, class, and course are required in helper data',
        );
      }

      // Assume admins have profiles already
      // let existingProfile = await this.userService.getProfileByAdminNumber({
      //   adminNumber: helperAdminNum,
      // });

      // if (!existingProfile) {
      //   this.logger.debug(
      //     `Creating new profile for helper admin number: ${helperAdminNum}`,
      //   );
      //   existingProfile = await this.userService.createUserProfile({
      //     ...this.splitName(helperFullName),
      //     course: helperCourse?.split('/')[0]?.trim() || '',
      //     ichat: helperIchat,
      //     studentClass: helperClass,
      //     adminNumber: helperAdminNum,
      //   });
      // } else if (
      //   existingProfile &&
      //   existingProfile.studentClass !== helperClass
      // ) {
      //   this.logger.warn(
      //     `Class mismatch for helper ${helperAdminNum}. Updating...`,
      //   );
      //   await this.userService.updateUserProfile({
      //     profileId: existingProfile.profileId,
      //     studentClass: helperClass,
      //   });
      // }

      // Record helper participation
      const participationRecord =
        await this.eventsService.createEventParticipationRecord({
          profileId: helper.profileId,
          eventReportId: eventReport.eventReportId,
          attended: true,
          eventRoleId: EventRolesConfig.COORDINATOR, // TODO: Assuming helpers get coordinator points, will be assigned in the future
          // pointsType: 'LEADERSHIP',
          // pointsAwarded: points,
        });

      // Format for points sheet
      pointsRecordsArray.push([
        serialCount.toString(),
        `${helper.firstName} ${helper.lastName}`,
        helper.adminNumber,
        helper.studentClass,
        `${capitalizeFirst(participationRecord?.eventRole?.pointsType || '')}(${participationRecord?.eventRole?.pointsType?.charAt(0) || ''})`,
        'one week',
        'Organising Committee',
      ]);

      serialCount++;
    }

    const overallTurnupRate = (
      (pointsRecordsArray.length / signupCount) *
      100
    ).toFixed(2);

    this.logger.debug(
      `✅ Verification complete. ${pointsRecordsArray.length} valid participants, ${invalidCount} invalid.`,
    );

    return {
      participants: pointsRecordsArray,
      stats: {
        signupCount,
        feedbackCount,
        invalidCount,
        overallTurnupRate,
        courseTurnup,
      },
    };
  }
}
