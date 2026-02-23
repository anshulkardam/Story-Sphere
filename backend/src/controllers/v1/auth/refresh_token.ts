import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { logger } from '@/lib/winston';
import Token from '@/models/token';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { generateAccessToken, verifyRefreshToken } from '@/lib/jwt';
import { CustomError } from '@/utils/CustomError';

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.refreshToken as string;

  try {
    const tokenExists = await Token.exists({ token: refreshToken });

    if (!tokenExists) {
      throw new CustomError(
        'Invalid Refresh token',
        401,
        'AuthenticationError',
      );
    }

    const jwtPayload = verifyRefreshToken(refreshToken) as {
      userId: Types.ObjectId;
    };

    //TODO: what if refresh token verify fails?

    const accessToken = generateAccessToken(jwtPayload.userId);

    res.status(200).json({
      accessToken,
    });
  } catch (err) {
    logger.error('Error during refresh token', err);
    if (err instanceof TokenExpiredError) {
      throw new CustomError(
        'Refresh token expired, please try again',
        401,
        'AuthenticationError',
      );
    }
    if (err instanceof JsonWebTokenError) {
      throw new CustomError(
        'Refresh token Invalid',
        401,
        'AuthenticationError',
      );
    }
    next(err);
  }
};

export default refreshToken;
