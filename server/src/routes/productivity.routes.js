import express from 'express';
import { getProductivityLogs, getProductivityLogByIdHandler, getProductivityLogsByUserHandler, createProductivityLogHandler, updateProductivityLogHandler, deleteProductivityLogHandler, getTopPerformersHandler, getAverageProductivityForUserHandler } from '../controllers/productivity.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all productivity logs (founder only)
router.get('/', founderOnly, getProductivityLogs);

// Get productivity logs by user
router.get('/user/:userId', getProductivityLogsByUserHandler);

// Get top performers (founder only)
router.get('/analytics/top', founderOnly, getTopPerformersHandler);

// Get average productivity for user
router.get('/analytics/avg/:userId', getAverageProductivityForUserHandler);

// Get productivity log by ID
router.get('/:id', getProductivityLogByIdHandler);

// Create productivity log
router.post('/', createProductivityLogHandler);

// Update productivity log
router.put('/:id', updateProductivityLogHandler);

// Delete productivity log (founder only)
router.delete('/:id', founderOnly, deleteProductivityLogHandler);

export default router;
