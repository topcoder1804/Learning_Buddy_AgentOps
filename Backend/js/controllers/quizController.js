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
    const { user, score } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    quiz.scores.push({ user, score, time: new Date() });
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /api/quizzes/generate
exports.generateQuiz = async (req, res) => {
  //console.log("generateQuiz endpoint hit", req.body);
  const { topic, dueDate } = req.body; // topic is the Course ObjectId

  try {
    // 1. Lookup the course by ObjectId
    const course = await Course.findById(topic);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // 2. Use the course name in the AI prompt
    const prompt = `
Create a JSON array of 5 multiple-choice questions (MCQs) on the topic "${course.name}".
Each object should have:
- "question": The question text
- "options": An array of 4 options
- "answer": The correct answer text
- "hint": A short hint to help solve the question

Format strictly as valid JSON only. Do not include explanations outside the array.
    `;
   // console.log("Prompt sent to Groq:", prompt);
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [
        {
          role: "system",
          content: "You are an expert quiz generator that returns structured JSON for educational apps."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const content = response.choices[0].message.content.trim();
    let questions;
    try {
      questions = JSON.parse(content);
    } catch (err) {
      return res.status(500).json({ error: "Could not parse JSON from Groq response", raw: content });
    }

    const now = new Date();
    const defaultDue = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Save the quiz to the database
    const quiz = new Quiz({
      topic, // ObjectId reference to Course
      questions,
      dueDate: dueDate ? new Date(dueDate) : defaultDue
    });
    await quiz.save();
    res.status(201).json(quiz);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
