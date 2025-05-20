require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const connectDB = require('./config/db');

// Route imports
const userRoutes       = require('./routes/users');
const courseRoutes     = require('./routes/courses');
const quizRoutes       = require('./routes/quizzes');
const assignmentRoutes = require('./routes/assignments');
const dataroomRoutes   = require('./routes/dataroom');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json()); // <-- This is crucial for req.body to work

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/dataroom', dataroomRoutes);

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (optional, for catching thrown errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Server error', details: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
