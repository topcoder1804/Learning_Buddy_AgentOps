// Base API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)

    // For demo purposes, return mock data if API fails
    if (endpoint.includes("/courses") && options.method !== "POST") {
      return mockCourses
    }

    throw error
  }
}
export async function fetchOrCreateUserByEmail(email, name) {
  return apiRequest(`/users/lookup/or-create?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
}
export async function fetchCoursesForUser(userId) {
  return apiRequest(`/courses/for-user?userId=${encodeURIComponent(userId)}`);
}

// User API
export async function fetchUserById(userId) {
  return apiRequest(`/users/${userId}`)
}

export async function updateUser(userId, userData) {
  return apiRequest(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

export async function sendCourseMessage(courseId, userMessage) {
  return apiRequest(`/courses/${courseId}/chat`, {
    method: "POST",
    body: JSON.stringify({ message: userMessage }),
  });
}

export async function fetchUserProgress(userId) {
  // In a real app, this would be an API call
  // For now, we'll use localStorage
  const savedProgress = localStorage.getItem("userProgress")
  return savedProgress ? JSON.parse(savedProgress) : {}
}

// Course API
export async function fetchCourses() {
  return apiRequest("/courses")
}

export async function fetchCourseById(courseId) {
  return apiRequest(`/courses/${courseId}`)
}

export async function createCourse(courseData) {
  // Generate a mock ID for local storage
  const mockId = `course_${Date.now()}`

  const newCourse = {
    _id: mockId,
    ...courseData,
    messages: [],
    quizzes: [],
    assignments: [],
    createdAt: new Date().toISOString(),
  }

  // Try to call the API
  try {
    return await apiRequest("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    })
  } catch (error) {
    console.log("Using mock data instead of API")
    return newCourse
  }
}

// Quiz API
export async function fetchQuizById(quizId) {
  return apiRequest(`/quizzes/${quizId}`)
}

export async function generateQuiz(courseId) {
  // Generate a mock quiz
  const mockQuiz = {
    _id: `quiz_${Date.now()}`,
    course: courseId,
    topic: "Sample Quiz",
    questions: [
      {
        question: "What is the capital of France?",
        options: ["London", "Berlin", "Paris", "Madrid"],
        answer: "Paris",
        hint: "Think of the Eiffel Tower",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: "Mars",
        hint: "Named after the Roman god of war",
      },
      {
        question: "What is the largest mammal?",
        options: ["Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
        answer: "Blue Whale",
        hint: "It lives in the ocean",
      },
    ],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  }

  // Try to call the API
  try {
    return await apiRequest("/quizzes/generate", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    })
  } catch (error) {
    console.log("Using mock data instead of API")
    return mockQuiz
  }
}

export async function submitQuizScore(quizId, scoreData) {
  return apiRequest(`/quizzes/${quizId}/score`, {
    method: "POST",
    body: JSON.stringify(scoreData),
  })
}

// Assignment API
export async function generateAssignment(courseId) {
  // Generate a mock assignment
  const mockAssignment = {
    _id: `assignment_${Date.now()}`,
    course: courseId,
    question: "Write a 500-word essay on the importance of continuous learning in the field of technology.",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    submissions: [],
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Try to call the API
  try {
    return await apiRequest("/assignments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    })
  } catch (error) {
    console.log("Using mock data instead of API")
    return mockAssignment
  }
}

// DataRoom API
export async function fetchFiles() {
  return apiRequest("/dataroom")
}

export async function uploadFile(fileData, file) {
  // In a real app, this would use FormData to upload the file
  // For now, we'll just return the fileData with a mock ID
  const mockFileData = {
    _id: `file_${Date.now()}`,
    ...fileData,
  }

  // Try to call the API
  try {
    const formData = new FormData()
    formData.append("file", file)
    Object.keys(fileData).forEach((key) => {
      formData.append(key, fileData[key])
    })

    return await fetch(`${API_URL}/dataroom`, {
      method: "POST",
      body: formData,
    }).then((res) => res.json())
  } catch (error) {
    console.log("Using mock data instead of API")
    return mockFileData
  }
}

export async function deleteFile(fileId) {
  return apiRequest(`/dataroom/${fileId}`, {
    method: "DELETE",
  })
}

// Mock data for fallback
const mockCourses = [
  {
    _id: "course_1",
    name: "Introduction to JavaScript",
    level: "Beginner",
    description: "Learn the fundamentals of JavaScript programming language.",
    messages: [
      {
        type: "system",
        message: "Welcome to the JavaScript course! How can I help you today?",
        sequenceNo: 1,
      },
    ],
    quizzes: [],
    assignments: [],
  },
  {
    _id: "course_2",
    name: "Advanced React Development",
    level: "Intermediate",
    description: "Master React hooks, context API, and performance optimization techniques.",
    messages: [],
    quizzes: [],
    assignments: [],
  },
  {
    _id: "course_3",
    name: "Machine Learning Fundamentals",
    level: "Advanced",
    description: "Explore the core concepts of machine learning and AI.",
    messages: [],
    quizzes: [],
    assignments: [],
  },
]
