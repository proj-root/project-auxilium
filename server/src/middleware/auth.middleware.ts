import jwt, { JwtPayload } from 'jsonwebtoken';
import { formatDistanceToNowStrict } from 'date-fns';
import { catchAsync } from '@/lib/catch-async';
import { APIError } from '@auxilium/types/errors';
import { Request, Response, NextFunction } from 'express';
import { AuthConfig } from '@/config/auth.config';
import { logger } from '@/lib/logger';
import * as UserModel from '@/features/user/user.model';

export const verifyJWT = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new APIError('Unauthorized', 401);
    }

    try {
      const payload = jwt.verify(token, AuthConfig.jwtSecret) as JwtPayload;
      if (!payload.exp)
        throw new Error('Invalid token payload; missing expiry.');

      logger.debug(
        `🕐 Access token expires in ${formatDistanceToNowStrict(
          new Date(payload.exp * 1000),
        )}`,
      );

      // Pass on payload data to next function
      res.locals.user = {
        userId: payload.userId,
        roleId: payload.roleId,
      };

      logger.debug(
        `✅ Access token successfully verified for userId: ${res.locals.user.userId}`,
      );

      return next();
    } catch (error) {
      logger.error('JWT verification failed\n' + error);
      throw new APIError('Invalid or expired token', 401);
    }
  },
);

export const verifyRefreshJWT = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw new APIError('Unauthorized', 401);
    }

    try {
      const payload = jwt.verify(
        token,
        AuthConfig.jwtRefreshSecret,
      ) as JwtPayload;
      if (!payload.exp)
        throw new Error('Invalid token payload; missing expiry.');

      logger.debug(
        `🕐 Refresh token expires in ${formatDistanceToNowStrict(
          new Date(payload.exp * 1000),
        )}`,
      );

      // Check if user exists in the database
      const user = await UserModel.getUserById({ userId: payload.userId });
      if (!user) throw new Error('User not found.');

      res.locals.user = {
        userId: payload.userId,
        roleId: user.roleId,
      };

      logger.debug(`✅ Refresh token successfully verified`);

      return next();
    } catch (error) {
      logger.error('JWT verification failed\n' + error);
      throw new APIError('Invalid or expired token', 401);
    }
  },
);

export const verifyIsRole = (requiredRoleId: number) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.user.roleId !== requiredRoleId) {
      throw new APIError(`User does not have required authority.`, 403);
    }
    return next();
  });
