import express from 'express';
import { getUseCases, getUseCaseByIdHandler, getUseCasesByProjectHandler, getUseCasesByUserHandler, createUseCaseHandler, updateUseCaseHandler, deleteUseCaseHandler, getLiveUseCasesHandler } from '../controllers/usecase.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all use cases
router.get('/', getUseCases);

// Get use cases by project
router.get('/project/:projectId', getUseCasesByProjectHandler);

// Get live use cases
router.get('/live/all', getLiveUseCasesHandler);

// Get current user's use cases
router.get('/my/usecases', getUseCasesByUserHandler);

// Get use case by ID
router.get('/:id', getUseCaseByIdHandler);

// Create use case
router.post('/', createUseCaseHandler);

// Update use case
router.put('/:id', updateUseCaseHandler);

// Delete use case
router.delete('/:id', deleteUseCaseHandler);

export default router;
