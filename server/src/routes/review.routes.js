import express from 'express';
import { getReviews, getReviewByIdHandler, getReviewsByCompanyHandler, createReviewHandler, updateReviewHandler, deleteReviewHandler, getReviewsByMonthHandler, getRecentReviewsHandler } from '../controllers/review.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all reviews
router.get('/', getReviews);

// Get reviews by company
router.get('/company/:companyId', getReviewsByCompanyHandler);

// Get reviews by month
router.get('/month/:month', getReviewsByMonthHandler);

// Get recent reviews
router.get('/recent/all', getRecentReviewsHandler);

// Get review by ID
router.get('/:id', getReviewByIdHandler);

// Create review
router.post('/', createReviewHandler);

// Update review
router.put('/:id', updateReviewHandler);

// Delete review (founder only)
router.delete('/:id', founderOnly, deleteReviewHandler);

export default router;
