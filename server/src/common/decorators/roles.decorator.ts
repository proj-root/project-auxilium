import { SetMetadata } from '@nestjs/common';

export const ROLES_DECORATOR_KEY = 'roles';

/**
 * @Roles() decorator - Specifies required roles for a route
 * Can be used on controller class or individual methods
 *
 * @example
 * @Roles(Roles.ADMIN)
 * @Get()
 * getData() { ... }
 *
 * @example - Multiple roles (user needs ONE of these roles)
 * @Roles(Roles.ADMIN, Roles.SUPERADMIN)
 * @Get()
 * getData() { ... }
 */
export const Roles = (...roles: number[]) => SetMetadata(ROLES_DECORATOR_KEY, roles);
