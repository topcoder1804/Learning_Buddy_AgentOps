import { SignIn } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome to Course Tutor</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Sign in to continue to your dashboard
          </p>
        </div>

        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/login"
          redirectUrl="/home"
          afterSignInUrl="/home"
        />
      </div>
    </div>
  )
}

export default LoginPage
