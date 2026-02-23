import { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

export interface UserJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
}

export interface AdminJwtPayload extends JwtPayload {
  userId: Types.ObjectId;
  role: string;
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: T[];
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
}
