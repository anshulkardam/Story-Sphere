import { Request, Response, NextFunction } from 'express';
import Blog from '@/models/blog';
import { logger } from '@/lib/winston';
import { getPagination } from '@/utils/paginationHelper';
import { PaginatedResponse } from '@/types/interfaces';

export const searchBlogs = async (
  req: Request<
    never,
    never,
    never,
    { search: string; page?: number; limit?: number }
  >,
  res: Response<PaginatedResponse<any>>,
  next: NextFunction,
): Promise<void> => {
  try {
    const searchTerm = (req.query.search as string)?.trim() || '';

    const { limit, page, skip } = getPagination(req.query);

    const searchQuery: any = {};

    // Text search - using MongoDB text index
    if (searchTerm) {
      searchQuery.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(searchQuery)
        .select('-banner.publicId -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean()
        .exec(),
      Blog.countDocuments(searchQuery).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      page,
      limit,
      total,
      totalPages,
      data: blogs,
    });
  } catch (err) {
    logger.error('Error searching blogs', err);
    next(err);
  }
};
