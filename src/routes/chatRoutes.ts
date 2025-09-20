import express from 'express';
import { addAgentToChat, createChat, getChatsForUser, getMessagesForChat, removeAgentFromChat } from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All chat routes are protected
router.use(protect);

router.post('/', createChat);
router.get('/', getChatsForUser);
router.get('/:chatId/messages', getMessagesForChat);
router.post('/:chatId/agents', addAgentToChat);
router.delete('/:chatId/agents/:agentId', removeAgentFromChat);

export default router;