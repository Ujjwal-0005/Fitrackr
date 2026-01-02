import mongoose from "mongoose";

const exerciseEntrySchema = new mongoose.Schema({
    exerciseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exercise",
    },
    name: {
        type: String,
        required: true,
    },
    sets: {
        type: Number,
        required: true,
        min: 1,
    },
    reps: {
        type: Number,
        min: 1,
    },
    weight: {
        type: Number,
        min: 0,
    },
    rpe: {
        type: Number,
        min: 1,
        max: 10,
    },
    duration: {
        type: Number, // in seconds
        min: 0,
    },
    rest: {
        type: Number, // in seconds
        default: 60,
    },
    notes: String,
});

const customWorkoutSessionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        goalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SmartGoal",
        },
        sessionName: {
            type: String,
            required: true,
            trim: true,
        },
        focus: {
            type: String,
            enum: ["push", "pull", "legs", "full_body", "custom"],
            default: "custom",
        },
        exercises: [exerciseEntrySchema],
        estimatedDuration: {
            type: Number, // in minutes
            default: 45,
        },
        lastUsed: Date,
        isTemplate: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Calculate estimated duration based on exercises
customWorkoutSessionSchema.methods.calculateDuration = function () {
    let totalSeconds = 0;

    this.exercises.forEach(exercise => {
        // Work time
        if (exercise.duration) {
            totalSeconds += exercise.duration * exercise.sets;
        } else {
            // Assume 3 seconds per rep
            totalSeconds += (exercise.reps || 10) * 3 * exercise.sets;
        }

        // Rest time
        totalSeconds += (exercise.rest || 60) * exercise.sets;
    });

    return Math.ceil(totalSeconds / 60); // Convert to minutes
};

// Update lastUsed timestamp
customWorkoutSessionSchema.methods.markAsUsed = function () {
    this.lastUsed = new Date();
    return this.save();
};

export const CustomWorkoutSession = mongoose.model(
    "CustomWorkoutSession",
    customWorkoutSessionSchema
);
