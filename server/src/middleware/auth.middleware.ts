import db from '@/db';
import { auth } from '@/lib/auth';
import { catchAsync } from '@/lib/catch-async';
import { APIError } from '@auxilium/types/errors';
import { fromNodeHeaders } from 'better-auth/node';
import { NextFunction, Request, Response } from 'express';

export const verifySession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Verify session exists and is valid
    if (!session) throw new APIError('Unauthorized', 401);

    const role = await db.query.userRole.findFirst({
      where: { userId: session.user.id },
    });

    if (!role) throw new APIError('User role not found', 403);

    res.locals.user = session.user;
    res.locals.user.roleId = role?.roleId || null;
    res.locals.session = session;

    return next();
  },
);

export const verifyIsRole = (allowedRoles: number[]) =>
  catchAsync((req: Request, res: Response, next: NextFunction) => {
    const userRole = res.locals.user.roleId;
    if (!allowedRoles.includes(userRole)) {
      throw new APIError('Forbidden: insufficient permissions', 403);
    }
    return next();
  });
