const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Quiz = require('../models/Quiz');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('courses.course');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('courses.course');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


exports.getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('courses.course');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const progress = user.courses.map(c => ({
      courseId: c.course._id,
      courseName: c.course.name,
      status: c.status,
      startedAt: c.startedAt,
      completedAt: c.completedAt
    }));

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserAssignmentProgress = async (req, res) => {
  try {
    const assignments = await Assignment.find({ 'submissions.user': req.params.id })
      .populate('course')
      .populate('submissions.user');

    // Filter and format submissions for this user
    const userAssignments = assignments.map(assignment => {
      const userSubmission = assignment.submissions.find(
        s => s.user._id.toString() === req.params.id
      );
      return userSubmission ? {
        assignmentId: assignment._id,
        course: assignment.course.name,
        question: assignment.question,
        score: userSubmission.score,
        submittedAt: userSubmission.time
      } : null;
    }).filter(Boolean);

    res.json({ assignments: userAssignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserQuizProgress = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 'scores.user': req.params.id })
      .populate('topic')
      .populate('scores.user');

    // Filter and format scores for this user
    const userQuizzes = quizzes.map(quiz => {
      const userScore = quiz.scores.find(
        s => s.user._id.toString() === req.params.id
      );
      return userScore ? {
        quizId: quiz._id,
        topic: quiz.topic.name,
        score: userScore.score,
        takenAt: userScore.time
      } : null;
    }).filter(Boolean);

    res.json({ quizzes: userQuizzes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrCreateUserByEmail = async (req, res) => {
  const { email, name } = req.query;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: name || 'Unknown',
        email,
        courses: [
        ]
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


