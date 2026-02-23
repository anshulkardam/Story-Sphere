import { logger } from '@/lib/winston';
import Blog from '@/models/blog';
import { NextFunction, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
//import User from '@/models/user';
import { CustomError } from '@/utils/CustomError';

const deleteBlog = async (
  req: Request<{ blogId: string }, never, never, never>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
   // const userId = req.userId;

    const blogId = req.params.blogId;

    //const user = await User.findById(userId).select('role').lean().exec();

    const blog = await Blog.findById(blogId)
      .select('author banner.publicId')
      .lean()
      .exec();

    if (!blog) {
      throw new CustomError('blog not found', 404, ' NotFound');
    }

    await cloudinary.uploader.destroy(blog.banner.publicId);

    logger.info(' Blog banner deleted');

    await Blog.deleteOne({ _id: blogId });

    logger.info(' Blog deleted', blog._id);

    res.sendStatus(204).json();
  } catch (err) {
    logger.error('Error during blog creation', err);
    next(err);
  }
};

export default deleteBlog;
