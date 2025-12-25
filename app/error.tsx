"use client"

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { log } from "@/lib/logger"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to your error tracking service
    log.error('Page error', {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <AlertTriangle className="h-24 w-24 text-red-500 mb-6" />
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Something went wrong!</h1>
      <p className="text-gray-600 mb-8 text-center max-w-lg">
        {error.message || "An unexpected error occurred on this page."}
      </p>
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={reset}
        >
          Try again
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => window.location.href = '/'}
        >
          Go home
        </Button>
      </div>
    </div>
  )
}