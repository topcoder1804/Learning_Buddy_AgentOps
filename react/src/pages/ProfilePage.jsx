"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { XIcon } from "lucide-react"
import toast from "react-hot-toast"
import { fetchUserById, updateUser, fetchOrCreateUserByEmail } from "../services/api"

function ProfilePage() {
  const { user } = useUser()
  const [backendUser, setBackendUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    interests: [],
  })
  const [newInterest, setNewInterest] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch or create backend user
  useEffect(() => {
    const loadBackendUser = async () => {
      try {
        setIsLoading(true)
        if (!user) return

        const email = user.emailAddresses?.[0]?.emailAddress
        const name = user.fullName || user.firstName || "Unknown"
        const backendUser = await fetchOrCreateUserByEmail(email, name)
        setBackendUser(backendUser)

        setFormData({
          name: backendUser.name || user.fullName || "",
          profession: backendUser.profession || "",
          interests: backendUser.interests || [],
        })

        // Save to localStorage
        localStorage.setItem(
          "userData",
          JSON.stringify({
            name: backendUser.name || user.fullName || "",
            profession: backendUser.profession || "",
            interests: backendUser.interests || [],
          }),
        )
      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Failed to load profile data")

        // Use Clerk data as fallback
        if (user) {
          setFormData({
            name: user.fullName || "",
            profession: "",
            interests: [],
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadBackendUser()
    // eslint-disable-next-line
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddInterest = (e) => {
    e.preventDefault()

    if (!newInterest.trim()) return

    setFormData((prev) => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()],
    }))

    setNewInterest("")
  }

  const handleRemoveInterest = (index) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      if (!backendUser) {
        toast.error("User not loaded")
        return
      }

      // Update API
      await updateUser(backendUser._id, formData)

      // Update localStorage
      localStorage.setItem("userData", JSON.stringify(formData))

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={user?.primaryEmailAddress?.emailAddress || ""}
            disabled
            className="w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Profession</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="e.g. Software Developer, Student, Teacher"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Interests</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              className="flex-1 p-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="Add a new interest"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <button
            type="button"
            onClick={() => user?.openManagePasswordFlow()}
            className="text-blue-500 hover:text-blue-600"
          >
            Reset password
          </button>
        </div>

        <div className="pt-4 border-t dark:border-gray-700">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
