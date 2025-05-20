const Assignment = require('../models/Assignment');

const Groq = require('groq-sdk');
const Course = require('../models/Course');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
    const { answer } = req.body
    const assignment = await Assignment.findById(req.params.id)
    if (!assignment) {
      return res.status(404).json({ msg: 'Assignment not found' })
    }

    // 1) Grab the original question
    const questionText = assignment.question

    // 2) Ask Groq to grade it from 0–100
    const gradingPrompt = `
You are an expert grader. 
Grade the student’s answer on a scale from 0 to 100 (integer only).
Question: "${questionText}"
Student Answer: "${answer}"
Respond with only the numeric score.
    `.trim()

    const gradingRes = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        { role: "system", content: "You are an expert grader." },
        { role: "user",   content: gradingPrompt }
      ]
    })

    const rawScore = gradingRes.choices[0].message.content.trim()
    // parse integer, clamp between 0–100
    let score = parseInt(rawScore, 10)
    if (isNaN(score)) score = 0
    score = Math.max(0, Math.min(100, score))

    // 3) Push the submission
    assignment.submissions.push({
      userAnswer: answer,
      score,
      time: new Date()
    })
    assignment.status = 'Completed'

    await assignment.save()

    // 4) Return the updated assignment
    return res.json(assignment)
  } catch (err) {
    console.error("addSubmission error:", err)
    return res.status(500).json({ error: err.message })
  }
}

exports.generateAssignment = async (req, res) => {
  const { courseId, dueDate } = req.body;

  // 1) Find the course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // 2) Build context from its messages
  const convoContext = course.messages
    .sort((a, b) => a.sequenceNo - b.sequenceNo)
    .map(m => `#${m.sequenceNo} [${m.type}]: ${m.message}`)
    .join('\n');

  // 3) Prompt for **one** descriptive assignment question
  const prompt = `
Using the following chat history as context, 
generate **one** descriptive, open-ended assignment-style question
on the topic "${course.name}". 
The question should prompt critical thinking and detailed explanation.
Return only the question text, no numbering or extra commentary.

Context:
${convoContext}
  `.trim();

  try {
    // 4) Call your LLM
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        { role: "system", content: "You are an educational assistant crafting assignment questions." },
        { role: "user",   content: prompt }
      ]
    });

    // 5) Extract the generated question
    const questionText = response.choices[0].message.content.trim();

    // 6) Create + save the Assignment
    const now       = new Date();
    const defaultDue= new Date(now.getTime() + 7*24*60*60*1000);
    const assignment= new Assignment({
      course:  course._id,
      question: questionText,
      dueDate: dueDate ? new Date(dueDate) : defaultDue
    });
    await assignment.save();

    // 7) Associate it on the Course
    course.assignments.push({
      assignment: assignment._id,
      sequenceNo: course.assignments.length + 1
    });
    await course.save();

    // 8) Return the single assignment object
    return res.status(201).json(assignment);

  } catch (err) {
    console.error("generateAssignment error:", err);
    return res.status(500).json({ error: err.message });
  }
};