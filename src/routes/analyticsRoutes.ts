import express from 'express';
import { getTokenUsage } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.get('/token-usage', getTokenUsage);

export default router;