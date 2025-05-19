"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/clerk-react"
import { UploadIcon, TrashIcon, TagIcon } from "lucide-react"
import toast from "react-hot-toast"
import { fetchFiles, uploadFile, deleteFile } from "../services/api"

function DataRoomPage() {
  const { user } = useUser()
  const [files, setFiles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [courses, setCourses] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Load files and courses
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Load files from API
        const filesData = await fetchFiles()
        setFiles(filesData)

        // Load files from localStorage
        const savedFiles = JSON.parse(localStorage.getItem("files") || "[]")
        if (savedFiles.length > 0) {
          setFiles((prev) => [...prev, ...savedFiles])
        }

        // Load courses from localStorage
        const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]")
        setCourses(savedCourses)
      } catch (error) {
        console.error("Error loading data room:", error)
        toast.error("Failed to load files")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files)
    }
  }

  const handleFileUpload = async (fileList) => {
    if (fileList.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      // Process each file
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]

        // Create file metadata
        const fileData = {
          userId: user.id,
          fileName: file.name,
          mimeType: file.type,
          fileUrl: URL.createObjectURL(file), // In a real app, this would be a server URL
          course: selectedCourse !== "all" ? selectedCourse : null,
          tags: [],
          uploadDate: new Date().toISOString(),
        }

        // Upload to API
        const uploadedFile = await uploadFile(fileData, file)

        // Update local state
        setFiles((prev) => [...prev, uploadedFile])

        // Update localStorage
        const savedFiles = JSON.parse(localStorage.getItem("files") || "[]")
        localStorage.setItem("files", JSON.stringify([...savedFiles, uploadedFile]))
      }

      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(100)

      toast.success("File(s) uploaded successfully")

      // Reset after a delay
      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 1000)
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Failed to upload file")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDeleteFile = async (fileId) => {
    try {
      // Delete from API
      await deleteFile(fileId)

      // Update local state
      setFiles((prev) => prev.filter((file) => file._id !== fileId))

      // Update localStorage
      const savedFiles = JSON.parse(localStorage.getItem("files") || "[]")
      localStorage.setItem("files", JSON.stringify(savedFiles.filter((file) => file._id !== fileId)))

      toast.success("File deleted")
    } catch (error) {
      console.error("Error deleting file:", error)
      toast.error("Failed to delete file")
    }
  }

  const filteredFiles = selectedCourse === "all" ? files : files.filter((file) => file.course === selectedCourse)

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Data Room</h1>

      <div className="mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-medium mb-2">Drag and drop files here</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">or</p>
          <input type="file" ref={fileInputRef} onChange={handleFileInputChange} className="hidden" multiple />
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Browse Files"}
          </button>

          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {uploadProgress < 100 ? "Uploading..." : "Upload complete!"}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">Your Files</h2>

          <div className="flex items-center">
            <label className="mr-2 text-sm">Filter by course:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {selectedCourse === "all"
                ? "Upload files to get started"
                : "No files for this course. Try selecting a different course or upload new files."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 text-left">
                <tr>
                  <th className="p-3 text-sm font-medium">File Name</th>
                  <th className="p-3 text-sm font-medium">Course</th>
                  <th className="p-3 text-sm font-medium">Tags</th>
                  <th className="p-3 text-sm font-medium">Uploaded</th>
                  <th className="p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredFiles.map((file) => (
                  <tr key={file._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <span className="font-medium">{file.fileName}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {file.course ? (
                        courses.find((c) => c._id === file.course)?.name || "Unknown Course"
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      {file.tags && file.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {file.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No tags</span>
                      )}
                    </td>
                    <td className="p-3">{new Date(file.uploadDate).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteFile(file._id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataRoomPage
