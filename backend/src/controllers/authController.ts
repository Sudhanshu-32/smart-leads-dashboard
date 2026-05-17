import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { createError } from '../middleware/errorHandler';
import { UserRole } from '../types';

// ─── Zod Schemas (validation rules) ──────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'sales']).optional().default('sales'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Token Helper ─────────────────────────────────────────────────────────────

// We sign the JWT with the user's id and role.
// id: identifies WHO the user is (looked up from DB in future requests)
// role: cached here so we don't need a DB hit on every request just to check permissions
const signToken = (id: string, role: UserRole): string => {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign({ id, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── Register ─────────────────────────────────────────────────────────────────

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Check duplicate email before attempting to create
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError('Email already registered', 409));
    }

    const user = await User.create({ name, email, password, role });
    const token = signToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // .select('+password') overrides the 'select: false' in the schema
    // so we can compare passwords here — we never include it elsewhere
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      // Use the SAME generic message for both "no user" and "wrong password"
      // — this prevents email enumeration attacks
      return next(createError('Invalid email or password', 401));
    }

    const token = signToken(user._id.toString(), user.role);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getMe = async (
  req: Request & { user?: { id: string; role: UserRole } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return next(createError('User not found', 404));
    }

    res.json({
      success: true,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};
