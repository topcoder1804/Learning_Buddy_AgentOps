const Quiz = require('../models/Quiz');
const Course = require('../models/Course'); // <-- Import Course model!
const Groq = require('groq-sdk');
require('dotenv').config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// GET /api/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('topic')
      .populate('scores.user');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/quizzes/:id
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('topic')
      .populate('scores.user');
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/quizzes
exports.createQuiz = async (req, res) => {
  try {
    const { topic, questions, dueDate } = req.body;
    const now = new Date();
    const defaultDue = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const quiz = new Quiz({
      topic,
      questions,
      dueDate: dueDate ? new Date(dueDate) : defaultDue
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    res.json({ msg: 'Quiz removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/quizzes/:id/score
exports.addScore = async (req, res) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    quiz.scores.push({ score, time: new Date() });
    await quiz.save();
    return res.json(quiz);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};



// POST /api/quizzes/generate
exports.generateQuiz = async (req, res) => {
  const { courseId, dueDate } = req.body;

  // 1) Find the course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // 2) Build a context string from the course messages
  const convoContext = course.messages
    .sort((a, b) => a.sequenceNo - b.sequenceNo)
    .map(m => `#${m.sequenceNo} [${m.type}]: ${m.message}`)
    .join('\n');


  // 3) Construct prompt
  const prompt = `
Generate a JSON array of 5 multiple-choice questions on the topic "${course.name}".

Use the following conversation history as context (you may draw examples or details from it):
${convoContext}

Each question object must have:
- "question": The question text
- "options": An array of 4 answer choices
- "answer": The correct answer exactly as one of the options
- "hint": A short hint

**Return strictly valid JSON** (an array of question objects) with no extra text.
  `.trim();


  try {
    // 4) Call your chat API
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        { role: "system", content: "You are an expert quiz generator for educational apps." },
        { role: "user",   content: prompt }
      ]
    });

    const raw = response.choices[0].message.content.trim();
    console.log("AI response:", raw);
    let questions;
    try {
      questions = JSON.parse(raw);
      console.log("Parsed questions:", questions);
    } catch (err) {
      return res.status(500).json({
        error: "Failed to parse JSON from AI",
        raw
      });
    }

    // 5) Create + save the quiz
    const quiz = new Quiz({
      course:   course._id,
      questions,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 3*24*60*60*1000)
    });
    await quiz.save();

    // 6) (Optional) associate it with the course
    course.quizzes.push({
      quiz: quiz._id,
      sequenceNo: course.quizzes.length + 1
    });
    await course.save();

    return res.status(201).json(quiz);
  } catch (err) {
    console.error("generateQuiz error:", err);
    return res.status(500).json({ error: err.message });
  }
};
