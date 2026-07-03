import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { RoleGuard } from '@/common/guards/role.guard';
import { RolesConfig } from '@auxilium/configs/roles';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  type CreateUserProfileDTO,
  type GetAllUserProfilesQueryDTO,
  type GetAllUsersQueryDTO,
  type ProfileLinkDTO,
  ProfileLinkSchema,
  UpdateUserDTO,
  UpdateUserSchema,
  type VerifyIdentityDTO,
  VerifyIdentitySchema,
} from './user.dto';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';
import { generateNumericOTP } from '@/lib/otp-generator';
import { APIError } from '@auxilium/types/errors';
import { RedisService } from '../redis/redis.service';
import { OTPConfig } from '@/config/auth.config';
import { MailService } from '../mail/mail.service';

const ROUTE_NAME = 'api/user';

@Controller(ROUTE_NAME)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly redisClient: RedisService,
  ) {}

  // Generates an OTP based on the ichat provided and sends it to the ichat email for verification
  @Post('verify')
  async verifyIdentity(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(VerifyIdentitySchema)) body: VerifyIdentityDTO,
  ) {
    let profileExists = false;
    // Check if user already has a linked profile
    const existingUser = await this.userService.getUserProfileByUserId({
      userId: session.user.id,
    });

    if (existingUser) {
      throw new HttpException(
        'Your account is already linked to a profile. Please contact support if you wish to change it.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Attempt to fetch user profile based on provided ichat
    // Only get accounts with no userId linked to them.
    const userProfile = await this.userService.getProfileByIchat({
      ichat: body.ichat,
    });

    if (userProfile) profileExists = true;
    else profileExists = false;

    // If no user profile found
    // if (!userProfile) {
    //   return {
    //     message: 'Unable to find a matching profile.',
    //     status: 'success',
    //   };
    // }

    // If user profile is found:
    // Check if user already has a pending OTP:
    // TODO: Do rate limiting based on IP address or user ID to prevent abuse instead
    // This might cause bad UX
    const key = `otp:auth:profile-link:user_${session.user.id}`;
    const existingSession = await this.redisClient.get(key);
    if (existingSession) {
      // If otp already exists, rate limit the user
      throw new HttpException(
        'Too many requests. Please check your inbox or try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Generate a secure OTP and store it in redis
    const otp = generateNumericOTP();
    const profileLinkSession = {
      otp,
      ichat: body.ichat,
      profileExists,
    };
    await this.redisClient.set(
      key,
      JSON.stringify(profileLinkSession),
      OTPConfig.expiry,
    );

    // Send email to ichat
    const emailSent = await this.mailService.sendMail({
      to: body.ichat,
      subject: `${otp} is your GARDEN OTP for verification`,
      htmlContent: `
          <p>
          Dear SEEDling,<br/><br/>

          Use the verification code below to complete the verification process.<br/>
          <strong style="font-size: 24px; color: #1e293b;">${otp}</strong><br/><br/>

          This security code is ephemeral and will expire in <strong>${Math.floor(OTPConfig.expiry / 60)} minutes</strong>.<br/>
          <strong>Didn't request this?</strong> You can safely ignore this email.<br/><br/>

          To protect your account, never forward this email or share this code with anyone. The GARDEN team will never ask for it.<br/><br/>
          
          Best Regards,<br/>
          The GARDEN Team
          </p>
        `,
    });

    if (!emailSent) {
      throw new APIError('Failed to send verification email', 500);
    }

    return {
      message:
        'Successfully found a matching profile, verification email sent.',
      status: 'success',
      data: {
        profileExists,
      },
    };
  }

  // Confirms the OTP from the previous step and links the user profile to the user account
  @Post('verify/:otp')
  async verifyIdentityOTP(
    @Session() session: UserSession,
    @Param('otp') otp: string,
    @Body(new ZodValidationPipe(ProfileLinkSchema)) body: ProfileLinkDTO,
  ) {
    const key = `otp:auth:profile-link:user_${session.user.id}`;
    const profileLinkSession = await this.redisClient
      .get(key)
      .then((data) => (data ? JSON.parse(data) : null));

    if (!profileLinkSession) {
      throw new HttpException(
        'No OTP found or OTP has expired. Please request a new one.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (profileLinkSession.otp !== otp) {
      throw new HttpException('Invalid OTP provided.', HttpStatus.BAD_REQUEST);
    }

    // If OTP is valid, delete it from Redis to prevent reuse
    await this.redisClient.del(key);

    let userProfile;
    if (profileLinkSession.profileExists) {
      // Link user profile to user account
      userProfile = await this.userService.linkProfileToUser({
        userId: session.user.id,
        ichat: profileLinkSession.ichat,
      });
    } else {
      // Create a new account based on the provided body
      userProfile = await this.userService.createUserProfile({
        ...body,
        ichat: profileLinkSession.ichat,
        userId: session.user.id,
      });
    }

    return {
      message: 'OTP verified successfully; Account linked to profile.',
      status: 'success',
      data: userProfile,
    };
  }

  // Create a new user profile (can be tied to user or just standalone)
  // @Post('profile')
  // async createUserProfile(
  //   @Body(new ZodValidationPipe(UpdateUserSchema))
  //   body: CreateUserProfileDTO,
  // ) {
  //   // Creates a new user profile with or without a userId
  //   const userProfile = await this.userService.createUserProfile({
  //     ...body,
  //   });

  //   return {
  //     message: 'User profile created successfully.',
  //     status: 'success',
  //     data: userProfile,
  //   };
  // }

  @Get()
  async getPersonalDetails(@Session() session: UserSession) {
    const userId = session.user.id;

    const user = await this.userService.getUserById({ userId });

    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      return null;
    }

    return {
      message: 'User details retrieved successfully',
      status: 'success',
      data: user,
    };
  }

  @Get('/all')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getAllUsers(@Query() query: Partial<GetAllUsersQueryDTO>) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      statusId,
    } = query;

    let { roleIds } = query;

    console.log('query:', query);

    // Convert into array if it's a single value, and validate that all values are numbers
    if (!Array.isArray(roleIds))
      roleIds = roleIds ? roleIds.split(',') : undefined;
    if (
      roleIds &&
      (!Array.isArray(roleIds) ||
        !roleIds.every(
          (id) => parseInt(id as string) && parseInt(id as string) > 0,
        ))
    ) {
      throw new BadRequestException('roleIds must be an array of numbers');
    }

    const result = await this.userService.getAllUsers({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
      sortOrder,
      search: search as string,
      statusId: statusId ? Number(statusId) : undefined,
      roleIds: roleIds ? roleIds.map(Number) : undefined,
    });

    return {
      status: 'success',
      message: 'Users retrieved successfully',
      data: result,
    };
  }

  // Get all user profiles in the system, which includes records not associated with a user account
  @Get('/profile/all')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getAllUserProfiles(
    @Query() query: Partial<GetAllUserProfilesQueryDTO>,
  ) {
    const {
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      statusId,
    } = query;

    const result = await this.userService.getAllUserProfiles({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
      sortOrder,
      search: search as string,
      statusId: statusId ? Number(statusId) : undefined,
    });

    return {
      status: 'success',
      message: 'User profiles retrieved successfully',
      data: result,
    };
  }

  // @Get('profile/:adminNumber')
  // @UseGuards(RoleGuard)
  // @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  // async getSingleProfile(@Param('adminNumber') adminNumber: string) {
  //   const userProfile = await this.userService.getProfileByAdminNumber({
  //     adminNumber,
  //   });

  //   // TODO: If userId not null, fetch user details too?

  //   if (!userProfile) {
  //     this.logger.warn(`User with admin number ${adminNumber} not found`);
  //     return null;
  //   }

  //   return {
  //     message: 'User profile retrieved successfully',
  //     status: 'success',
  //     data: userProfile,
  //   };
  // }

  // Get single user data by user profile ID, which includes user account details if it exists
  @Get('profile/:userProfileId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getSingleUser(@Param('userProfileId') userProfileId: string) {
    const user = await this.userService.getUserByProfileId({ userProfileId });

    if (!user) {
      throw new NotFoundException(
        `User profile with ID ${userProfileId} not found`,
      );
    }

    return {
      message: 'User retrieved successfully',
      status: 'success',
      data: user,
    };
  }

  // Update self
  @Put()
  async updateUser(
    @Session() session: UserSession,
    @Body(new ZodValidationPipe(UpdateUserSchema)) body: Partial<UpdateUserDTO>,
  ) {
    const userId = session.user.id;
    const user = await this.userService.updateUser({ userId, ...body });

    return {
      message: 'User updated successfully',
      status: 'success',
      data: user,
    };
  }

  @Put(':userId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async updateUserByUserId(
    @Session() session: UserSession,
    @Param('userId') userId: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) body: Partial<UpdateUserDTO>,
  ) {
    const userRole = (session.user as any)?.role?.roleId;

    if (userId === session.user.id) {
      throw new ForbiddenException(
        'Use the /api/user endpoint to update your own profile',
      );
    }

    const user = await this.userService.updateUser(
      { userId, ...body },
      userRole,
    );

    return {
      message: 'User updated successfully',
      status: 'success',
      data: user,
    };
  }
}
