import { logger } from '@/lib/winston';
import User from '@/models/user';
import { PaginatedResponse } from '@/types/interfaces';
import { getPagination } from '@/utils/paginationHelper';
import { NextFunction, Request, Response } from 'express';

const getAllUser = async (
  req: Request<never, never, never, { page?: number; limit?: number }>,
  res: Response<PaginatedResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  const { skip, limit, page } = getPagination(req.query);

  try {
    const [users, total] = await Promise.all([
      User.find()
        .select('-__v')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),

      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      data: users,
    });

  } catch (err) {
    logger.error('Error while getting all user', err);
    next(err);
  }
};

export default getAllUser;
