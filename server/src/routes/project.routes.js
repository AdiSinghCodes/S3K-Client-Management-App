import express from 'express';
import { getProjects, getProjectByIdHandler, getProjectsByCompanyHandler, createProjectHandler, updateProjectHandler, deleteProjectHandler } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all projects
router.get('/', getProjects);

// Get projects by company
router.get('/company/:companyId', getProjectsByCompanyHandler);

// Get project by ID
router.get('/:id', getProjectByIdHandler);

// Create project (founder only)
router.post('/', founderOnly, createProjectHandler);

// Update project (founder only)
router.put('/:id', founderOnly, updateProjectHandler);

// Delete project (founder only)
router.delete('/:id', founderOnly, deleteProjectHandler);

export default router;
