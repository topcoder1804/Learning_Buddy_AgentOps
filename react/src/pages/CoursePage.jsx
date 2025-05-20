
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
  const [activeTab, setActiveTab] = useState("resources")
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const chatEndRef = useRef(null)
  const [quizzes, setQuizzes] = useState([])           // loaded from localStorage
  const [takingQuiz, setTakingQuiz] = useState(null)   // the quiz object you’re currently answering
  const [answers, setAnswers] = useState({})           // e.g. { 0: "Paris", 1: "Mars", ... }
  const [score, setScore] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [answerText, setAnswerText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)


  const [answerModalContent, setAnswerModalContent] = useState("")
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false)


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

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("quizzes") || "[]")
    // each quiz in LS has a `.scores` array
    setQuizzes(all.filter(q => q.course === id))
  }, [activeTab, id])


  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("assignments") || "[]")
    setAssignments(all.filter(a => a.course === id))
    // reset any open assignment when switching tabs/courses
    setSelectedAssignment(null)
    setAnswerText("")
  }, [activeTab, id])




  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setIsLoading(true)
        const courseData = await fetchCourseById(id)
        setCourse(courseData)

        // --- SYNC LOCALSTORAGE ---

        // Extract the raw quiz objects
        const fetchedQuizzes = (courseData.quizzes || []).map(({ quiz }) => quiz)
        // Merge with any existing, but overwrite any for this course
        const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
        const otherQuizzes = savedQuizzes.filter(q => q.course !== id)
        localStorage.setItem(
          "quizzes",
          JSON.stringify([...otherQuizzes, ...fetchedQuizzes])
        )

        // Same for assignments
        const fetchedAssignments = (courseData.assignments || []).map(({ assignment }) => assignment)
        const savedAssignments = JSON.parse(localStorage.getItem("assignments") || "[]")
        const otherAssignments = savedAssignments.filter(a => a.course !== id)
        localStorage.setItem(
          "assignments",
          JSON.stringify([...otherAssignments, ...fetchedAssignments])
        )

        // (Optional) Save the active course itself
        const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
        const otherCourses = savedCourses.filter(c => c._id !== id)
        localStorage.setItem(
          "courses",
          JSON.stringify([courseData, ...otherCourses])
        )
        localStorage.setItem("activeCourse", JSON.stringify(courseData))

        // --- END LOCALSTORAGE SYNC ---

        // load messages
        const res = await fetch(`http://localhost:8080/api/courses/${id}/messages`)
        const messages = await res.json()
        setCourse(prev => ({ ...prev, messages }))
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


  async function handleSubmitQuiz() {
    if (!takingQuiz) return;

    // 1) compute your score locally:
    let correct = 0
    takingQuiz.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++
    })

    // 2) post it to your API
    const res = await fetch(
      `http://localhost:8080/api/quizzes/${takingQuiz._id}/score`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: correct })
      }
    )
    if (!res.ok) {
      toast.error("Failed to submit score")
      return
    }
    const updated = await res.json()   // updated quiz with new `.scores` array

    toast.success(`You scored ${correct}/${takingQuiz.questions.length}`)

    // 3) update React state
    setTakingQuiz(updated)
    setScore(correct)

    // 4) persist back to localStorage
    const stored = JSON.parse(localStorage.getItem("quizzes") || "[]")
    const merged = stored.map(q =>
      q._id === updated._id ? updated : q
    )
    localStorage.setItem("quizzes", JSON.stringify(merged))

    // 5) also refresh the list
    setQuizzes(qs => qs.map(q => q._id === updated._id ? updated : q))
  }



  async function handleSubmitAssignment() {
    if (!selectedAssignment || !answerText.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(
        `http://localhost:8080/api/assignments/${selectedAssignment._id}/submission`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer: answerText.trim() })
        }
      )
      if (!res.ok) throw new Error("Submission failed")
      const updated = await res.json()

      toast.success("Assignment submitted!")

      // 1) Update React state
      setAssignments((prev) =>
        prev.map(item => (item._id === updated._id ? updated : item))
      )

      // 2) Persist to localStorage
      const stored = JSON.parse(localStorage.getItem("assignments") || "[]")
      const merged = stored.map(item =>
        item._id === updated._id ? updated : item
      )
      localStorage.setItem("assignments", JSON.stringify(merged))

      // 3) Close the form
      setSelectedAssignment(null)
      setAnswerText("")
    } catch (err) {
      console.error(err)
      toast.error("Failed to submit assignment")
    } finally {
      setIsSubmitting(false)
    }
  }





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

      setAssignments(prev => [...prev, assignment])

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
            {/*<button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "messages"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
            >
              Messages
            </button> */}
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

            {/* RESOURCES TAB ADDED HERE */}
            <button
              onClick={() => setActiveTab("resources")}
              className={`px-4 py-2 font-medium text-sm ${activeTab === "resources"
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
                  // — quiz list —
                  quizzes.map(q => (
                    <div key={q._id} className="border rounded p-4 mb-4">
                      <h3 className="font-bold">{q.questions.length} questions</h3>
                      <button onClick={() => { startQuiz(q); setShowAnswers(false) }} className="text-blue-500">
                        Take Quiz
                      </button>
                    </div>
                  ))
                ) : (
                  // — quiz detail & submit —
                  <div className="space-y-4">
                    {takingQuiz.questions.map((q, i) => (
                      <fieldset key={i} className="mb-4">
                        <legend className="font-medium">{i + 1}. {q.question}</legend>
                        {q.options.map(opt => (
                          <label key={opt} className="block ml-4">
                            <input
                              type="radio"
                              name={`q${i}`}
                              value={opt}
                              checked={answers[i] === opt}
                              onChange={() => setAnswers(a => ({ ...a, [i]: opt }))}
                              className="mr-2"
                            />
                            {opt}
                          </label>
                        ))}
                        {showAnswers && score != null && (
                          <p className="mt-2 text-green-600">Answer: {q.answer}</p>
                        )}
                      </fieldset>
                    ))}

                    <div className="flex space-x-2">
                      <button
                        disabled={Object.keys(answers).length !== takingQuiz.questions.length}
                        onClick={handleSubmitQuiz}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        {score == null ? "Submit Quiz" : "Retake Quiz"}
                      </button>

                      <button
                        onClick={() => {
                          setTakingQuiz(null)
                          setAnswers({})
                          setScore(null)
                          setShowAnswers(false)
                        }}
                        className="text-red-500 px-4 py-2"
                      >
                        Cancel
                      </button>

                      <button
                        disabled={!takingQuiz.scores?.length}
                        onClick={() => setShowAnswers(v => !v)}
                        className="text-blue-500 px-4 py-2 disabled:opacity-50"
                      >
                        {showAnswers ? "Hide Answers" : "Show Answers"}
                      </button>
                    </div>

                    {/* — past attempts below buttons — */}
                    {takingQuiz.scores?.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium">Past Attempts</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {takingQuiz.scores.map((s, idx) => (
                            <li key={idx}>
                              <strong>Score:</strong> {s.score}/{takingQuiz.questions.length}&nbsp;
                              <span className="text-gray-500">{new Date(s.time).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}



            {activeTab === "assignments" && (
              <div className="p-4 space-y-4">
                {!selectedAssignment ? (
                  // --- assignment list ---
                  assignments.length ? (
                    assignments.map(a => (
                      <div key={a._id} className="border rounded-lg p-3 flex justify-between items-center">
                        <span className="font-medium truncate">{a.question}</span>
                        <button
                          className="text-blue-500 hover:underline"
                          onClick={() => setSelectedAssignment(a)}
                        >
                          View
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500">No assignments yet. Generate one!</div>
                  )
                ) : (
                  // --- selected assignment + submit form ---
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Assignment</h3>
                    <p
                      className="
                                whitespace-pre-wrap
                                border
                                p-3
                                rounded
                                bg-gray-50       /* light mode bg */
                                text-gray-900    /* light mode text */
                                dark:bg-gray-700 /* dark mode bg */
                                dark:text-gray-100 /* dark mode text */
                              "
                    >
                      {selectedAssignment.question}
                    </p>

                    <textarea
                      rows={6}
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-2 border rounded"
                    />

                    <div className="flex space-x-2">
                      <button
                        disabled={!answerText.trim() || isSubmitting}
                        onClick={handleSubmitAssignment}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting…" : "Submit Answer"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAssignment(null)
                          setAnswerText("")
                        }}
                        className="text-red-500 px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>

                    {selectedAssignment.submissions?.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {selectedAssignment.submissions.map(sub => (
                          <li key={sub._id} className="mb-2 flex justify-between items-center">
                            <span>
                              <strong>Score:</strong> {sub.score}/100&nbsp;
                              <span className="text-gray-500">on {new Date(sub.time).toLocaleString()}</span>
                            </span>
                            <button
                              onClick={() => {
                                setAnswerModalContent(sub.userAnswer)
                                setIsAnswerModalOpen(true)
                              }}
                              className="text-blue-500 hover:underline text-sm"
                            >
                              View Answer
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

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

        {isAnswerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-1/4 max-h-[80vh] flex flex-col">
              <h4 className="text-lg font-bold mb-4">Your Answer</h4>

              {/* Scroll only this part */}
              <div className="flex-1 overflow-y-auto mb-4">
                <pre className="whitespace-pre-wrap text-sm">{answerModalContent}</pre>
              </div>

              {/* Always visible, below the scroll area */}
              <button
                onClick={() => setIsAnswerModalOpen(false)}
                className="self-end px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}




        {isAnswerModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-1/4 max-h-[80vh] flex flex-col">
              <h4 className="text-lg font-bold mb-4">Your Answer</h4>

              {/* Scroll only this part */}
              <div className="flex-1 overflow-y-auto mb-4">
                <pre className="whitespace-pre-wrap text-sm">{answerModalContent}</pre>
              </div>

              {/* Always visible, below the scroll area */}
              <button
                onClick={() => setIsAnswerModalOpen(false)}
                className="self-end px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}




        {/* Right column - now w-3/5 */}
        <div className="w-3/5 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col">
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
