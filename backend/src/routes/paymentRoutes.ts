import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { calculateEarnings, getMyEarnings } from '../controllers/paymentController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin: Calculate earnings for all employees
router.get('/calculate', authorize('ADMIN'), calculateEarnings);

// Employee/Manager: Get my earnings
router.get('/my-earnings', getMyEarnings);

export default router;

