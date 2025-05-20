"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/clerk-react"
import { XIcon } from "lucide-react"
import toast from "react-hot-toast"
import { fetchOrCreateUserByEmail, updateUser } from "../services/api"

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
          name: backendUser.name || name,
          profession: backendUser.profession || "",
          interests: backendUser.interests || [],
        })

        localStorage.setItem("userData", JSON.stringify({
          name: backendUser.name || name,
          profession: backendUser.profession || "",
          interests: backendUser.interests || [],
        }))
      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Failed to load profile")
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
      await updateUser(backendUser._id, formData)
      localStorage.setItem("userData", JSON.stringify(formData))
      toast.success("Profile updated")
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Update failed")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Your Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-md border px-4 py-2 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        {/* Email (disabled) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
          <input
            type="email"
            disabled
            value={user?.primaryEmailAddress?.emailAddress || ""}
            className="w-full rounded-md bg-gray-100 dark:bg-gray-800 dark:border-gray-600 px-4 py-2 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Profession */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profession</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleChange}
            placeholder="e.g. Student, Developer"
            className="w-full rounded-md border px-4 py-2 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>

        {/* Interests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm transition-all duration-200"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
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
              placeholder="Add new interest"
              className="flex-1 px-4 py-2 rounded-l-md border dark:bg-gray-800 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
          <button
            type="button"
            onClick={() => user?.openManagePasswordFlow()}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Reset password
          </button>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
