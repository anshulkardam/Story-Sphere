import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
//import Like from '@/models/like';
import { NextFunction, Request, Response } from 'express';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { CustomError } from '@/utils/CustomError';
import comment from '@/models/comment';

const window = new JSDOM('').window;

const purify = DOMPurify(window);

const commentBlog = async (
  req: Request<never, never, { title: string; content: string }, never>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { blogId } = req.params;
  const { content } = req.body;

  const userId = req.userId;

  try {
    const blog = await Blog.findById(blogId).select('_id commentsCount').exec();

    if (!blog) {
      throw new CustomError('Blog not found', 404, 'NotFound');
    }

    const cleanContent = purify.sanitize(content);

    const newComment = await comment.create({
      blogId,
      content: cleanContent,
      userId,
    });

    blog.commentsCount++;
    await blog.save();

    res.status(201).json({
      comment: newComment,
    });
  } catch (err) {
    logger.error('Error during like creation', err);
    next(err);
  }
};

export default commentBlog;
