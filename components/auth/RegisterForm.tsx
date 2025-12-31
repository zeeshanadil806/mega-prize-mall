"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface ApiErrorResponse {
  error: string
  details?: unknown
}

// Updated registration request type with referral code
interface RegisterRequest {
  name: string
  email: string
  password: string
  role: "customer" | "admin" | "support"
  referralCode?: string | null
}

// Success response type with referral bonus
interface SuccessResponse {
  message: string
  user: {
    id: string
    name?: string
    email: string
    role: string
  }
  referralBonus?: number
}

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "", // NEW: Referral code field
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "customer",
          referralCode: formData.referralCode.trim() || null, // Send null if empty
        } as RegisterRequest),
      })

      const data: ApiErrorResponse | SuccessResponse = await response.json()

      if (!response.ok) {
        const errorData = data as ApiErrorResponse
        throw new Error(errorData.error || "Registration failed")
      }

      const successData = data as SuccessResponse
      
      // Show success message with referral bonus if applicable
      if (successData.referralBonus) {
        toast.success(`Account created! You earned ${successData.referralBonus} bonus points!`)
      } else {
        toast.success("Account created! Signing you in...")
      }
      
      // Auto login after registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      // Type-safe error handling
      if (error instanceof Error) {
        toast.error(error.message)
      } else if (typeof error === 'string') {
        toast.error(error)
      } else {
        toast.error("Registration failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      await signIn("google", { 
        callbackUrl: "/dashboard",
        redirect: true 
      })
    } catch (error) {
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : "Google sign up failed"
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength={8}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
        </div>
        
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        {/* NEW: Referral Code Field */}
        <div>
          <Label htmlFor="referralCode">
            Referral Code (Optional)
            <span className="text-xs text-gray-500 font-normal ml-1">
              Get 200 bonus points!
            </span>
          </Label>
          <Input
            id="referralCode"
            type="text"
            placeholder="Enter referral code if you have one"
            value={formData.referralCode}
            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
            disabled={loading}
            className="uppercase"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a valid referral code to receive 200 bonus points
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Account..." : "Create Account"}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignUp}
        disabled={loading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  )
}