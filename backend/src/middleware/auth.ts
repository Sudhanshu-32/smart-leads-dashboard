import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserRole } from '../types';

// What this does: Extracts the JWT from the Authorization header,
// verifies it's valid and not expired, then attaches the user payload
// to req.user so downstream controllers know WHO is making the request.

interface TokenPayload {
  id: string;
  role: UserRole;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Tokens are sent as: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    // jwt.verify throws if token is expired or tampered with
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.user = { id: decoded.id, role: decoded.role };

    next(); // Token is valid — let the request continue
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// RBAC: Role-Based Access Control
// Returns a middleware function that checks if the user has one of the allowed roles.
// Usage: router.delete('/:id', authenticate, authorize('admin'), deleteController)
// This means only admins can delete — sales users get 403 Forbidden.
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
      return;
    }
    next();
  };
};
