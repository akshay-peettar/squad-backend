import express from 'express';
import { createMessage } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All message routes are protected
router.use(protect);

router.post('/', createMessage);

export default router;