import express from 'express';
import { getCosts, getCostByIdHandler, getCostsByCompanyHandler, createCostHandler, updateCostHandler, deleteCostHandler, getCostsLastNMonthsHandler, getMonthlyTotalsHandler } from '../controllers/cost.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// All cost endpoints are founder only
router.use(founderOnly);

// Get all costs
router.get('/', getCosts);

// Get costs by company
router.get('/company/:companyId', getCostsByCompanyHandler);

// Get costs for last N months
router.get('/history/:n', getCostsLastNMonthsHandler);

// Get monthly totals
router.get('/totals/all', getMonthlyTotalsHandler);

// Get cost by ID
router.get('/:id', getCostByIdHandler);

// Create cost
router.post('/', createCostHandler);

// Update cost
router.put('/:id', updateCostHandler);

// Delete cost
router.delete('/:id', deleteCostHandler);

export default router;
