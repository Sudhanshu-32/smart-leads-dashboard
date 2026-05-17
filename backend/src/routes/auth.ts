import { Router } from 'express';
import { register, login, getMe, registerSchema, loginSchema } from '../controllers/authController';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me — protected, requires token
router.get('/me', authenticate, getMe);

export default router;
