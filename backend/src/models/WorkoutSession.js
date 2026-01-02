import mongoose from "mongoose";

const SetCompletionSchema = new mongoose.Schema({
  set: { type: Number, required: true },

  // Strength training fields
  weight: { type: Number, default: 0 }, // in kg or lbs
  reps: { type: Number, default: 0 },

  // Cardio fields
  duration: { type: Number, default: 0 }, // in minutes
  speed: { type: Number, default: 0 }, // km/h or mph
  distance: { type: Number, default: 0 }, // km or miles (calculated)
  caloriesBurned: { type: Number, default: 0 }, // calculated per set

  completed: { type: Boolean, default: false },
  restTaken: { type: Number, default: 0 }, // seconds
  timestamp: { type: Date, default: Date.now }
});

const ExerciseProgressSchema = new mongoose.Schema({
  exerciseId: { type: String, required: true },
  exerciseName: { type: String, required: true },
  exerciseType: { type: String, enum: ['strength', 'cardio', 'core', 'flexibility', 'power'], default: 'strength' },

  // Strength fields
  targetSets: { type: Number },
  targetReps: { type: Number },

  // Cardio fields
  targetDuration: { type: Number }, // minutes
  targetDistance: { type: Number }, // km

  restSec: { type: Number, default: 60 },
  setsCompleted: [SetCompletionSchema],
  isCompleted: { type: Boolean, default: false },
  notes: { type: String }
});

const WorkoutSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  focus: {
    type: String, // e.g., "Push Day", "Cardio", "Full Body"
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  timerRunning: {
    type: Boolean,
    default: false
  },
  elapsedTime: {
    type: Number, // in seconds
    default: 0
  },
  exercises: [ExerciseProgressSchema],
  status: {
    type: String,
    enum: ["active", "paused", "completed", "abandoned"],
    default: "active"
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  totalVolume: {
    type: Number, // sum of weight × reps
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  sessionNotes: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate completion percentage
WorkoutSessionSchema.methods.calculateCompletion = function () {
  if (this.exercises.length === 0) return 0;

  const completedExercises = this.exercises.filter(ex => ex.isCompleted).length;
  return Math.round((completedExercises / this.exercises.length) * 100);
};

// Calculate total volume
WorkoutSessionSchema.methods.calculateVolume = function () {
  let volume = 0;
  this.exercises.forEach(exercise => {
    exercise.setsCompleted.forEach(set => {
      if (set.completed) {
        volume += set.weight * set.reps;
      }
    });
  });
  return volume;
};

// Calculate calories burned (rough estimate)
WorkoutSessionSchema.methods.calculateCalories = function () {
  // Rough formula: duration (minutes) × MET × body weight (kg) × 0.0175
  // Assuming average MET of 6 for strength training
  const durationMinutes = this.elapsedTime / 60;
  const avgMET = 6;
  const avgBodyWeight = 75; // kg (can be user-specific later)
  return Math.round(durationMinutes * avgMET * avgBodyWeight * 0.0175);
};

// Calculate calories for cardio exercises
WorkoutSessionSchema.methods.calculateCardioCalories = function (exerciseMET, duration, bodyWeight = 75) {
  // Formula: duration (hours) × MET × body weight (kg)
  const durationHours = duration / 60;
  const met = exerciseMET || 8; // Default MET for cardio

  return Math.round(durationHours * met * bodyWeight);
};

export default mongoose.model("WorkoutSession", WorkoutSessionSchema);
