import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
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
  GetAllUserProfilesQueryDTO,
  GetAllUsersQueryDTO,
  UpdateUserDTO,
  UpdateUserSchema,
} from './user.dto';
import { ZodValidationPipe } from '@/common/zod-validation.pipe';

const ROUTE_NAME = 'api/user';

@Controller(ROUTE_NAME)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

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
    if (!Array.isArray(roleIds)) roleIds = roleIds ? roleIds.split(',') : undefined;
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
