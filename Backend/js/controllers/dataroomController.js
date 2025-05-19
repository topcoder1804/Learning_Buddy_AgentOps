const DataRoom = require('../models/DataRoom');

// GET /api/dataroom
exports.getFiles = async (req, res) => {
  try {
    const files = await DataRoom.find()
      .populate('user')
      .populate('course');
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dataroom/:id
exports.getFileById = async (req, res) => {
  try {
    const file = await DataRoom.findById(req.params.id)
      .populate('user')
      .populate('course');
    if (!file) return res.status(404).json({ msg: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/dataroom
exports.uploadFile = async (req, res) => {
  try {
    const { user, fileUrl, fileName, mimeType, course, tags } = req.body;
    const file = new DataRoom({ user, fileUrl, fileName, mimeType, course, tags });
    await file.save();
    res.status(201).json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/dataroom/:id
exports.updateFile = async (req, res) => {
  try {
    const file = await DataRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!file) return res.status(404).json({ msg: 'File not found' });
    res.json(file);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/dataroom/:id
exports.deleteFile = async (req, res) => {
  try {
    const file = await DataRoom.findByIdAndDelete(req.params.id);
    if (!file) return res.status(404).json({ msg: 'File not found' });
    res.json({ msg: 'File removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
