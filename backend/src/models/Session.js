import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
  // Strength fields
  reps: Number,
  weightKg: Number,

  // Cardio fields
  duration: Number, // minutes
  speed: Number, // km/h
  distance: Number, // km (calculated)
  caloriesBurned: Number,

  completed: { type: Boolean, default: false },
});

const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: mongoose.Schema.Types.ObjectId, ref: "Exercise", required: false }, // Optional - we use nameSnapshot for matching
  nameSnapshot: { type: String, required: true }, // Required - this is what we match on
  muscleSnapshot: [String],
  exerciseType: { type: String, enum: ['strength', 'cardio', 'core', 'flexibility', 'power'], default: 'strength' },
  sets: [setSchema],
  completed: { type: Boolean, default: false },
});

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, default: Date.now },
    startTime: { type: Date, default: Date.now },
    endTime: Date,
    durationMin: Number,
    calories: Number,
    status: {
      type: String,
      enum: ["in_progress", "completed", "cancelled", "abandoned"],
      default: "in_progress",
    },
    sessionType: {
      type: String,
      enum: ["plan", "custom", "smart"],
      default: "plan",
    },
    exercises: [exerciseSchema],
    customSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomWorkoutSession",
      required: false
    },
    customSessionTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomWorkoutSession",
      required: false
    },
    // Plan tracking fields for completion tracking
    planGoal: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'],
      required: false
    },
    planLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: false
    },
    dayNumber: {
      type: Number,
      required: false
    },
    notes: String,
  },
  { timestamps: true }
);

// Method to abandon a session
sessionSchema.methods.abandonSession = function () {
  this.status = "abandoned";
  this.endTime = new Date();
  return this.save();
};

// Static method to cleanup stale sessions (older than 24 hours)
sessionSchema.statics.cleanupStaleSessions = async function (userId) {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const staleSessions = await this.find({
    userId,
    status: "in_progress",
    startTime: { $lt: twentyFourHoursAgo }
  });

  for (const session of staleSessions) {
    await session.abandonSession();
  }

  return staleSessions.length;
};

export const Session = mongoose.model("Session", sessionSchema);
