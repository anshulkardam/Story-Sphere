import config from '@/config';
import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import Token from '@/models/token';
import User, { IUser } from '@/models/user';
import { CustomError } from '@/utils/CustomError';
import { NextFunction, Request, Response } from 'express';

const register = async (
  req: Request<never, never, Partial<IUser>, never>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userData = req.body;

  if (
    userData.role === 'admin' &&
    userData.email &&
    !config.WHITELIST_ADMIN_MAIL.includes(userData.email)
  ) {
    logger.warn(
      `User with email ${userData.email} tried to register as an admin but is not in the whitelist`,
    );
    throw new CustomError(
      'You cannot register as an Admin',
      403,
      'NotAuthorized',
    );
  }
  try {
    if (await User.exists({ email: userData.email })) {
      throw new CustomError('Email already exists', 409, 'Conflict');
    }

    if (await User.exists({ username: userData.username })) {
      throw new CustomError('Username already exists', 409, 'Conflict');
    }

    const newUser = await User.create(userData);

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);

    await Token.create({ token: refreshToken, userId: newUser._id });

    logger.info('Refresh Token created for user', {
      userId: newUser._id,
      token: refreshToken,
    });

    res.cookie('refreshToken', refreshToken, {
      //TODO: add max age?
      httpOnly: true,
      secure: config.NODE_ENV === 'PRODUCTION',
      sameSite: 'strict',
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        accessToken,
      },
    });

    logger.info('User Generated Successfully', {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    logger.error('Error during user registration', err);
    next(err);
  }
};

export default register;
