const Quiz = require('../models/Quiz');

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
