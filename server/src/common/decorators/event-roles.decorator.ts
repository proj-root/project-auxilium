import { SetMetadata } from '@nestjs/common';

export const EVENTROLES_DECORATOR_KEY = 'event-roles';

export interface EventRolesOptions {
  paramKey: string;
  roles: number[];
}

/**
 * @EventRoles() decorator - Specifies required roles for a route
 * Can be used on controller class or individual methods
 *
 * @example
 * @EventRoles(EventRoles.COORDINATOR)
 * @Get()
 * getData() { ... }
 *
 * @example - Multiple roles (user needs ONE of these roles)
 * @EventRoles(EventRoles.COORDINATOR, EventRoles.MENTOR)
 * @Get()
 * getData() { ... }
 */
export const EventRoles = (options: EventRolesOptions) =>
  SetMetadata(EVENTROLES_DECORATOR_KEY, options);
