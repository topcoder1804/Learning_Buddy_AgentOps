// routes/dataroom.js
const express = require('express');
const router  = express.Router();
const {
  getFiles,
  getFileById,
  uploadFile,
  updateFile,
  deleteFile
} = require('../controllers/dataroomController');

// @route   GET /api/dataroom
// @desc    List all files in the Data Room
router.get('/', getFiles);

// @route   GET /api/dataroom/:id
// @desc    Get metadata for a single file
router.get('/:id', getFileById);

// @route   POST /api/dataroom
// @desc    Upload a new file entry
router.post('/', uploadFile);

// @route   PUT /api/dataroom/:id
// @desc    Update file metadata
router.put('/:id', updateFile);

// @route   DELETE /api/dataroom/:id
// @desc    Remove a file entry
router.delete('/:id', deleteFile);

module.exports = router;
