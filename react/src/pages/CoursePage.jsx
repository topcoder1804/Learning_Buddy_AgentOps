
import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import { MessageSquareIcon, BookIcon, FileTextIcon, SendIcon } from "lucide-react"
import toast from "react-hot-toast"
import { fetchCourseById, generateQuiz, generateAssignment, fetchOrCreateUserByEmail } from "../services/api"

function CoursePage() {
  const { id } = useParams()
  const { user } = useUser()
  const [backendUser, setBackendUser] = useState(null)
  const [course, setCourse] = useState(null)
  const [activeTab, setActiveTab] = useState("messages")
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const chatEndRef = useRef(null)
  const [quizzes, setQuizzes] = useState([])           // loaded from localStorage
  const [takingQuiz, setTakingQuiz] = useState(null)   // the quiz object you’re currently answering
  const [answers, setAnswers] = useState({})           // e.g. { 0: "Paris", 1: "Mars", ... }
  const [score, setScore] = useState(null)             // your computed score

  // Fetch or create backend user
  useEffect(() => {
    const getBackendUser = async () => {
      if (!user) return
      const email = user.emailAddresses?.[0]?.emailAddress
      const name = user.fullName || user.firstName || "Unknown"
      try {
        const backendUser = await fetchOrCreateUserByEmail(email, name)
        setBackendUser(backendUser)
      } catch (err) {
        setBackendUser(null)
      }
    }
    getBackendUser()
  }, [user])

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("quizzes") || "[]")
    setQuizzes(all.filter(q => q.course === id))
  }, [activeTab])

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true)
        const courseData = await fetchCourseById(id)
        setCourse(courseData)

        // Also check localStorage...
        const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
        const localCourse = savedCourses.find((c) => c._id === id)

        if (localCourse) {
          setCourse((prev) => ({
            ...prev,
            ...localCourse,
          }))
        }

        const res = await fetch(`http://localhost:8080/api/courses/${id}/messages`);
        const messages = await res.json();
        setCourse(prev => ({ ...prev, messages }));
      } catch (error) {
        console.error("Error loading course:", error)
        toast.error("Failed to load course")
      } finally {
        setIsLoading(false)
      }
    }

    loadCourse()
  }, [id])

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatEndRef.current && activeTab === "messages") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [course?.messages, activeTab])

  async function sendCourseMessage(courseId, userMessage) {
    const res = await fetch(`http://localhost:8080/api/courses/${courseId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });
    return await res.json();
  }

  function startQuiz(quiz) {
    setTakingQuiz(quiz)
    setAnswers({})
    setScore(null)
  }

  function handleAnswerChange(qIdx, value) {
    setAnswers(a => ({ ...a, [qIdx]: value }))
  }

  function submitQuiz() {
    let correct = 0
    takingQuiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) correct++
    })
    setScore(correct)
    toast.success(`Quiz submitted! You scored ${correct}/${takingQuiz.questions.length}`)
  }


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // Send the user message to the backend and get AI reply + updated messages (with correct sequence numbers)
      const { reply, messages } = await sendCourseMessage(course._id, newMessage);

      // Update local state with the latest messages from backend
      setCourse(prev => ({ ...prev, messages }));

      setNewMessage("");
    } catch (error) {
      toast.error("Failed to get AI response.");
    }
  };


  const handleGenerateQuiz = async () => {
    try {
      setIsGenerating(true)
      const quiz = await generateQuiz(id)

      // Update localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
      const updated = [...savedQuizzes, quiz]
      localStorage.setItem("quizzes", JSON.stringify([...savedQuizzes, quiz]))
      setQuizzes(updated.filter(q => q.course === id))
      toast.success("Quiz generated successfully!")
      setActiveTab("quizzes")
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast.error("Failed to generate quiz")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAssignment = async () => {
    try {
      setIsGenerating(true)
      const assignment = await generateAssignment(id)

      // Update localStorage
      const savedAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
      localStorage.setItem("assignments", JSON.stringify([...savedAssignments, assignment]))

      toast.success("Assignment generated successfully!")
      setActiveTab("assignments")
    } catch (error) {
      console.error("Error generating assignment:", error)
      toast.error("Failed to generate assignment")
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading || !backendUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">Course not found</h2>
        <p className="text-gray-500 dark:text-gray-400">The course you're looking for doesn't exist</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <header className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{course.name}</h1>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">Level:</span>
              <span className="ml-2 text-sm px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                {course.level}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center disabled:opacity-50"
            >
              <BookIcon className="w-4 h-4 mr-1" />
              Generate Quiz
            </button>

            <button
              onClick={handleGenerateAssignment}
              disabled={isGenerating}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center disabled:opacity-50"
            >
              <FileTextIcon className="w-4 h-4 mr-1" />
              Generate Assignment
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left column */}
        <div className="w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex border-b dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "messages"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "quizzes"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "assignments"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              Assignments
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "messages" && (
              <div className="space-y-2">
                {course.messages && course.messages.length > 0 ? (
                  course.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${msg.type === "user" ? "bg-blue-100 dark:bg-blue-900 ml-4" : "bg-gray-100 dark:bg-gray-700 mr-4"
                        }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No messages yet. Start a conversation!
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {activeTab === "quizzes" && (
              <div>
                {!takingQuiz ? (
                  // Quiz list
                  quizzes.length ? (
                    quizzes.map((quiz, i) => (
                      <div key={quiz._id} className="border rounded p-4 mb-4">
                        <h3 className="font-bold">Let's try quiz - {i}</h3>
                        <p className="text-sm">{quiz.questions.length} questions</p>
                        <button
                          className="mt-2 text-blue-500"
                          onClick={() => startQuiz(quiz)}
                        >
                          Take Quiz
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No quizzes yet. Generate one!</div>
                  )
                ) : (
                  // Quiz question form
                  <form onSubmit={e => { e.preventDefault(); submitQuiz() }}>
                    {takingQuiz.questions.map((q, idx) => (
                      <fieldset key={idx} className="mb-6">
                        <legend className="font-medium">{idx + 1}. {q.question}</legend>
                        {q.options.map(opt => (
                          <label key={opt} className="block ml-4">
                            <input
                              type="radio"
                              name={`q${idx}`}
                              value={opt}
                              checked={answers[idx] === opt}
                              onChange={() => handleAnswerChange(idx, opt)}
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}
                        <p className="text-xs text-gray-500 italic">Hint: {q.hint}</p>
                      </fieldset>
                    ))}

                    <button
                      type="submit"
                      className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                      disabled={Object.keys(answers).length !== takingQuiz.questions.length}
                    >
                      Submit Quiz
                    </button>
                    <button
                      type="button"
                      className="ml-2 text-red-500"
                      onClick={() => {
                        setTakingQuiz(null)
                        setScore(null)
                        setAnswers({})
                        toast(`Quiz canceled`, { icon: '✋' })
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                )}

                {takingQuiz && score !== null && (
                  <div className="mt-4 p-4 bg-blue-100 rounded">
                    You scored <strong>{score}</strong> out of <strong>{takingQuiz.questions.length}</strong>!
                  </div>
                )}

              </div>
            )}


            {activeTab === "assignments" && (
              <div>
                {/* Render assignments from localStorage */}
                {JSON.parse(localStorage.getItem("assignments") || "[]")
                  .filter((assignment) => assignment.course === id)
                  .map((assignment, index) => (
                    <div key={index} className="border dark:border-gray-700 rounded-lg p-3 mb-3">
                      <h3 className="font-medium">{assignment.question.substring(0, 50)}...</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                      <div className="flex justify-between mt-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${assignment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            }`}
                        >
                          {assignment.status}
                        </span>
                        <button className="text-sm text-blue-500 hover:text-blue-600">View</button>
                      </div>
                    </div>
                  ))}

                {(!localStorage.getItem("assignments") ||
                  JSON.parse(localStorage.getItem("assignments")).filter((a) => a.course === id).length === 0) && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No assignments yet. Generate one!
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Chat area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {course.messages && course.messages.length > 0 ? (
              course.messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${msg.type === "user" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                  >
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <MessageSquareIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Start a conversation with your AI tutor</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md disabled:opacity-50"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CoursePage
