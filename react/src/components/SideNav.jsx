"use client"

import { useNavigate, NavLink } from "react-router-dom"
import { useClerk } from "@clerk/clerk-react"
import { HomeIcon, FolderIcon, UserIcon, LogOutIcon } from "lucide-react"

function SideNav() {
  const { signOut } = useClerk()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  return (
    <aside className="w-16 md:w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-center hidden md:block">Course Tutor</h1>
        <h1 className="text-xl font-bold text-center md:hidden">CT</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex items-center p-2 rounded-lg ${
              isActive
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <HomeIcon className="w-5 h-5 mr-3" />
          <span className="hidden md:inline">Home</span>
        </NavLink>

        <NavLink
          to="/dataroom"
          className={({ isActive }) =>
            `flex items-center p-2 rounded-lg ${
              isActive
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <FolderIcon className="w-5 h-5 mr-3" />
          <span className="hidden md:inline">Data Room</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center p-2 rounded-lg ${
              isActive
                ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`
          }
        >
          <UserIcon className="w-5 h-5 mr-3" />
          <span className="hidden md:inline">Profile</span>
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center p-2 w-full rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <LogOutIcon className="w-5 h-5 mr-3" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default SideNav
