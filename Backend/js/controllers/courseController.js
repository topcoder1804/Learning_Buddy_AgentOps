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
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const user = await User.findById(userId).populate({
      path: 'courses.course',
      populate: [
        { path: 'quizzes.quiz' },
        { path: 'assignments.assignment' },
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3) Pull out the actual Course documents and return them
    const courses = user.courses.map(entry => entry.course);
    res.json(courses);
  } catch (err) {
    console.error("Error in getCoursesForUser:", err);
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
    // 1) Fetch course and its messages + resources
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    // 2) Build chat history
    const history = course.messages.map(msg => ({
      role: msg.type === "user" ? "user" : "assistant",
      content: msg.message
    }));

    // 3) Concatenate all video transcripts (watch out for model context limits!)
    const transcriptBlob = course.resources
      .map(r => `— Transcript from ${r.videoLink} —\n${r.transcript}`)
      .join("\n\n");

    // 4) Assemble Groq messages, including transcripts as a system hint
    const groqMessages = [
      {
        role: "system",
        content: `
You are a helpful AI tutor. If the user’s question can be answered using the course’s video transcripts, use them verbatim.  
Otherwise, answer based on the course chat history.
`.trim()
      },
      // insert transcript context
      transcriptBlob && {
        role: "system",
        content: transcriptBlob
      },
      // prior Q&A history
      ...history,
      // the new user question
      { role: "user", content: message }
    ].filter(Boolean);  // remove the empty transcript entry if no resources

    // 5) Send to Groq
    const response = await groq.chat.completions.create({
      model:   "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: groqMessages,
      temperature: 0.7
    });

    const aiReply = response.choices[0].message.content.trim();

    // 6) Persist both the user question and the AI reply
    const lastSeq = course.messages.length
      ? course.messages[course.messages.length-1].sequenceNo
      : 0;

    course.messages.push(
      { type: "user",   message, sequenceNo: lastSeq + 1 },
      { type: "system", message: aiReply, sequenceNo: lastSeq + 2 }
    );
    await course.save();

    res.json({ reply: aiReply, messages: course.messages });
  } catch (err) {
    console.error("Groq chatbot error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get response from Groq API" });
  }
};



exports.getCourseMessages = async (req, res) => {
  try {
    // Only load the messages array
    const course = await Course.findById(req.params.id).select('messages');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course.messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/courses/recommendations?email=...
exports.getCourseRecommendations = async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'email query param is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const courses = await Course.find()
      .select('name description')
      .lean();

    const courseList = courses.map(c => ({
      id:          c._id.toString(),
      name:        c.name,
      description: c.description
    }));

    const systemMsg = {
      role: "system",
      content: `
You are a course‐recommendation engine.  You will be given:
  • A user’s profession: "${user.profession || 'N/A'}"
  • A user’s interests: ${JSON.stringify(user.interests || [])}
  • A list of available courses, each with "id", "name", and "description".

Pick exactly TWO course IDs that best match this user’s profile.
Return as strictly valid JSON, e.g.:

["<courseId1>","<courseId2>"]
      `.trim()
    };
    const userMsg = {
      role: "user",
      content: JSON.stringify(courseList, null, 2)
    };

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-maverick-17b-128e-instruct",
      messages: [ systemMsg, userMsg ],
      temperature: 0.7
    });

    // 1) grab the raw LLM output
    let raw = response.choices[0].message.content.trim();

    // 2) extract the first JSON‐array substring (“[...]”)
    const match = raw.match(/\[([\s\S]*?)\]/);
    if (match) {
      raw = match[0];
    }

    // 3) parse it
    let recommended = JSON.parse(raw);

    // 4) validate
    if (!Array.isArray(recommended) || recommended.length !== 2) {
      throw new Error(`Expected exactly 2 IDs but got ${JSON.stringify(recommended)}`);
    }

    res.json({ recommended });
  } catch (err) {
    console.error("getCourseRecommendations error:", err);
    res.status(500).json({ error: err.message || "Invalid recommendation format from LLM" });
  }
};
