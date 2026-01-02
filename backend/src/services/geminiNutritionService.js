import { GoogleGenerativeAI } from "@google/generative-ai";
/**
 * Gemini Nutrition Service
 * Uses Google's Gemini API to analyze meal descriptions and estimate nutrition data
 */

class GeminiNutritionService {
    constructor() {
        this.genAI = null;
        this.initialized = false;
    }

    /**
     * Initialize the Gemini API client (lazy initialization)
     */
    initialize() {
        if (this.initialized) return;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('⚠️ GEMINI_API_KEY not found in environment variables');
            throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
        }

        console.log('✅ Gemini API key found, initializing service...');
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.initialized = true;
    }

    /**
     * Analyze a meal description and return estimated nutrition data
     * @param {string} mealDescription - Description of the meal
     * @returns {Promise<{calories: number, protein: number, carbs: number, fat: number}>}
     */
    async analyzeMeal(mealDescription) {
        // Lazy initialization - ensures env vars are loaded
        this.initialize();

        if (!this.genAI) {
            throw new Error('Gemini API is not configured. Please set GEMINI_API_KEY in environment variables.');
        }

        const prompt = `You are a nutrition expert. Analyze the following meal and estimate its nutritional content.

Meal: "${mealDescription}"

Provide ONLY a JSON response with the following structure (no markdown, no explanation):
{
  "calories": <number>,
  "protein": <number in grams>,
  "carbs": <number in grams>,
  "fat": <number in grams>
}

Be realistic with portion sizes. If the meal description doesn't specify quantity, assume a standard serving size.`;

        try {
            console.log('🔵 Gemini Request:', { mealDescription });

            // Get the model
            const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

            // Generate content
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log('🟢 Gemini Response:', text);

            // ROBUST JSON EXTRACTION using regex
            // Find the first '{' and last '}' to isolate JSON object
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.error('❌ No JSON object found in Gemini response');
                throw new Error('No JSON object found in Gemini response');
            }

            const jsonText = jsonMatch[0];

            // Parse JSON
            const nutritionData = JSON.parse(jsonText);

            // Validate response structure
            if (!this.isValidNutritionData(nutritionData)) {
                throw new Error('Invalid nutrition data structure from Gemini');
            }

            // Round values to 1 decimal place
            return {
                calories: Math.round(nutritionData.calories),
                protein: Math.round(nutritionData.protein * 10) / 10,
                carbs: Math.round(nutritionData.carbs * 10) / 10,
                fat: Math.round(nutritionData.fat * 10) / 10
            };

        } catch (error) {
            console.error('❌ Gemini API Error:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);

            if (error.response) {
                console.error('Error response:', error.response);
            }

            if (error instanceof SyntaxError) {
                throw new Error('Failed to parse nutrition data from Gemini response');
            }

            throw new Error(`Gemini API error: ${error.message}`);
        }
    }

    /**
     * Validate nutrition data structure
     * @param {object} data - Data to validate
     * @returns {boolean}
     */
    isValidNutritionData(data) {
        return (
            data &&
            typeof data.calories === 'number' &&
            typeof data.protein === 'number' &&
            typeof data.carbs === 'number' &&
            typeof data.fat === 'number' &&
            data.calories >= 0 &&
            data.protein >= 0 &&
            data.carbs >= 0 &&
            data.fat >= 0
        );
    }
}

// Export singleton instance
export const geminiNutritionService = new GeminiNutritionService();
