import express from 'express';
import { getUsers, getUserByIdHandler, createUserHandler, updateUserHandler, deleteUserHandler } from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all users (founder only)
router.get('/', founderOnly, getUsers);

// Get user by ID (founder only)
router.get('/:id', founderOnly, getUserByIdHandler);

// Create user (founder only)
router.post('/', founderOnly, createUserHandler);

// Update user (founder only)
router.put('/:id', founderOnly, updateUserHandler);

// Delete user (founder only)
router.delete('/:id', founderOnly, deleteUserHandler);

export default router;
