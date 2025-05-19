import { Routes, Route, Navigate } from "react-router-dom"
import { AuthenticateWithRedirectCallback, SignedIn, SignedOut } from "@clerk/clerk-react"
import { Toaster } from "react-hot-toast"

// Layouts
import PublicLayout from "./layouts/PublicLayout"
import PrivateLayout from "./layouts/PrivateLayout"

// Pages
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import CoursePage from "./pages/CoursePage"
import QuizRunner from "./pages/QuizRunner"
import DataRoomPage from "./pages/DataRoomPage"
import ProfilePage from "./pages/ProfilePage"

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/login/sso-callback"
            element={
              <AuthenticateWithRedirectCallback
                signInUrl="/login"
                signUpUrl="/signup"
              />
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route
          element={
            <>
              <SignedIn>
                <PrivateLayout />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/course/:id" element={<CoursePage />} />
          <Route path="/quiz/:id" element={<QuizRunner />} />
          <Route path="/dataroom" element={<DataRoomPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
