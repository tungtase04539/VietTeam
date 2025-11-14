import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createTeam,
  getAllTeams,
  getMyTeam,
  addEmployeeToTeam,
  removeEmployeeFromTeam,
  updateTeam,
  deleteTeam,
  assignWorkLog,
} from '../controllers/teamController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin only routes
router.post('/', authorize('ADMIN'), createTeam);
router.get('/all', authorize('ADMIN'), getAllTeams);
router.put('/:id', authorize('ADMIN'), updateTeam);
router.delete('/:id', authorize('ADMIN'), deleteTeam);
router.post('/:teamId/members', authorize('ADMIN'), addEmployeeToTeam);
router.delete('/members/:employeeId', authorize('ADMIN'), removeEmployeeFromTeam);

// Manager and Employee routes
router.get('/my-team', getMyTeam);

// Manager only routes
router.post('/assign-work', authorize('MANAGER'), assignWorkLog);

export default router;
