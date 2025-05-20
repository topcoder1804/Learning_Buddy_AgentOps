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
    //console.log("REQ BODY:", req.body);
    await course.save();
    //console.log("Created course:", course);
    // 2. Add this course to the user's courses array
    await User.findByIdAndUpdate(
      userId,
      { $push: { courses: { course: course._id, status: 'Not Started' } } }
    );
    //console.log("Updated user courses array for userId:", userId);

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

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/courses/:id/chat
exports.chatWithGroq = async (req, res) => {
  const { message } = req.body;
  const courseId = req.params.id;

  try {
    // Fetch course and its messages
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // Prepare Groq chat history
    const history = course.messages.map(msg => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.message
    }));

    // Add the new user message to the history
    const groqMessages = [
      { role: "system", content: "You are a helpful AI course tutor." },
      ...history,
      { role: "user", content: message }
    ];

    // Call Groq API
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: groqMessages,
      temperature: 0.7
    });

    const aiReply = response.choices[0].message.content.trim();

    // Calculate next sequence numbers
    const lastSeqNo = course.messages.length > 0 ? course.messages[course.messages.length - 1].sequenceNo : 0;
    const userSeqNo = lastSeqNo + 1;
    const aiSeqNo = lastSeqNo + 2;

    // Update course messages in DB with correct sequence numbers
    course.messages.push(
      { type: "user", message, sequenceNo: userSeqNo },
      { type: "system", message: aiReply, sequenceNo: aiSeqNo }
    );
    await course.save();

    res.json({ reply: aiReply, messages: course.messages });
  } catch (err) {
    console.error("Groq chatbot error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from Groq API" });
  }
};


