"use client"

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

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Create a new message object
    const message = {
      type: "user",
      message: newMessage,
      sequenceNo: (course?.messages?.length || 0) + 1,
    }
    // Update local state
    const updatedMessages = [...(course?.messages || []), message]
    setCourse((prev) => ({
      ...prev,
      messages: updatedMessages,
    }))

    // Update localStorage
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
    const updatedCourses = savedCourses.map((c) => {
      if (c._id === id) {
        return {
          ...c,
          messages: updatedMessages,
        }
      }
      return c
    })
    localStorage.setItem("courses", JSON.stringify(updatedCourses))

    // Clear input
    setNewMessage("")

    // TODO: Send to API and get AI response
    // For now, simulate an AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        type: "system",
        message: `I received your message: "${message.message}". How can I help you with this course?`,
        sequenceNo: message.sequenceNo + 1,
      }

      const updatedWithAiMessages = [...updatedMessages, aiResponse]
      setCourse((prev) => ({
        ...prev,
        messages: updatedWithAiMessages,
      }))

      // Update localStorage again
      const savedCoursesAgain = JSON.parse(localStorage.getItem("courses") || "[]")
      const updatedCoursesAgain = savedCoursesAgain.map((c) => {
        if (c._id === id) {
          return {
            ...c,
            messages: updatedWithAiMessages,
          }
        }
        return c
      })
      localStorage.setItem("courses", JSON.stringify(updatedCoursesAgain))
    }, 1000)
  }

  const handleGenerateQuiz = async () => {
    try {
      setIsGenerating(true)
      const quiz = await generateQuiz(id)
      // Update localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
      localStorage.setItem("quizzes", JSON.stringify([...savedQuizzes, quiz]))

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
        {/* Left column - now w-2/5 */}
        <div className="w-2/5 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex border-b dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "messages"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("quizzes")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "quizzes"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "assignments"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Assignments
            </button>
            {/* RESOURCES TAB ADDED HERE */}
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "resources"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Resources
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === "messages" && (
              <div className="space-y-2">
                {course.messages && course.messages.length > 0 ? (
                  course.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.type === "user" ? "bg-blue-100 dark:bg-blue-900 ml-4" : "bg-gray-100 dark:bg-gray-700 mr-4"
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
                {/* Render quizzes from localStorage */}
                {JSON.parse(localStorage.getItem("quizzes") || "[]")
                  .filter((quiz) => quiz.course === id)
                  .map((quiz, index) => (
                    <div key={index} className="border dark:border-gray-700 rounded-lg p-3 mb-3">
                      <h3 className="font-medium">{quiz.topic}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {quiz.questions?.length || 0} questions
                      </p>
                      <button className="mt-2 text-sm text-blue-500 hover:text-blue-600">Take Quiz</button>
                    </div>
                  ))}

                {(!localStorage.getItem("quizzes") ||
                  JSON.parse(localStorage.getItem("quizzes")).filter((q) => q.course === id).length === 0) && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">No quizzes yet. Generate one!</div>
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
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            assignment.status === "pending"
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

            {/* RESOURCES TAB CONTENT */}
            {activeTab === "resources" && (
              <div>
                {course.resources && course.resources.length > 0 ? (
                  course.resources.slice(0, 5).map((res, idx) => (
                    <div key={idx} className="mb-6">
                      <div className="aspect-w-16 aspect-h-9 mb-2">
                        <iframe
                          src={res.videoLink}
                          title={`Resource Video ${idx + 1}`}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-64"
                        ></iframe>
                      </div>
                      {/* Transcript is NOT shown here */}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No resources available.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column - now w-3/5 */}
        <div className="w-3/5 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            {course.messages && course.messages.length > 0 ? (
              course.messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.type === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      msg.type === "user" ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
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
