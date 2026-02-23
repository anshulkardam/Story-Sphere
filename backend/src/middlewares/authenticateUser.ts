import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '@/lib/winston';
import { verifyAccessToken } from '@/lib/jwt';
import { Request, Response, NextFunction } from 'express';
import { UserJwtPayload } from '@/types/interfaces';
import { CustomError } from '@/utils/CustomError';

const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer')) {
    throw new CustomError(
      'Access Denied, no token provided',
      401,
      'AuthenticationError',
    );
  }

  const [_, token] = authHeader.split(' ');

  if (!token) {
    throw new CustomError(
      'Access Denied, no token provided',
      401,
      'AuthenticationError',
    );
  }

  try {
    const jwtPayload = verifyAccessToken(token) as UserJwtPayload;
    req.userId = jwtPayload.userId;

    return next();
  } catch (err) {
    logger.error('Error during authentication', err);
    if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
      throw new CustomError('Invalid access token', 401, 'AuthenticationError');
    }
    next(err);
  }
};

export default authenticateUser;
