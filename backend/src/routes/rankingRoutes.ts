import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAllRankings, getTeamRankings } from '../controllers/rankingController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Admin: Get all employee rankings (multi-category)
router.get('/all', authorize('ADMIN'), getAllRankings);

// Manager: Get team rankings (simple output-based)
router.get('/team', authorize('MANAGER'), getTeamRankings);

export default router;

