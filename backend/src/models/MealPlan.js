import mongoose from "mongoose";

const mealSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    readyInMinutes: { type: Number },
    servings: { type: Number },
    sourceUrl: { type: String }
}, { _id: false });

const daySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    name: { type: String },
    meals: [mealSchema]
}, { _id: false });

const preferencesSchema = new mongoose.Schema({
    targetCalories: { type: Number, required: true },
    diet: { type: String },
    exclude: [{ type: String }],
    cuisine: { type: String }
}, { _id: false });

const mealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    planId: {
        type: String,
        required: true,
        unique: true
    },
    duration: {
        type: String,
        required: true,
        enum: ["day", "week"]
    },
    preferences: {
        type: preferencesSchema,
        required: true
    },
    days: [daySchema],
    nutrition: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

export const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
