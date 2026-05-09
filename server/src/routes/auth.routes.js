import express from 'express';
import { login, register, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no auth required)
router.post('/login', login);
router.post('/register', register);

// Protected routes (auth required)
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

export default router;
