const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Course = require('../models/Course');
const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');


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
      // 1) create the user
      user = new User({
        name: name || 'Unknown',
        email,
        courses: []
      });
      await user.save();

      // 2) load every mock course file
      const prefillDir = path.join(__dirname, '../utils/PrefilledCourses');
      const files = fs.readdirSync(prefillDir).filter(f => f.endsWith('.js'));

      for (const file of files) {
        const courseData = require(path.join(prefillDir, file));
        // 3) create the Course
        const course = new Course({
          name:        courseData.name,
          level:       courseData.level,
          description: courseData.description,
          tags:        courseData.tags,
          messages:    courseData.messages,
          resources:   courseData.resources,
          quizzes:     [],       
          assignments: [],       
          createdBy:   user._id
        });
        await course.save();

        // 4) create all quizzes for that course
        let seq = 1;
        for (const q of courseData.quizzes || []) {
          const quiz = new Quiz({
            course:   course._id,
            questions: q.questions,
            scores:    q.scores || [],
            dueDate:   q.dueDate
          });
          await quiz.save();
          course.quizzes.push({ quiz: quiz._id, sequenceNo: seq++ });
        }

        // 5) create all assignments for that course
        seq = 1;
        for (const a of courseData.assignments || []) {
          const assignment = new Assignment({
            course:     course._id,
            question:   a.question,
            dueDate:    a.dueDate,
            submissions: a.submissions || [],
            status:     a.status
          });
          await assignment.save();
          course.assignments.push({ assignment: assignment._id, sequenceNo: seq++ });
        }

        // 6) save course with its quizzes & assignments
        await course.save();

        // 7) attach course to the user
        user.courses.push({
          course:      course._id,
          status:      'Not Started',
          startedAt:   null,
          completedAt: null
        });
      }

      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


