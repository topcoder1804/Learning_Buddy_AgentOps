"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { PlusIcon } from "lucide-react"
import toast from "react-hot-toast"
import CourseCard from "../components/CourseCard"
import NewCourseModal from "../components/NewCourseModal"
import { fetchCoursesForUser, fetchUserProgress, fetchOrCreateUserByEmail } from "../services/api"

function HomePage() {
  const { user } = useUser()
  const [backendUser, setBackendUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [userProgress, setUserProgress] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [otherCourses, setOtherCourses] = useState([])

  // Fetch or create backend user, then load courses and progress
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        if (!user) return

        // 1. Get or create backend user
        const email = user.emailAddresses?.[0]?.emailAddress
        const name = user.fullName || user.firstName || "Unknown"
        const backendUser = await fetchOrCreateUserByEmail(email, name)
        setBackendUser(backendUser)

        // 2. Fetch user-specific courses
        const coursesData = await fetchCoursesForUser(backendUser._id)
        setCourses(coursesData)

        // 3. Fetch user progress using backend user ID
        if (coursesData.length > 0 && backendUser) {
          const progressData = await fetchUserProgress(backendUser._id)
          setUserProgress(progressData)
        }

        const progressData = calculateProgress(coursesData)
        setUserProgress(progressData)

        const recRes = await fetch(`http://localhost:8080/api/courses/recommendations?email=${encodeURIComponent(email)}`);
        const { recommended } = await recRes.json();

        const recommendedCourses = coursesData.filter(c => recommended?.includes(c._id));
        const otherCourses = coursesData.filter(c => !recommended?.includes(c._id));

        setRecommendedCourses(recommendedCourses);
        setOtherCourses(otherCourses);

      } catch (error) {
        console.error("Error loading home data:", error)
        toast.error("Failed to load courses")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  // Save to localStorage whenever data changes (optional, for faster UI)
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses))
    localStorage.setItem("userProgress", JSON.stringify(userProgress))
  }, [courses, userProgress])

  const handleNewCourse = async (newCourse) => {
    setIsModalOpen(false)
    toast.success("New course created!")
    // Re-fetch from backend to get the latest list
    if (backendUser) {
      const coursesData = await fetchCoursesForUser(backendUser._id)
      setCourses(coursesData)
    }
  }

  /**
 * Given an array of fully‐populated Course objects, returns an object
 * mapping courseId → percentComplete (0–100).
 */
  function calculateProgress(courses) {
    const progress = {};

    courses.forEach(course => {
      // quizzes come in as [{ quiz: { ..., scores: [...] }, sequenceNo, _id }, …]
      const totalQuizzes = course.quizzes.length;
      const completedQuizzes = course.quizzes.filter(q => (q.quiz.scores?.length || 0) > 0).length;

      // assignments come in as [{ assignment: { ..., submissions: [...] }, sequenceNo, _id }, …]
      const totalAssigns = course.assignments.length;
      const completedAssigns = course.assignments.filter(a => (a.assignment.submissions?.length || 0) > 0).length;

      const totalItems = totalQuizzes + totalAssigns;
      const doneItems = completedQuizzes + completedAssigns;
      const percent = totalItems > 0
        ? Math.round((doneItems / totalItems) * 100)
        : 0;

      progress[course._id] = percent;
    });

    return progress;
  }


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Courses</h1>
        {/*     <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <PlusIcon className="w-6 h-6" />
        </button> */}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-medium mb-2">No courses yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start by creating your first course</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create Course
          </button>
        </div>
      ) : (
        <>
          {/* Recommended */}
          {recommendedCourses.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Recommended for you</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedCourses.map(course => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    progress={userProgress[course._id] || 0}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Others */}
          <section>
            <h2 className="text-xl font-semibold mb-4">
              {recommendedCourses.length > 0 ? "All Courses" : "Your Courses"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherCourses.map(course => (
                <CourseCard
                  key={course._id}
                  course={course}
                  progress={userProgress[course._id] || 0}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {isModalOpen && (
        <NewCourseModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleNewCourse}
          userId={backendUser?._id}
        />
      )}
    </div>
  )
}

export default HomePage
