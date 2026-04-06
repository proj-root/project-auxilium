// This file contains hooks for BetterAuth

import db from '@/db';
import * as schema from '@/db/schema';
import { catchAsync } from '@/lib/catch-async';
import { logger } from '@/lib/logger';
import { Roles } from '@auxilium/configs/roles';
import { APIError } from '@auxilium/types/errors';
import { MiddlewareContext, MiddlewareOptions } from 'better-auth';

// TODO: Devise better user registration flow
export const setupUserDetails = async (
  ctx: MiddlewareContext<MiddlewareOptions, object>,
) =>
  catchAsync(async () => {
    logger.debug('Auth Body:', ctx.body);
    const newSession = ctx.context.newSession;

    if (!newSession) throw new APIError('No session found after sign-up', 500);

    const newUserId = newSession.user.id;

    await db.transaction(async (tx) => {
      await tx.insert(schema.userProfile).values({
        userId: newUserId,
        ...ctx.body,
      });

      await tx.insert(schema.userRole).values({
        userId: newUserId,
        roleId: Roles.USER, // Default user
      });
    });
  });
