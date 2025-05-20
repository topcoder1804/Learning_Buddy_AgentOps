const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCoursesForUser,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  chatWithGroq, 
  getCourseMessages,
  getCourseRecommendations
} = require('../controllers/courseController');

router.get('/recommendations', getCourseRecommendations);
router.get('/for-user', getCoursesForUser);
// All courses (admin or for reference)
router.get('/', getCourses);
router.post('/:id/chat', chatWithGroq);

// User-specific courses

// Single course by ID
router.get('/:id', getCourseById);

// Create course (userId must be provided in body)
router.post('/', createCourse);

// Update course
router.put('/:id', updateCourse);

// Delete course
router.delete('/:id', deleteCourse);

router.get('/:id/messages', getCourseMessages);


module.exports = router;
