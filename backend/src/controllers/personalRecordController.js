import { PersonalRecord } from "../models/PersonalRecord.js";
import { Session } from "../models/Session.js";
// @desc  Get all PRs for current user
// @route GET /api/v1/prs
// @access Private
export const getMyPRs = async (req, res) => {
  try {
    const prs = await PersonalRecord.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(prs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Create or update a PR
// @route POST /api/v1/prs
// @access Private
export const upsertPR = async (req, res) => {
  try {
    const { kind, name, value, unit } = req.body;

    // Check if PR already exists for this exercise
    const existing = await PersonalRecord.findOne({
      userId: req.user._id,
      name,
      kind,
    });

    if (existing) {
      // Update if new value is better
      if (value > existing.value) {
        existing.value = value;
        existing.unit = unit;
        existing.date = new Date();
        await existing.save();
        return res.json({ message: "🎉 New PR! Record updated", pr: existing });
      } else {
        return res.json({ message: "Not a new PR", pr: existing });
      }
    }

    // Create new PR
    const pr = await PersonalRecord.create({
      userId: req.user._id,
      kind,
      name,
      value,
      unit,
    });

    res.status(201).json({ message: "✅ PR recorded!", pr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Delete a PR
// @route DELETE /api/v1/prs/:id
// @access Private
export const deletePR = async (req, res) => {
  try {
    const pr = await PersonalRecord.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!pr) return res.status(404).json({ message: "PR not found" });

    res.json({ message: "PR deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Auto-detect PRs from completed sessions
// @route POST /api/v1/prs/auto-detect
// @access Private
export const autoDetectPRs = async (req, res) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      status: "completed",
    }).sort({ date: -1 }).limit(10);

    const detectedPRs = [];

    for (const session of sessions) {
      for (const exercise of session.exercises) {
        if (!exercise.sets || exercise.sets.length === 0) continue;

        // Find max weight for this exercise
        const maxWeight = Math.max(...exercise.sets.map(s => s.weightKg || 0));
        
        if (maxWeight > 0) {
          const existing = await PersonalRecord.findOne({
            userId: req.user._id,
            name: exercise.nameSnapshot,
            kind: "strength",
          });

          if (!existing || maxWeight > existing.value) {
            const pr = await PersonalRecord.findOneAndUpdate(
              {
                userId: req.user._id,
                name: exercise.nameSnapshot,
                kind: "strength",
              },
              {
                value: maxWeight,
                unit: "kg",
                date: session.date,
              },
              { upsert: true, new: true }
            );
            detectedPRs.push(pr);
          }
        }
      }
    }

    res.json({
      message: `Detected ${detectedPRs.length} PRs`,
      prs: detectedPRs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
