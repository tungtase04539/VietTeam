import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getMyAttendance,
  getAllAttendance,
  getAttendanceSummary,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayAttendance);
router.get('/my-records', getMyAttendance);

// Admin routes
router.get('/all', authorize('ADMIN'), getAllAttendance);
router.get('/summary', authorize('ADMIN'), getAttendanceSummary);

export default router;
