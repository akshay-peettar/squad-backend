import express from 'express';
import { createUserAgent, getBaseAiModels, getUserAgents } from '../controllers/agentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);

router.post('/create-user-agent', createUserAgent);
router.get('/get-user-agents',getUserAgents)
router.get('/get-base-models', getBaseAiModels);

export default router;