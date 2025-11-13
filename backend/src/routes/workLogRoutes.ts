import { Router } from 'express';
import {
  createWorkLog,
  getMyWorkLogs,
  getAllWorkLogs,
  updateWorkLog,
  deleteWorkLog,
  getWorkLogStats,
} from '../controllers/workLogController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', createWorkLog);
router.get('/my-logs', getMyWorkLogs);
router.put('/:id', updateWorkLog);
router.delete('/:id', deleteWorkLog);

// Admin routes
router.get('/all', authorize('ADMIN'), getAllWorkLogs);
router.get('/stats', authorize('ADMIN'), getWorkLogStats);

export default router;
