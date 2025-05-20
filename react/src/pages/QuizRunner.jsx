"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useUser } from "@clerk/clerk-react"
import toast from "react-hot-toast"
import { fetchQuizById, submitQuizScore } from "../services/api"

function QuizRunner() {
  const { id } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [result, setResult] = useState(null)

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true)

        // Try to get from localStorage first
        const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
        const localQuiz = savedQuizzes.find((q) => q._id === id)

        if (localQuiz) {
          setQuiz(localQuiz)
        } else {
          // Fallback to API
          const quizData = await fetchQuizById(id)
          setQuiz(quizData)
        }
      } catch (error) {
        console.error("Error loading quiz:", error)
        toast.error("Failed to load quiz")
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [id])

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (Object.keys(answers).length < (quiz?.questions?.length || 0)) {
      toast.error("Please answer all questions")
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate score
      let correctCount = 0
      const questionResults = quiz.questions.map((question, index) => {
        const isCorrect = answers[index] === question.answer
        if (isCorrect) correctCount++

        return {
          question: question.question,
          userAnswer: answers[index],
          correctAnswer: question.answer,
          isCorrect,
        }
      })

      const score = (correctCount / quiz.questions.length) * 100

      // Submit score to API
      await submitQuizScore(id, {
        userId: user.id,
        score,
        answers: Object.values(answers),
      })

      // Save to localStorage
      const savedScores = JSON.parse(localStorage.getItem("quizScores") || "[]")
      const newScore = {
        quizId: id,
        userId: user.id,
        score,
        date: new Date().toISOString(),
      }
      localStorage.setItem("quizScores", JSON.stringify([...savedScores, newScore]))

      // Show results
      setResult({
        score,
        correctCount,
        total: quiz.questions.length,
        questionResults,
      })
    } catch (error) {
      console.error("Error submitting quiz:", error)
      toast.error("Failed to submit quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">Quiz not found</h2>
        <p className="text-gray-500 dark:text-gray-400">The quiz you're looking for doesn't exist</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Quiz Results</h1>

        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
          <h2 className="text-xl mb-2">Your Score: {result.score.toFixed(1)}%</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You got {result.correctCount} out of {result.total} questions correct
          </p>
        </div>

        <div className="space-y-6">
          {result.questionResults.map((qResult, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                qResult.isCorrect
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900"
              }`}
            >
              <h3 className="font-medium mb-2">
                Question {index + 1}: {qResult.question}
              </h3>
              <p className="mb-1">
                <span className="font-medium">Your answer:</span> {qResult.userAnswer}
              </p>
              {!qResult.isCorrect && (
                <p className="text-green-600 dark:text-green-400">
                  <span className="font-medium">Correct answer:</span> {qResult.correctAnswer}
                </p>
              )}
              {quiz.questions[index].hint && !qResult.isCorrect && (
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                  <span className="font-medium">Hint:</span> {quiz.questions[index].hint}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate(`/course/${quiz.course}`)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Course
          </button>
          <button
            onClick={() => {
              setResult(null)
              setAnswers({})
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Retry Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-2">{quiz.topic}</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Answer all {quiz.questions.length} questions to complete this quiz
      </p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          {quiz.questions.map((question, qIndex) => (
            <div key={qIndex} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h2 className="text-lg font-medium mb-4">
                {qIndex + 1}. {question.question}
              </h2>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => (
                  <label
                    key={oIndex}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[qIndex] === option
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "border-gray-200 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      value={option}
                      checked={answers[qIndex] === option}
                      onChange={() => handleAnswerChange(qIndex, option)}
                      className="mr-3"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={() => navigate(`/course/${quiz.course}`)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Answers"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuizRunner
