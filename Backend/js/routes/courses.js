const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCoursesForUser,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

// All courses (admin or for reference)
router.get('/', getCourses);

// User-specific courses
router.get('/for-user', getCoursesForUser);

// Single course by ID
router.get('/:id', getCourseById);

// Create course (userId must be provided in body)
router.post('/', createCourse);

// Update course
router.put('/:id', updateCourse);

// Delete course
router.delete('/:id', deleteCourse);

module.exports = router;
