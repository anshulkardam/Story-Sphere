import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import { NextFunction, Request, Response } from 'express';
//import { JSDOM } from 'jsdom';
//import User from '@/models/user';
//import DOMPurify from 'dompurify';
import { CustomError } from '@/utils/CustomError';
//const window = new JSDOM('').window;

//const purify = DOMPurify(window);

const updateBlog = async (
  req: Request<{blogId: string}, never, { title: string; content: string }, never>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    //const { content, title } = req.body;
    const userId = req.userId;
    const blogId = req.params.blogId;

   // const user = await User.findById(userId).select('role').lean().exec();

    const blog = await Blog.findById(blogId).select('-__v').lean().exec();

    if (!blog) {
      throw new CustomError('Blog not found', 404, 'NotFound');
    }

    if (blog.author !== userId) {
      throw new CustomError('not authorized', 403, 'autherror');
    }

    //update logic here.

   // const cleanContent = purify.sanitize(content);

    // const updatedBlog = await Blog.updateOne({
    //   title,
    //   content: cleanContent,
    //   author: userId,
    // });

    logger.info(' Blog updated');

    res.status(201).json({
      blog: updateBlog,
    });
  } catch (err) {
    logger.error('Error during blog creation', err);
    next(err);
  }
};

export default updateBlog;
