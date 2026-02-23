import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@/utils/CustomError';
import Comment from '@/models/comment';
import User from '@/models/user';

const deleteComment = async (
  req: Request<never, never, { title: string; content: string }, never>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const currentUserId = req.userId;
  const { commentId } = req.params;

  try {
    const comment = await Comment.findById(commentId)
      .select('userId blogId')
      .lean()
      .exec();
    const user = await User.findById(currentUserId).select('role').exec();

    if (!comment) {
      throw new CustomError('comment not found', 404, 'NotFound');
    }

    if (comment.userId !== currentUserId && user?.role !== 'admin') {
      throw new CustomError('Access denied', 403, 'AuthError');
    }

    await Comment.deleteOne({ _id: commentId });

    const blog = await Blog.findById(comment.blogId)
      .select('commentsCount')
      .exec();

    if (!blog) {
      throw new CustomError('comment not found', 404, 'NotFound');
    }

    blog.commentsCount--;

    await blog.save();

    res.sendStatus(204);
  } catch (err) {
    logger.error('Error during like creation', err);
    next(err);
  }
};

export default deleteComment;
