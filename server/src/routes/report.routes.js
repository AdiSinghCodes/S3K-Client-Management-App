import express from 'express';
import { getReports, getReportByIdHandler, getReportsByCompanyHandler, createReportHandler, updateReportHandler, deleteReportHandler, getDraftReportsHandler, getSentReportsHandler } from '../controllers/report.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { founderOnly } from '../middleware/role.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all reports
router.get('/', getReports);

// Get reports by company
router.get('/company/:companyId', getReportsByCompanyHandler);

// Get draft reports
router.get('/status/draft', getDraftReportsHandler);

// Get sent reports
router.get('/status/sent', getSentReportsHandler);

// Get report by ID
router.get('/:id', getReportByIdHandler);

// Create report
router.post('/', createReportHandler);

// Update report
router.put('/:id', updateReportHandler);

// Delete report (founder only)
router.delete('/:id', founderOnly, deleteReportHandler);

export default router;
