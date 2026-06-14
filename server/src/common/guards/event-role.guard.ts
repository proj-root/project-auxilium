import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  EVENTROLES_DECORATOR_KEY,
  EventRolesOptions,
} from '../decorators/event-roles.decorator';
import { EventsService } from '@/modules/events/event.service';
import { RolesConfig } from '@auxilium/configs/roles';

/**
 * Event Role Guard - Verifies that the user has one of the required roles
 * Must be used with @EventRoles() decorator
 * Uses Better Auth session with enriched role data
 */
@Injectable()
export class EventRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private eventsService: EventsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required roles from the route decorator
    const config = this.reflector.getAllAndOverride<EventRolesOptions>(
      EVENTROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!config.roles || config.roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session: UserSession | undefined = request.session;

    // Check if user is authenticated
    if (!session || !session.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const eventId = request.params[config.paramKey];

    // Get the user's event role
    const userEventRole = await this.eventsService.getUserEventRole({
      userId: session.user.id,
      eventId,
    });

    if (!userEventRole) {
      throw new ForbiddenException(
        'User event role not found. Please contact an administrator.',
      );
    }

    // Check if user has one of the required event roles
    // SUPERADMIN bypasses event role checks
    if (
      !config.roles.includes(userEventRole.eventRoleId) &&
      (session.user as any)?.role?.roleId !== RolesConfig.SUPERADMIN
    ) {
      throw new ForbiddenException(
        `Insufficient permissions. Please contact an administrator if you believe this is an error.`,
      );
    }

    // Attach user to request for use in controller
    request.user = session.user;

    return true;
  }
}
