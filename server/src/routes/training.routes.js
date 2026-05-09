import express from 'express';
import { getTrainings, getTrainingByIdHandler, getTrainingsByCompanyHandler, createTrainingHandler, updateTrainingHandler, deleteTrainingHandler, getScheduledTrainingsHandler, getCompletedTrainingsHandler } from '../controllers/training.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all trainings
router.get('/', getTrainings);

// Get trainings by company
router.get('/company/:companyId', getTrainingsByCompanyHandler);

// Get scheduled trainings
router.get('/status/scheduled', getScheduledTrainingsHandler);

// Get completed trainings
router.get('/status/completed', getCompletedTrainingsHandler);

// Get training by ID
router.get('/:id', getTrainingByIdHandler);

// Create training
router.post('/', createTrainingHandler);

// Update training
router.put('/:id', updateTrainingHandler);

// Delete training
router.delete('/:id', deleteTrainingHandler);

export default router;
