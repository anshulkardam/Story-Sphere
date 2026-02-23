import { generateAccessToken, generateRefreshToken } from '@/lib/jwt';
import { logger } from '@/lib/winston';
import User from '@/models/user';
import Token from '@/models/token';
import { NextFunction, Request, Response } from 'express';
import config from '@/config';
import { CustomError } from '@/utils/CustomError';
import bcrypt from 'bcrypt';

const login = async (
  req: Request<
    never,
    never,
    { username?: string; email?: string; password: string },
    never
  >,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    if (!email && !username) {
      throw new CustomError(
        'Either email or username must be provided',
        400,
        'ValidationError',
      );
    }

    // Build TypeScript-safe $or filter
    const filters: { email?: string; username?: string }[] = [];
    if (email) filters.push({ email });
    if (username) filters.push({ username });

    const user = await User.findOne({ $or: filters })
      .select('username email password role')
      .lean()
      .exec();

    if (!user) {
      throw new CustomError('User not found', 403, 'NotFound');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new CustomError('Invalid password', 403, 'NotAuthorized');
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await Token.create({ token: refreshToken, userId: user._id });

    logger.info('Refresh Token created for user', {
      userId: user._id,
      token: refreshToken,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'PRODUCTION',
      sameSite: 'strict',
    });

    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });

    logger.info('User login Successfully', user);
  } catch (err) {
    logger.error('Error during our registration', err);
    next(err);
  }
};

export default login;
