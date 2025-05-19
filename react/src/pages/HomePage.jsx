"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { PlusIcon } from "lucide-react"
import toast from "react-hot-toast"
import CourseCard from "../components/CourseCard"
import NewCourseModal from "../components/NewCourseModal"
import { fetchCourses, fetchUserProgress } from "../services/api"

function HomePage() {
  const { user } = useUser()
  const [courses, setCourses] = useState([])
  const [userProgress, setUserProgress] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const coursesData = await fetchCourses()

        // Get user progress if we have courses
        if (coursesData.length > 0) {
          const progressData = await fetchUserProgress(user.id)
          setUserProgress(progressData)
        }

        setCourses(coursesData)
      } catch (error) {
        console.error("Error loading home data:", error)
        toast.error("Failed to load courses")
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadData()
    }
  }, [user])

  // Load from localStorage on component mount
  useEffect(() => {
    const savedCourses = localStorage.getItem("courses")
    const savedProgress = localStorage.getItem("userProgress")

    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    }

    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress))
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses))
    localStorage.setItem("userProgress", JSON.stringify(userProgress))
  }, [courses, userProgress])

  const handleNewCourse = (newCourse) => {
    setCourses([...courses, newCourse])
    setIsModalOpen(false)
    toast.success("New course created!")
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
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} progress={userProgress[course._id] || 0} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <NewCourseModal onClose={() => setIsModalOpen(false)} onSave={handleNewCourse} userId={user.id} />
      )}
    </div>
  )
}

export default HomePage
