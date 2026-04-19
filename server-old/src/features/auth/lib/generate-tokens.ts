import jwt from 'jsonwebtoken';
import { AuthConfig } from '@/config/auth.config';

export const generateAccessToken = async ({
  userId,
  roleId,
}: {
  userId: string;
  roleId: number;
}) => {
  const payload = { userId, roleId };
  const token = jwt.sign(payload, AuthConfig.jwtSecret, {
    expiresIn: AuthConfig.jwtExpiry,
  });

  return token;
};

export const generateRefreshToken = async ({ userId }: { userId: string }) => {
  const payload = { userId };
  const token = jwt.sign(payload, AuthConfig.jwtRefreshSecret, {
    expiresIn: AuthConfig.jwtRefreshExpiry,
  });

  return token;
};
