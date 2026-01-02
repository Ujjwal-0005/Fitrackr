import mongoose from "mongoose";
import { Exercise } from "../models/Exercise.js";
/* -------------------------- helpers -------------------------- */

const toArray = (v) => {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    // support comma-separated or dot-separated strings
    const byComma = v.split(",").map(s => s.trim()).filter(Boolean);
    if (byComma.length > 1) return byComma;
    const byDot = v.split(".").map(s => s.trim()).filter(Boolean);
    if (byDot.length > 1) return byDot;
    return v ? [v.trim()] : [];
  }
  return [];
};

const sanitizeExercisePayload = (body, userIdForCreate) => {
  const {
    name,
    muscles = {},
    equipment,
    difficulty = "beginner",
    instructions,
    gifUrl,
    tags,
    met,
  } = body;

  return {
    ...(name ? { name: String(name).trim() } : {}),
    muscles: {
      primary: toArray(muscles.primary),
      secondary: toArray(muscles.secondary),
    },
    equipment: toArray(equipment),
    difficulty,
    instructions: toArray(instructions),
    gifUrl: gifUrl ? String(gifUrl).trim() : undefined,
    tags: toArray(tags),
    ...(met !== undefined ? { met: Number(met) } : {}),
    ...(userIdForCreate ? { createdBy: userIdForCreate } : {}),
  };
};

/* --------------------------- GET all -------------------------- */
// GET /api/v1/exercises?search=bench&muscle=chest&difficulty=beginner
export const getExercises = async (req, res) => {
  try {
    const { search, muscle, difficulty } = req.query;
    const query = {};

    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }
    if (muscle) {
      query.$or = [
        { "muscles.primary": { $regex: new RegExp(muscle, "i") } },
        { "muscles.secondary": { $regex: new RegExp(muscle, "i") } },
      ];
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const items = await Exercise.find(query).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (err) {
    console.error("getExercises failed:", err);
    res.status(500).json({ message: "Server error fetching exercises" });
  }
};

/* --------------------------- GET one -------------------------- */
export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid exercise id" });

    const ex = await Exercise.findById(id).lean();
    if (!ex) return res.status(404).json({ message: "Exercise not found" });
    res.json(ex);
  } catch (err) {
    console.error("getExerciseById failed:", err);
    res.status(500).json({ message: "Server error fetching exercise" });
  }
};

/* -------------------------- CREATE --------------------------- */
// POST /api/v1/exercises  (adminOnly)
export const createExercise = async (req, res) => {
  try {
    const data = sanitizeExercisePayload(req.body, req.user?._id);

    // basic validation
    if (!data.name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!data.muscles?.primary?.length) {
      return res
        .status(400)
        .json({ message: "At least one primary muscle is required" });
    }

    // ensure uniqueness by name
    const existing = await Exercise.findOne({ name: data.name });
    if (existing) {
      return res.status(400).json({ message: "Exercise already exists" });
    }

    const ex = await Exercise.create(data);
    res.status(201).json({ message: "Exercise created", exercise: ex });
  } catch (err) {
    console.error("createExercise failed:", err);
    // surface mongoose validation errors nicely
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error creating exercise" });
  }
};

/* --------------------------- UPDATE -------------------------- */
// PUT /api/v1/exercises/:id  (adminOnly)
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid exercise id" });

    const data = sanitizeExercisePayload(req.body);

    const ex = await Exercise.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!ex) return res.status(404).json({ message: "Exercise not found" });
    res.json({ message: "Exercise updated", exercise: ex });
  } catch (err) {
    console.error("updateExercise failed:", err);
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server error updating exercise" });
  }
};

/* --------------------------- DELETE -------------------------- */
// DELETE /api/v1/exercises/:id  (adminOnly)
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid exercise id" });

    const ex = await Exercise.findByIdAndDelete(id);
    if (!ex) return res.status(404).json({ message: "Exercise not found" });

    res.json({ message: "Exercise deleted" });
  } catch (err) {
    console.error("deleteExercise failed:", err);
    res.status(500).json({ message: "Server error deleting exercise" });
  }
};
