import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { RoleGuard } from '@/common/guards/role.guard';
import { RolesConfig } from '@auxilium/configs/roles';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetAllUserProfilesQueryDTO, GetAllUsersQueryDTO } from './user.dto';

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

    const result = await this.userService.getAllUsers({
      page: Number(page),
      pageSize: Number(pageSize),
      sortBy,
      sortOrder,
      search: search as string,
      statusId: statusId ? Number(statusId) : undefined,
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
  async getAllUserProfiles(@Query() query: Partial<GetAllUserProfilesQueryDTO>) {
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

  @Get('profile/:adminNumber')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getSingleProfile(@Param('adminNumber') adminNumber: string) {
    const userProfile = await this.userService.getProfileByAdminNumber({
      adminNumber,
    });

    // TODO: If userId not null, fetch user details too?

    if (!userProfile) {
      this.logger.warn(`User with admin number ${adminNumber} not found`);
      return null;
    }

    return {
      message: 'User profile retrieved successfully',
      status: 'success',
      data: userProfile,
    };
  }

  @Get('/:userId')
  @UseGuards(RoleGuard)
  @Roles(RolesConfig.ADMIN, RolesConfig.SUPERADMIN)
  async getSingleUser(@Param('userId') userId: string) {
    const userProfile = await this.userService.getUserById({ userId });

    if (!userProfile) {
      this.logger.warn(`User with ID ${userId} not found`);
      return null;
    }

    return {
      message: 'User profile retrieved successfully',
      status: 'success',
      data: userProfile,
    };
  }
}
