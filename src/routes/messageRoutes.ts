import express from 'express';
import { createMessage, getMessages } from '../controllers/messageController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All message routes are protected
router.use(protect);

router.post('/create-message',createMessage)
router.get('/get-all-messages',getMessages)

export default router;