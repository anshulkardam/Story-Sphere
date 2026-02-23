import { logger } from '@/lib/winston';
import User, { IUser } from '@/models/user';
import { ApiResponse } from '@/types/interfaces';
import { CustomError } from '@/utils/CustomError';

import { NextFunction, Request, Response } from 'express';

const getCurrentUser = async (
  req: Request,
  res: Response<ApiResponse<IUser>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select('-__v').lean().exec();

    if (!user) {
      throw new CustomError('User not found', 404, 'NotFound');
    }

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    logger.error('Error while getting current user', err);
    next(err);
  }
};

export default getCurrentUser;
