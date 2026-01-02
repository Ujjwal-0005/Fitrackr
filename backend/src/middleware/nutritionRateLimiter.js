import { Meal } from "../models/Meal.js";
/**
 * Rate Limiter Middleware for CalorieNinjas API
 * Limits each user to 4 AI meal logging requests per day
 */

const DAILY_LIMIT = 4;

export const nutritionRateLimiter = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get today's date range (start and end of day in UTC)
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Count how many meals the user has logged today using AI
        // We'll track this by counting meals created today
        const todayMealCount = await Meal.countDocuments({
            userId,
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // Check if user has exceeded daily limit
        if (todayMealCount >= DAILY_LIMIT) {
            return res.status(429).json({
                message: `Daily limit reached. You can only log ${DAILY_LIMIT} meals per day using AI analysis.`,
                limit: DAILY_LIMIT,
                used: todayMealCount,
                resetTime: new Date(endOfDay).toISOString()
            });
        }

        // Add rate limit info to request for logging
        req.rateLimitInfo = {
            limit: DAILY_LIMIT,
            used: todayMealCount,
            remaining: DAILY_LIMIT - todayMealCount
        };

        next();
    } catch (error) {
        console.error('Rate limiter error:', error);
        // Don't block the request if rate limiter fails
        next();
    }
};
