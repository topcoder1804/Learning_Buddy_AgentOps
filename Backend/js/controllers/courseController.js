const Course = require('../models/Course');
const User = require('../models/User');

// GET /api/courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('quizzes.quiz')
      .populate('assignments.assignment');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/courses/for-user?userId=...
exports.getCoursesForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const user = await User.findById(userId).populate('courses.course');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userCourses = user.courses.map(c => c.course);
    res.json(userCourses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('quizzes.quiz')
      .populate('assignments.assignment');
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const { name, level, description, userId } = req.body;

    const course = new Course({
      name,
      level,
      description,
      createdBy: userId,
    });
    console.log("REQ BODY:", req.body);
    await course.save();
    console.log("Created course:", course);
    // 2. Add this course to the user's courses array
    await User.findByIdAndUpdate(
      userId,
      { $push: { courses: { course: course._id, status: 'Not Started' } } }
    );
    console.log("Updated user courses array for userId:", userId);

    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ msg: 'Course not found' });
    res.json({ msg: 'Course removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
