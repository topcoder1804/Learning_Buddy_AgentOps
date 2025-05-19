// routes/quizzes.js
const express = require('express');
const router  = express.Router();
const {
  getQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addScore
} = require('../controllers/quizController');

// @route   GET /api/quizzes
// @desc    List all quizzes
router.get('/', getQuizzes);

// @route   GET /api/quizzes/:id
// @desc    Get a single quiz
router.get('/:id', getQuizById);

// @route   POST /api/quizzes
// @desc    Create a new quiz
router.post('/', createQuiz);

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
router.put('/:id', updateQuiz);

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
router.delete('/:id', deleteQuiz);

// @route   POST /api/quizzes/:id/score
// @desc    Add a new score entry for this quiz
router.post('/:id/score', addScore);

module.exports = router;
