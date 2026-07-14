// This file contains hooks for BetterAuth
import db from '@/db';
import * as schema from '@/db/schema';
// import { catchAsync } from '@/lib/catch-async';
// import { logger } from '@/lib/logger';
// TODO: Figure out a way to use NestJS logger for things outside modules

import { RolesConfig } from '@auxilium/configs/roles';
import { APIError } from '@auxilium/types/errors';
import { MiddlewareContext, MiddlewareOptions } from 'better-auth';

// TODO: Devise better user registration flow
export const setupUserDetails = async (
  ctx: MiddlewareContext<MiddlewareOptions, object>,
) => {
  console.log('Auth Body:', ctx.body);
  const newSession: { user: { id: string } } = ctx.context.newSession || null;

  if (!newSession) throw new APIError('No session found after sign-up', 500);

  const newUserId = newSession.user.id;

  await db.transaction(async (tx) => {
    await tx.insert(schema.userRole).values({
      userId: newUserId,
      roleId: RolesConfig.USER, // Default user
    });
  });
};

// Enrich session user details with profile and roles
export const enrichSessionUserDetails = async (userId: string) => {
  // Fetch user role(s)
  const userRole = await db.query.userRole.findFirst({
    where: {
      userId,
    },
    with: {
      role: true,
    },
  });

  return {
    roleId: userRole?.roleId,
    role: userRole?.role?.name,
  };
};
