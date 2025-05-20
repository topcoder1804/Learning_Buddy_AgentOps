const express = require('express');
const router  = express.Router();
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  addSubmission,
  generateAssignment // <--- New import
} = require('../controllers/assignmentController');

// List all assignments
router.get('/', getAssignments);

// Get a single assignment
router.get('/:id', getAssignmentById);

// Create a new assignment
router.post('/', createAssignment);

// Update an assignment
router.put('/:id', updateAssignment);

// Delete an assignment
router.delete('/:id', deleteAssignment);

// Add a submission for this assignment
router.post('/:id/submission', addSubmission);

// Generate assignments using Groq AI
router.post('/generate', generateAssignment); // <--- New route

module.exports = router;
