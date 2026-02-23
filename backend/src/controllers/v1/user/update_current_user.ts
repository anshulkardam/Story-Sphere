import { logger } from '@/lib/winston';
import User, { IUser } from '@/models/user';
import { ApiResponse } from '@/types/interfaces';
import { CustomError } from '@/utils/CustomError';
import { NextFunction, Request, Response } from 'express';

const updateCurrentUser = async (
  req: Request<never, never, Partial<IUser>, never>,
  res: Response<ApiResponse<IUser>>,
  next: NextFunction,
): Promise<void> => {
  const userId = req.userId;
  try {
    const { password, role, ...allowedFields } = req.body;
    if (Object.keys(allowedFields).length === 0) {
      throw new CustomError('No valid fields to update', 400, 'BadRequest');
    }

    const user = await User.findById(userId).select('_id').lean().exec();

    if (!user) {
      throw new CustomError('User not Found', 404, 'NotFound');
    }

    const updatedUser = await User.findByIdAndUpdate(userId, allowedFields, {
      new: true,
      runValidators: true,
      select: '-__v',
    }).lean();

    if (!updatedUser) {
      throw new CustomError('Update failed', 500, 'ServerError');
    }

    logger.info('User update success', updatedUser);

    res.status(200).json({ status: 'success', data: updatedUser });
  } catch (err) {
    logger.error('Error while updating current user', err);
    next(err);
  }
};

export default updateCurrentUser;
