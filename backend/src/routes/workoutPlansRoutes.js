import express from 'express';
import { getWorkoutPlans } from '../controllers/workoutPlansController.js';

const router = express.Router();

// Public route - no authentication required
router.get('/', getWorkoutPlans);

export default router;
