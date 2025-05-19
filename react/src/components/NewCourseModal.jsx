"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { createCourse } from "../services/api"
import toast from "react-hot-toast"

function NewCourseModal({ onClose, onSave, userId }) {
  const [formData, setFormData] = useState({
    name: "",
    level: "Beginner",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.description) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Call API to create course
      const newCourse = await createCourse({
        ...formData,
        userId,
      })

      // Update local storage
      const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
      const updatedCourses = [...savedCourses, newCourse]
      localStorage.setItem("courses", JSON.stringify(updatedCourses))

      onSave(newCourse)
    } catch (error) {
      console.error("Error creating course:", error)
      toast.error("Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Create New Course</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Course Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                required
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md dark:border-gray-600">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewCourseModal
