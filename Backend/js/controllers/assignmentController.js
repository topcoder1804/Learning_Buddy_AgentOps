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

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.generateAssignment = async (req, res) => {
  const { topic, course, dueDate } = req.body;
  const prompt = `
Generate 5 descriptive assignment-style questions on the topic: "${topic}".
The questions should encourage critical thinking and explanation.
Return only the questions as a numbered list.
  `;
  try {
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "system",
          content: "You are an educational assistant creating assignment questions."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const questionsText = response.choices[0].message.content.trim();
    const questions = questionsText.split(/\n\d+\.\s/).filter(q => q.trim() !== "");
    if (questions.length && questions[0].trim() === "") questions.shift();

    // Optionally, create assignments in DB for each question:
    const now = new Date();
    const defaultDue = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const due = dueDate ? new Date(dueDate) : defaultDue;

    const assignments = await Promise.all(
      questions.map(async (question) => {
        const assignment = new Assignment({
          course,
          question,
          dueDate: due
        });
        await assignment.save();
        return assignment;
      })
    );

    res.status(201).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
