import { catchAsync } from '@/lib/catch-async';
import { Request, Response } from 'express';
import { getUserByEmail } from '../user/user.model';
import bcrypt from 'bcrypt';
import { CookieConfig } from '@/config/auth.config';
import { APIError } from '@auxilium/types/errors';
import { StatusConfig } from '@auxilium/configs/status';
import {
  generateAccessToken,
  generateRefreshToken,
} from './lib/generate-tokens';

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new APIError('Email and password are required', 400);
  }

  const user = await getUserByEmail({ email });
  // Check if user exists or if password matches
  if (!user || !bcrypt.compareSync(password, user.password)) {
    throw new APIError('Invalid credentials provided.', 400);
  }
  // Check if user is active
  if (user.statusId !== StatusConfig.ACTIVE) {
    throw new APIError('Invalid credentials provided.', 400);
  }

  const accessToken = await generateAccessToken({
    userId: user.userId,
    roleId: user.roleId,
  });

  const refreshToken = await generateRefreshToken({ userId: user.userId });

  res.status(200).cookie('refreshToken', refreshToken, CookieConfig).json({
    status: 'success',
    message: 'User logged in successfully',
    data: {
      accessToken,
    },
  });
});

// Refresh user's access token
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const user = res.locals.user;
  const accessToken = await generateAccessToken({
    userId: user.userId,
    roleId: user.roleId,
  });

  return res.status(200).json({
    status: 'success',
    message: 'Token refreshed successfully',
    data: { accessToken },
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', CookieConfig);
  res.sendStatus(204);
});
