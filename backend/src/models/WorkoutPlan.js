import mongoose from "mongoose";

// 📅 WORKOUT PLAN (Generated from Goal)
const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SmartGoal",
      required: true,
    },
    
    weekNumber: Number, // which week of the program
    
    // Weekly Structure
    sessions: [
      {
        dayOfWeek: Number, // 0-6
        type: String,      // "upper", "lower", "push", "pull", "legs", "full_body"
        focus: String,     // "strength", "hypertrophy", "conditioning"
        exercises: [
          {
            exerciseId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Exercise",
            },
            name: String,
            targetSets: Number,
            targetReps: [Number, Number], // range
            targetRPE: Number,
            targetWeight: Number,
            restSeconds: Number,
            notes: String,
            order: Number,
          },
        ],
        estimatedDuration: Number, // minutes
        completed: { type: Boolean, default: false },
        completedAt: Date,
      },
    ],
    
    // Adaptation Flags
    isAdapted: { type: Boolean, default: false },
    adaptationReason: String,
    
    // Volume Tracking
    weeklyVolume: {
      totalSets: Number,
      totalReps: Number,
      totalWeight: Number, // kg lifted
    },
  },
  { timestamps: true }
);

// Calculate total weekly volume
workoutPlanSchema.methods.calculateVolume = function () {
  let totalSets = 0;
  let totalReps = 0;
  
  this.sessions.forEach((session) => {
    session.exercises.forEach((ex) => {
      totalSets += ex.targetSets;
      totalReps += ex.targetSets * ((ex.targetReps[0] + ex.targetReps[1]) / 2);
    });
  });
  
  this.weeklyVolume = {
    totalSets,
    totalReps,
    totalWeight: 0, // calculated from completed sessions
  };
};

export const WorkoutPlan = mongoose.model("WorkoutPlan", workoutPlanSchema);
