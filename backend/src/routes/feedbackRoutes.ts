import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  giveVideoFeedback,
  getUnseenFeedbacks,
  markFeedbacksAsSeen,
} from '../controllers/feedbackController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Manager: Give feedback on video
router.post('/:workLogId/video-feedback', authorize('MANAGER'), giveVideoFeedback);

// Employee: Get unseen feedbacks
router.get('/unseen', getUnseenFeedbacks);

// Employee: Mark feedbacks as seen
router.post('/mark-seen', markFeedbacksAsSeen);

export default router;

