import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc  Get all workout plans or filter by goal/level
// @route GET /api/v1/workout-plans
// @access Public
export const getWorkoutPlans = async (req, res) => {
    try {
        const { goal, level } = req.query;

        // Read workout plans from JSON file
        const plansPath = path.join(__dirname, '../../dataset/workout_plans.json');
        const plansData = fs.readFileSync(plansPath, 'utf-8');
        let plans = JSON.parse(plansData);

        // Filter by goal if provided
        if (goal) {
            plans = plans.filter(plan => plan.goal === goal);
        }

        // Filter by level if provided
        if (level) {
            plans = plans.filter(plan => plan.level === level);
        }

        res.json({
            success: true,
            count: plans.length,
            data: plans
        });
    } catch (error) {
        console.error('Error fetching workout plans:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch workout plans',
            error: error.message
        });
    }
};
