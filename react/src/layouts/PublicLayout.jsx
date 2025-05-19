import { Outlet } from "react-router-dom"

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Outlet />
      </div>
    </div>
  )
}

export default PublicLayout
