// server/src/routes/authRoutes.ts
import express from 'express';
// We will create these controller functions in the next step
import { registerUser, loginUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;