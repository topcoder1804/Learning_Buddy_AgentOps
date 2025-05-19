const Assignment = require('../models/Assignment');

// GET /api/assignments
exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('course')
      .populate('submissions.user');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/assignments/:id
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course')
      .populate('submissions.user');
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/assignments
exports.createAssignment = async (req, res) => {
  try {
    const { course, question, dueDate } = req.body;
    const now = new Date();
    const defaultDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const assignment = new Assignment({
      course,
      question,
      dueDate: dueDate ? new Date(dueDate) : defaultDue
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/assignments/:id
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    res.json({ msg: 'Assignment removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/assignments/:id/submission
exports.addSubmission = async (req, res) => {
  try {
    const { user, userAnswer, score } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ msg: 'Assignment not found' });
    assignment.submissions.push({ user, userAnswer, score, time: new Date() });
    assignment.status = 'Completed';  // or adjust logic as needed
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
