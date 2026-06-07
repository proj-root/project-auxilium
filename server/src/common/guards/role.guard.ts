import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_DECORATOR_KEY } from '../decorators/roles.decorator';
import type { UserSession } from '@thallesp/nestjs-better-auth';

/**
 * Role Guard - Verifies that the user has one of the required roles
 * Must be used with @Roles() decorator
 * Uses Better Auth session with enriched role data
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Get required roles from the route decorator
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(
      ROLES_DECORATOR_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const session: UserSession | undefined = request.session;

    // Check if user is authenticated
    if (!session || !session.user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Get the user's role from the session
    // Better Auth enriches the session with role data
    const userRole = (session.user as any)?.role?.roleId;

    if (!userRole) {
      throw new ForbiddenException(
        'User role not found. Please contact administrator.',
      );
    }

    // Check if user has one of the required roles
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        `Insufficient permissions. Please contact an administrator if you believe this is an error.`,
      );
    }

    // Attach user to request for use in controller
    request.user = session.user;

    return true;
  }
}
