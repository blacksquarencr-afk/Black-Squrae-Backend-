import express from 'express';
import {
  getAllSiteVisits,
  getSiteVisitStats,
  createSiteVisit,
  updateSiteVisit,
  completeVisit,
  cancelVisit,
  deleteSiteVisit
} from '../controllers/siteVisitController.js';
import { verifyEmployeeToken } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyEmployeeToken);

// Get all site visits with filters
router.get('/', getAllSiteVisits);

// Get site visit statistics
router.get('/stats', getSiteVisitStats);

// Create new site visit
router.post('/', createSiteVisit);

// Update site visit
router.put('/:id', updateSiteVisit);

// Mark visit as completed
router.put('/:id/complete', completeVisit);

// Cancel visit
router.put('/:id/cancel', cancelVisit);

// Delete site visit
router.delete('/:id', deleteSiteVisit);

export default router;
