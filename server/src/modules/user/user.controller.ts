import { Controller, Get, Logger, Session } from '@nestjs/common';
import { UserService } from './user.service';
import { type UserSession } from '@thallesp/nestjs-better-auth';

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
}
