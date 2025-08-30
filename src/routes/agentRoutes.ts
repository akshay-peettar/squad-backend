import express from 'express';
import { createUserAgent, getUserAgents } from '../controllers/agentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/create-user-agent', createUserAgent);
router.get('/get-user-agents',getUserAgents)


export default router;