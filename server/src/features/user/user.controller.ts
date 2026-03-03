import { Request, Response } from 'express';
import * as UserModel from './user.model';
import { APIError } from '@auxilium/types/errors';

export const readPersonalDetailsById = async (req: Request, res: Response) => {
  const { userId } = res.locals.user;
  const user = await UserModel.getUserWithDetailsById({ userId });

  if (!user) throw new APIError('User not found', 400);

  return res.status(200).json({
    status: 'success',
    message: 'Fetched logged-in user details',
    data: user,
  });
};