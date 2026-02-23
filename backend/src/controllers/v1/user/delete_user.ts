import { logger } from '@/lib/winston';
import User from '@/models/user';
import { NextFunction, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import Blog from '@/models/blog';

const deleteUserbyId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.params.userId;

    const blogs = await Blog.find({ author: userId })
      .select('banner.publicId')
      .lean()
      .exec();

    const publicIds = blogs.map(({ banner }) => banner.publicId);

    await cloudinary.api.delete_resources(publicIds);

    logger.info(`Deleted ${publicIds.length} blog banners`, {
      userId,
      publicIds,
    });

    await Blog.deleteMany({ author: userId });

    logger.info(`Deleted ${blogs.length} blogs for user`, { userId });

    await User.deleteOne({ _id: userId });
    
    logger.info(`User account deleted successfully`, { userId });

    res.sendStatus(204);
  } catch (err) {
    logger.error('Error while getting a user', err);
    next(err);
  }
};

export default deleteUserbyId;
