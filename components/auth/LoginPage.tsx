"use client"
import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"
import { motion } from "framer-motion"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#2E297D]/5 via-white to-[#EAB75F]/5 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo/Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-[#7C2C78]/10 to-[#A43875]/10 mb-4">
              <span className="text-[#7C2C78] font-bold text-sm">
                Mega Prize Mall
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-600 mt-2">
              Sign in to your Mega Prize Mall account
            </p>
          </div>
          
          <LoginForm />
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link 
                href="/register" 
                className="text-[#7C2C78] hover:text-[#A43875] font-semibold transition-colors"
              >
                Create Account
              </Link>
            </p>
            
            <Link 
              href="/" 
              className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-linear-to-r from-[#2E297D]/10 to-transparent blur-3xl -z-10" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-linear-to-l from-[#EAB75F]/10 to-transparent blur-3xl -z-10" />
      </motion.div>
    </div>
  )
}