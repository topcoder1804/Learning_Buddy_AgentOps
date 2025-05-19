import { SignIn } from "@clerk/clerk-react"
import { useNavigate } from "react-router-dom"

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Welcome to Course Tutor</h1>
      <SignIn routing="path" path="/login" signUpUrl="/login" redirectUrl="/home" afterSignInUrl="/home" />
    </div>
  )
}

export default LoginPage
