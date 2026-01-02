import { User } from "../models/User.js";
// Helper function to handle API calls with exponential backoff for resilience
const fetchWithBackoff = async (url, options, maxRetries = 5) => {
    let lastError = null;
    for (let i = 0; i < maxRetries; i++) {
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s, 8s, 16s
        try {
            const response = await fetch(url, options);

            // Check if the response is successful (200-299)
            if (response.ok) {
                return response;
            }

            // For rate limits (429) or transient server errors (5xx), retry.
            if (response.status === 429 || response.status >= 500) {
                lastError = new Error(`Attempt ${i + 1} failed with status: ${response.status}`);
                // console.warn(`Retrying in ${delay / 1000}s...`); // Keep logs clean
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // For non-retryable errors (4xx client errors), stop and throw
            const errorBody = await response.text();
            throw new Error(`API call failed with status ${response.status}: ${errorBody}`);
        } catch (error) {
            if (i < maxRetries - 1) {
                lastError = error;
                // console.warn(`Retrying after network error in ${delay / 1000}s...`); // Keep logs clean
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            } else {
                throw error; // Throw after max retries
            }
        }
    }
    throw lastError; // Should throw the last encountered error
};

/**
 * AI Workout Plan Generator Controller
 * - Uses gemini-2.5-flash-preview-09-2025 model via direct fetch API with backoff
 * - Automatically saves the generated plan to user's profile
 * - Includes fallback logic in case of API failure
 */
export const generateWorkoutPlan = async (req, res) => {
    // Note: apiKey is assumed to be available as process.env.GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            message: "Gemini API Key missing from environment variables.",
        });
    }

    try {
        // 1. Fetch user
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found." });

        // Get custom parameters from request body
        const { goal, duration, difficulty, focusArea } = req.body;

        // API Setup
        const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

        // 2. Build personalized prompt with custom parameters
        const userGoal = goal || user.goals?.find((g) => g.isActive)?.type || "general fitness";
        const planDuration = parseInt(duration) || 7;

        const prompt = `
            Create a personalized ${planDuration}-day workout plan for:
            - Name: ${user.name}
            - Age: ${user.onboarding?.age || "N/A"}
            - Weight: ${user.onboarding?.weightKg || "N/A"} kg
            - Height: ${user.onboarding?.heightCm || "N/A"} cm
            - Gender: ${user.onboarding?.sex || "N/A"}
            - Primary Goal: ${userGoal}
            - Difficulty Level: ${difficulty || "intermediate"}
            - Focus Area: ${focusArea || "full body"}
            - Diet: ${user.onboarding?.diet || "N/A"}
            - Equipment: ${(user.onboarding?.equipment || []).join(", ") || "none"}
            - Activity level: ${user.onboarding?.activityLevel || "moderate"}

            Include:
            - ${planDuration} days with appropriate day names
            - 3–5 exercises per day tailored to the focus area
            - Sets, reps, rest time appropriate for ${difficulty || "intermediate"} level
            - Calories burned per day
            - Short motivational weekly tip
            
            Strictly return only JSON (no markdown, no explanation).
        `;

        // 3. Define JSON response schema and payload
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                // Ensure the model returns application/json content type
                responseMimeType: "application/json",
                // Provide a schema for robust output structure
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        summary: { type: "STRING", description: "A motivational introductory paragraph." },
                        days: {
                            type: "ARRAY",
                            description: "The 7-day workout plan details.",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    day: { type: "STRING", enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
                                    focus: { type: "STRING" },
                                    calories: { type: "STRING", description: "Estimated calories burned, e.g., '250-350'" },
                                    exercises: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                name: { type: "STRING" },
                                                sets: { type: "STRING" },
                                                reps: { type: "STRING" },
                                                rest: { type: "STRING" },
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        weeklyTip: { type: "STRING", description: "A short, motivational tip for the week." }
                    }
                }
            }
        };

        // 4. Generate AI content using fetch with backoff
        const apiResponse = await fetchWithBackoff(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await apiResponse.json();

        // 5. Extract and Parse clean JSON
        const planText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!planText) {
            throw new Error("AI response was empty or malformed.");
        }

        const planJson = JSON.parse(planText.trim());

        // 6. Save plan to user document
        user.plans.push({
            title: `AI Plan - ${new Date().toLocaleDateString()}`,
            summary: planJson.summary,
            aiPlan: planJson,
        });
        await user.save();

        // 7. Return response
        res.status(200).json({
            message: "AI workout plan generated successfully.",
            plan: planJson,
        });
    } catch (err) {
        console.error("❌ AI generation failed, falling back:", err.message);

        // 🔁 Fallback: Generate a local static plan if Gemini fails
        const fallbackPlan = {
            summary: "Fallback 7-day workout plan (AI unavailable).",
            days: [
                {
                    day: "Monday",
                    focus: "Full Body Strength",
                    calories: "250-350",
                    exercises: [
                        { name: "Push-Ups", sets: "3", reps: "12-15", rest: "60s" },
                        { name: "Bodyweight Squats", sets: "3", reps: "15", rest: "60s" },
                        { name: "Plank", sets: "3", reps: "45s", rest: "30s" },
                    ],
                },
                {
                    day: "Tuesday",
                    focus: "Cardio + Core",
                    calories: "200-300",
                    exercises: [
                        { name: "Jump Rope", sets: "4", reps: "1 min", rest: "30s" },
                        { name: "Mountain Climbers", sets: "3", reps: "40", rest: "45s" },
                    ],
                },
                {
                    day: "Wednesday",
                    focus: "Lower Body Strength",
                    calories: "220-340",
                    exercises: [
                        { name: "Lunges", sets: "3", reps: "12/leg", rest: "60s" },
                        { name: "Glute Bridge", sets: "3", reps: "15", rest: "45s" },
                    ],
                },
                {
                    day: "Thursday",
                    focus: "Active Recovery",
                    calories: "150-200",
                    exercises: [
                        { name: "Yoga Stretch", sets: "3", reps: "5 min", rest: "1 min" },
                        { name: "Brisk Walk", sets: "1", reps: "20 min", rest: "—" },
                    ],
                },
                {
                    day: "Friday",
                    focus: "Upper Body Strength",
                    calories: "250-350",
                    exercises: [
                        { name: "Pull-Ups", sets: "3", reps: "Max", rest: "90s" },
                        { name: "Shoulder Press", sets: "3", reps: "10", rest: "60s" },
                    ],
                },
                {
                    day: "Saturday",
                    focus: "Cardio Blast",
                    calories: "300-400",
                    exercises: [
                        { name: "Burpees", sets: "3", reps: "15", rest: "60s" },
                        { name: "Running", sets: "1", reps: "20 min", rest: "—" },
                    ],
                },
                {
                    day: "Sunday",
                    focus: "Rest & Mobility",
                    calories: "100-150",
                    exercises: [
                        { name: "Foam Rolling", sets: "1", reps: "10 min", rest: "—" },
                    ],
                },
            ],
            weeklyTip: "Every rep brings you closer to your goal — stay consistent!",
        };

        res.status(200).json({
            message: "AI unavailable — fallback plan generated.",
            plan: fallbackPlan,
        });
    }
};
export const getUserPlans = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json(user.plans || []);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch plans", error: err.message });
    }
};

export const deleteUserPlan = async (req, res) => {
    try {
        const { planId } = req.params;
        const user = await User.findById(req.user._id);
        user.plans = user.plans.filter((_, idx) => idx.toString() !== planId);
        await user.save();
        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete plan", error: err.message });
    }
};
