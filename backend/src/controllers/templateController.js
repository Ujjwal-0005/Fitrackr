import { WorkoutTemplate } from "../models/WorkoutTemplate.js";
// @desc  Get all templates for current user
// @route GET /api/v1/templates
// @access Private
export const getMyTemplates = async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find({
      $or: [{ userId: req.user._id }, { isPublic: true }],
    }).sort({ createdAt: -1 });
    
    res.json(templates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Get single template
// @route GET /api/v1/templates/:id
// @access Private
export const getTemplateById = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });
    
    res.json(template);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Create new template
// @route POST /api/v1/templates
// @access Private
export const createTemplate = async (req, res) => {
  try {
    const { name, description, exercises, category, isPublic } = req.body;
    
    const template = await WorkoutTemplate.create({
      userId: req.user._id,
      name,
      description,
      exercises,
      category,
      isPublic,
    });
    
    res.status(201).json({ message: "Template created", template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Update template
// @route PUT /api/v1/templates/:id
// @access Private
export const updateTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!template) return res.status(404).json({ message: "Template not found or unauthorized" });
    
    res.json({ message: "Template updated", template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Delete template
// @route DELETE /api/v1/templates/:id
// @access Private
export const deleteTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    
    if (!template) return res.status(404).json({ message: "Template not found or unauthorized" });
    
    res.json({ message: "Template deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc  Increment usage count
// @route POST /api/v1/templates/:id/use
// @access Private
export const useTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findByIdAndUpdate(
      req.params.id,
      { $inc: { timesUsed: 1 } },
      { new: true }
    );
    
    if (!template) return res.status(404).json({ message: "Template not found" });
    
    res.json({ message: "Template usage recorded", template });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
