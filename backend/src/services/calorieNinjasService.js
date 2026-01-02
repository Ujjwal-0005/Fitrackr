import axios from 'axios';
/**
 * CalorieNinjas API Service
 * Handles all interactions with the CalorieNinjas nutrition API
 */

const CALORIENINJAS_API_URL = 'https://api.calorieninjas.com/v1/nutrition';
const API_TIMEOUT = 10000; // 10 seconds

/**
 * Get nutrition data for a meal description
 * @param {string} mealDescription - Natural language meal description (e.g., "2 eggs and 1 bowl rice")
 * @returns {Promise<Object>} Aggregated nutrition data
 */
export const getNutritionData = async (mealDescription) => {
    try {
        // Validate API key
        const apiKey = process.env.CALORIENINJAS_API_KEY;
        if (!apiKey) {
            throw new Error('CalorieNinjas API key not configured');
        }

        // Sanitize input
        const sanitizedQuery = mealDescription.trim();
        if (!sanitizedQuery) {
            throw new Error('Meal description cannot be empty');
        }

        // Call CalorieNinjas API
        const response = await axios.get(CALORIENINJAS_API_URL, {
            params: { query: sanitizedQuery },
            headers: {
                'X-Api-Key': apiKey
            },
            timeout: API_TIMEOUT
        });

        // Check if we got valid data
        if (!response.data || !response.data.items || response.data.items.length === 0) {
            throw new Error('No nutrition data found for this meal');
        }

        // Aggregate nutrition values from all items
        const totals = response.data.items.reduce((acc, item) => {
            return {
                calories: acc.calories + (item.calories || 0),
                protein: acc.protein + (item.protein_g || 0),
                carbs: acc.carbs + (item.carbohydrates_total_g || 0),
                fat: acc.fat + (item.fat_total_g || 0)
            };
        }, {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        });

        // Round values to 1 decimal place
        return {
            calories: Math.round(totals.calories * 10) / 10,
            protein: Math.round(totals.protein * 10) / 10,
            carbs: Math.round(totals.carbs * 10) / 10,
            fat: Math.round(totals.fat * 10) / 10,
            itemsFound: response.data.items.length
        };

    } catch (error) {
        // Handle different error types
        if (error.response) {
            // API returned an error
            console.error('❌ CalorieNinjas API error:', error.response.status, error.response.data);
            throw new Error(`Nutrition API error: ${error.response.data.error || 'Unknown error'}`);
        } else if (error.request) {
            // Request made but no response
            console.error('❌ CalorieNinjas API timeout or network error:', error.message);
            throw new Error('Nutrition service unavailable. Please try again later.');
        } else {
            // Other errors (validation, etc.)
            console.error('❌ CalorieNinjas service error:', error.message);
            throw error;
        }
    }
};

/**
 * Validate meal description input
 * @param {string} description - Meal description to validate
 * @returns {boolean} True if valid
 */
export const validateMealDescription = (description) => {
    if (!description || typeof description !== 'string') {
        return false;
    }

    const trimmed = description.trim();
    if (trimmed.length < 2 || trimmed.length > 500) {
        return false;
    }

    return true;
};
