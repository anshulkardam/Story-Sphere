import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
//import Like from '@/models/like';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@/utils/CustomError';
import Comment from '@/models/comment';

const getCommentsByBlog = async (
  req: Request<never, never, { title: string; content: string }, never>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { blogId } = req.params;

  try {
    const blog = await Blog.findById(blogId).select('_id').lean().exec();

    if (!blog) {
      throw new CustomError('blog not found', 404, 'NotFound');
    }

    const allComments = await Comment.find({ blogId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      comments: allComments,
    });
  } catch (err) {
    logger.error('Error during like creation', err);
    next(err);
  }
};

export default getCommentsByBlog;
