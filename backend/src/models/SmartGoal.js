import mongoose from "mongoose";

// 🎯 SMART GOAL MODEL - Calculation-Driven & Time-Based
const smartGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ========== USER STATS (at goal creation) ==========
    userStats: {
      currentWeight: { type: Number, required: true }, // kg
      height: { type: Number, required: true },        // cm
      age: { type: Number, required: true },
      gender: { type: String, enum: ['male', 'female'], required: true },
      activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'high'],
        required: true
      },
    },

    // ========== GOAL DEFINITION ==========
    type: {
      type: String,
      enum: ["fat_loss", "muscle_gain", "strength", "endurance"],
      required: true,
    },

    targetWeight: { type: Number }, // Required for fat_loss, muscle_gain
    durationWeeks: { type: Number, required: true, min: 4, max: 24 },
    workoutsPerWeek: { type: Number, required: true, min: 3, max: 6 },

    // Auto-generated statement
    statement: { type: String },

    // ========== CALCULATED VALUES (auto-generated) ==========
    calculations: {
      bmr: { type: Number }, // Basal Metabolic Rate
      tdee: { type: Number }, // Total Daily Energy Expenditure
      dailyCalorieTarget: { type: Number },
      dailyProteinTarget: { type: Number },
      expectedWeeklyWeightChange: { type: Number }, // Can be negative (fat loss) or positive (muscle gain)
    },

    // ========== TIME-BASED TRACKING ==========
    timeline: {
      goalStartDate: { type: Date, default: Date.now },
      goalEndDate: { type: Date },
      durationWeeks: { type: Number },
    },

    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },

    completionDate: { type: Date },
    completionReason: {
      type: String,
      enum: ['target_reached', 'duration_ended_success', 'duration_ended_incomplete', 'abandoned']
    },

    // ========== WEEKLY MILESTONES ==========
    weeklyMilestones: [{
      week: { type: Number },
      expectedWeight: { type: Number },
      actualWeight: { type: Number },
      caloriesConsumed: { type: Number, default: 0 },
      caloriesBurned: { type: Number, default: 0 },
    }],

    // ========== PROGRESS TRACKING ==========
    progress: {
      // Nutrition
      nutritionContribution: {
        avgDailyCalories: { type: Number, default: 0 },
        avgDailyProtein: { type: Number, default: 0 },
        targetCalories: { type: Number },
        targetProtein: { type: Number },
        calorieCompliance: { type: Number, default: 0 }, // 0-100
        proteinCompliance: { type: Number, default: 0 }, // 0-100
      },

      // Workouts
      workoutContribution: {
        sessionsCompleted: { type: Number, default: 0 },
        sessionsPlanned: { type: Number },
        adherencePercent: { type: Number, default: 0 }, // 0-100
        volumeScore: { type: Number, default: 0 }, // 0-100
        progressiveOverloadTrend: { type: Number, default: 0 }, // -100 to +100
      },

      // Overall
      goalAlignmentScore: { type: Number, default: 0, min: 0, max: 100 },
      currentStatus: {
        type: String,
        enum: ['ahead', 'on_track', 'behind', 'stalled'],
        default: 'on_track',
      },

      lastCalculated: { type: Date, default: Date.now },
    },

    // ========== CONSTRAINTS ==========
    constraints: {
      equipment: [String],
      location: String,
      injuries: [String],
    },

    // ========== ADAPTATIONS HISTORY ==========
    adaptations: [{
      date: { type: Date, default: Date.now },
      reason: String,
      note: String,
    }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ========== METHODS ==========

// Calculate expected progress based on time elapsed
smartGoalSchema.methods.calculateExpectedProgress = function () {
  const now = new Date();
  const elapsed = now - this.timeline.goalStartDate;
  const total = this.timeline.goalEndDate - this.timeline.goalStartDate;
  const percentElapsed = Math.min(100, (elapsed / total) * 100);

  return {
    percentElapsed: Math.round(percentElapsed),
    daysElapsed: Math.floor(elapsed / (1000 * 60 * 60 * 24)),
    daysRemaining: Math.max(0, Math.ceil((this.timeline.goalEndDate - now) / (1000 * 60 * 60 * 24))),
  };
};

// Generate goal statement
smartGoalSchema.methods.generateStatement = function () {
  const goalTypeLabels = {
    fat_loss: 'Lose',
    muscle_gain: 'Gain',
    strength: 'Build Strength',
    endurance: 'Improve Endurance',
  };

  if (this.type === 'fat_loss' || this.type === 'muscle_gain') {
    const weightChange = Math.abs(this.targetWeight - this.userStats.currentWeight);
    return `${goalTypeLabels[this.type]} ${weightChange}kg in ${this.durationWeeks} weeks, training ${this.workoutsPerWeek}x/week`;
  } else {
    return `${goalTypeLabels[this.type]} in ${this.durationWeeks} weeks, training ${this.workoutsPerWeek}x/week`;
  }
};

export const SmartGoal = mongoose.model("SmartGoal", smartGoalSchema);
