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
        const savedQuizzes = JSON.parse(localStorage.getItem("quizzes") || "[]")
        const localQuiz = savedQuizzes.find((q) => q._id === id)

        if (localQuiz) {
          setQuiz(localQuiz)
        } else {
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

      await submitQuizScore(id, {
        userId: user.id,
        score,
        answers: Object.values(answers),
      })

      const savedScores = JSON.parse(localStorage.getItem("quizScores") || "[]")
      const newScore = {
        quizId: id,
        userId: user.id,
        score,
        date: new Date().toISOString(),
      }
      localStorage.setItem("quizScores", JSON.stringify([...savedScores, newScore]))

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-red-500">Quiz not found</h2>
        <p className="text-gray-500 dark:text-gray-400">Please check the link or try again later.</p>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Quiz Results</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mt-4">
            You scored <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-400">{result.score.toFixed(1)}%</span>
            <span className="text-base ml-2 text-gray-500 dark:text-gray-400">({result.correctCount}/{result.total})</span>
          </p>

        </div>

        {result.questionResults.map((q, index) => (
          <div
            key={index}
            className={`transition-all duration-200 p-5 rounded-lg border shadow-sm ${
              q.isCorrect
                ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                : "bg-red-50 dark:bg-red-900/20 border-red-200"
            }`}
          >
            <h3 className="text-lg font-medium mb-2">Q{index + 1}. {q.question}</h3>
            <p><strong>Your Answer:</strong> {q.userAnswer}</p>
            {!q.isCorrect && (
              <>
                <p className="text-green-600 dark:text-green-400">
                  <strong>Correct:</strong> {q.correctAnswer}
                </p>
                {quiz.questions[index].hint && (
                  <p className="text-sm mt-1 text-gray-500 italic">Hint: {quiz.questions[index].hint}</p>
                )}
              </>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(`/course/${quiz.course}`)}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-sm px-5 py-2 rounded-md"
          >
            Back to Course
          </button>
          <button
            onClick={() => {
              setResult(null)
              setAnswers({})
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm"
          >
            Retry Quiz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 space-y-8">
      <h1 className="text-3xl font-bold text-blue-600">{quiz.topic}</h1>
      <p className="text-gray-600 dark:text-gray-400">Complete all {quiz.questions.length} questions below.</p>

      <form onSubmit={handleSubmit} className="space-y-10">
        {quiz.questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">
              {qIndex + 1}. {question.question}
            </h2>
            <div className="grid gap-2">
              {question.options.map((option, oIndex) => (
                <label
                  key={oIndex}
                  className={`flex items-center px-4 py-3 rounded-md border transition-colors duration-150 ${
                    answers[qIndex] === option
                      ? "bg-blue-50 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600"
                      : "border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
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

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/course/${quiz.course}`)}
            className="bg-gray-200 dark:bg-gray-700 text-sm px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit Answers"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuizRunner
