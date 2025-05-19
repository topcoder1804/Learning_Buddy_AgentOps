import { Outlet } from "react-router-dom"
import SideNav from "../components/SideNav"

function PrivateLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <SideNav />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default PrivateLayout
