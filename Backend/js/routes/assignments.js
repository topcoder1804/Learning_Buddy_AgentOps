// routes/assignments.js
const express = require('express');
const router  = express.Router();
const {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  addSubmission
} = require('../controllers/assignmentController');

// @route   GET /api/assignments
// @desc    List all assignments
router.get('/', getAssignments);

// @route   GET /api/assignments/:id
// @desc    Get a single assignment
router.get('/:id', getAssignmentById);

// @route   POST /api/assignments
// @desc    Create a new assignment
router.post('/', createAssignment);

// @route   PUT /api/assignments/:id
// @desc    Update an assignment
router.put('/:id', updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete an assignment
router.delete('/:id', deleteAssignment);

// @route   POST /api/assignments/:id/submission
// @desc    Add a submission for this assignment
router.post('/:id/submission', addSubmission);

module.exports = router;
