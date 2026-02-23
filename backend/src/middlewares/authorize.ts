import { logger } from '@/lib/winston';
import User from '@/models/user';
import { CustomError } from '@/utils/CustomError';
import { Request, Response, NextFunction } from 'express';

export type AuthRole = 'admin' | 'user';

const authorize = (role: AuthRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
      const user = await User.findById(userId).select('role').lean().exec();

      if (!user) {
        throw new CustomError('User not Found', 403, 'NotFound');
      }

      if (!role.includes(user.role)) {
        throw new CustomError('Access Denied', 403, 'AuthorizationError');
      }

      return next();
    } catch (err) {
      logger.error('error authorizing user', err);
      next(err);
    }
  };
};

export default authorize;
