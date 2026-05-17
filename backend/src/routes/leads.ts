import { Router } from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  createLeadSchema,
  updateLeadSchema,
} from '../controllers/leadController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

// GET  /api/leads?status=New&source=Website&search=rahul&page=1
// GET  /api/leads/export/csv    ← must be BEFORE /:id or Express sees 'export' as an id
router.get('/export/csv', exportLeadsCSV);

router.get('/', getLeads);
router.get('/:id', getLead);
router.post('/', validate(createLeadSchema), createLead);
router.put('/:id', validate(updateLeadSchema), updateLead);

// Only admins can delete — authorize() adds a second check after authenticate
router.delete('/:id', authorize('admin'), deleteLead);

export default router;
