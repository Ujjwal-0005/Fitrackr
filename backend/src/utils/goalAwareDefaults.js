/**
 * Get goal-aware training defaults based on goal type
 */
export const getGoalBasedDefaults = (goalType) => {
    const defaults = {
        fat_loss: {
            suggestedFrequency: 5,
            suggestedSplit: "upper_lower",
            repRange: [12, 15],
            restSeconds: 60,
            setsPerExercise: 3,
            sessionDuration: 45,
            emphasis: "Volume + energy expenditure",
            tips: [
                "Shorter rest periods",
                "Consider circuit training",
                "Optional cardio blocks",
            ],
        },
        muscle_gain: {
            suggestedFrequency: 4,
            suggestedSplit: "push_pull_legs",
            repRange: [8, 12],
            restSeconds: 90,
            setsPerExercise: 4,
            sessionDuration: 60,
            emphasis: "Hypertrophy",
            tips: [
                "Focus on progressive overload",
                "Higher weekly sets per muscle",
                "Moderate rest periods",
            ],
        },
        strength: {
            suggestedFrequency: 4,
            suggestedSplit: "upper_lower",
            repRange: [3, 6],
            restSeconds: 180,
            setsPerExercise: 5,
            sessionDuration: 75,
            emphasis: "Intensity",
            tips: [
                "Track %1RM or RPE",
                "Longer rest periods",
                "Lower rep ranges",
            ],
        },
        endurance: {
            suggestedFrequency: 5,
            suggestedSplit: "full_body",
            repRange: [15, 20],
            restSeconds: 45,
            setsPerExercise: 3,
            sessionDuration: 50,
            emphasis: "Time-based",
            tips: [
                "Focus on duration/distance",
                "Shorter rest periods",
                "Higher rep ranges",
            ],
        },
        general_fitness: {
            suggestedFrequency: 3,
            suggestedSplit: "full_body",
            repRange: [10, 12],
            restSeconds: 60,
            setsPerExercise: 3,
            sessionDuration: 45,
            emphasis: "Balanced",
            tips: [
                "Mix of strength and cardio",
                "Moderate intensity",
                "Consistent frequency",
            ],
        },
    };

    return defaults[goalType] || defaults.general_fitness;
};

/**
 * Get suggested exercises based on focus and goal type
 */
export const getSuggestedExercises = (focus, goalType) => {
    const exercisesByFocus = {
        push: [
            "Bench Press",
            "Overhead Press",
            "Incline Dumbbell Press",
            "Dips",
            "Tricep Extensions",
        ],
        pull: [
            "Pull-ups",
            "Barbell Rows",
            "Lat Pulldowns",
            "Face Pulls",
            "Bicep Curls",
        ],
        legs: [
            "Squats",
            "Romanian Deadlifts",
            "Leg Press",
            "Lunges",
            "Leg Curls",
        ],
        full_body: [
            "Squats",
            "Bench Press",
            "Deadlifts",
            "Overhead Press",
            "Rows",
        ],
    };

    return exercisesByFocus[focus] || [];
};
