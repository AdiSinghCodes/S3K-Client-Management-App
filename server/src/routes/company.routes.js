import express from 'express';
import { getCompanies, getCompanyByIdHandler, createCompanyHandler, updateCompanyHandler, deleteCompanyHandler, assignTeamMember, getActiveCompaniesHandler } from '../controllers/company.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all companies
router.get('/', getCompanies);

// Get active companies
router.get('/active', getActiveCompaniesHandler);

// Get company by ID
router.get('/:id', getCompanyByIdHandler);

// Create company (all authenticated users - team members can create their own)
router.post('/', createCompanyHandler);

// Update company (founder only)
router.put('/:id', founderOnly, updateCompanyHandler);

// Delete company (founder only)
router.delete('/:id', founderOnly, deleteCompanyHandler);

// Assign team member to company (founder only)
router.post('/:companyId/assign-team', founderOnly, assignTeamMember);

export default router;
