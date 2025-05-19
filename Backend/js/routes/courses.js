// routes/courses.js
const express = require('express');
const router  = express.Router();
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// @route   GET /api/courses
// @desc    List all courses
router.get('/', getCourses);

// @route   GET /api/courses/:id
// @desc    Get single course by ID
router.get('/:id', getCourseById);

// @route   POST /api/courses
// @desc    Create a new course
router.post('/', createCourse);

// @route   PUT /api/courses/:id
// @desc    Update a course
router.put('/:id', updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
router.delete('/:id', deleteCourse);

module.exports = router;
