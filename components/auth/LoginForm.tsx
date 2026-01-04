"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowRight, Shield } from "lucide-react"
import { motion } from "framer-motion"

// Define form data type
interface LoginFormData {
  email: string
  password: string
}

// Define error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  "CredentialsSignin": "Invalid email or password",
  "User not found": "No account found with this email",
  "Invalid password": "Incorrect password",
  "Please use your social login method": "Please sign in with Google instead",
  "Invalid credentials format": "Please enter valid email and password",
}

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<LoginFormData>>({})

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {}
    
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        // Map error to user-friendly message
        const errorMessage = ERROR_MESSAGES[result.error] || 
                            result.error || 
                            "Sign in failed. Please try again."
        
        toast.error(errorMessage, {
          duration: 4000,
          action: {
            label: "Retry",
            onClick: () => handleSubmit(e),
          },
        })
      } else {
        toast.success("🎉 Successfully logged in!", {
          description: "Redirecting to dashboard...",
          duration: 2000,
        })
        
        // Add small delay for better UX
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1000)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("google", { 
        callbackUrl: "/",
        redirect: true 
      })
      toast.info("Redirecting to Google...", { duration: 1500 })
    } catch (error) {
      console.log(error)
      toast.error("Google sign in failed")
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }))
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }))
      }
    }

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Security Assurance */}
      <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-linear-to-r from-[#2E297D]/5 to-[#7C2C78]/5 border border-gray-200">
        <Shield className="h-4 w-4 text-[#2E297D]" />
        <span className="text-xs text-gray-700">
          Your data is end to end Encrypted for security
        </span>
      </div>

      <div className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange("email")}
              disabled={loading}
              className={`pl-10 pr-4 py-3 bg-gray-50 border-gray-200 focus:border-[#7C2C78] focus:ring-1 focus:ring-[#7C2C78]/20 transition-all ${errors.email ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
          </div>
          {errors.email && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <span>⚠</span> {errors.email}
            </motion.p>
          )}
        </div>
        
        {/* Password Field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            {/* <button
              type="button"
              className="text-xs text-[#7C2C78] hover:text-[#A43875] font-medium transition-colors"
              onClick={() => toast.info("Password reset feature coming soon!")}
            >
              Forgot password?
            </button> */}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange("password")}
              disabled={loading}
              className={`pl-10 pr-12 py-3 bg-gray-50 border-gray-200 focus:border-[#7C2C78] focus:ring-1 focus:ring-[#7C2C78]/20 transition-all ${errors.password ? "border-red-500 ring-1 ring-red-500" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <span>⚠</span> {errors.password}
            </motion.p>
          )}
        </div>
      </div>

      {/* Sign In Button */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold bg-linear-to-r from-[#7C2C78] to-[#A43875] hover:from-[#6A2566] hover:to-[#8D2F6A] shadow-lg hover:shadow-xl transition-all duration-300" 
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </motion.div>

      {/* Terms & Privacy */}
      <p className="text-xs text-gray-500 text-center pt-2">
        By signing in, you agree to our{" "}
        <button 
          type="button" 
          className="text-[#7C2C78] hover:underline"
          onClick={() => toast.info("Terms & Conditions page coming soon!")}
        >
          Terms
        </button>{" "}
        and{" "}
        <button 
          type="button" 
          className="text-[#7C2C78] hover:underline"
          onClick={() => toast.info("Privacy Policy page coming soon!")}
        >
          Privacy Policy
        </button>
      </p>
    </motion.form>
  )
}