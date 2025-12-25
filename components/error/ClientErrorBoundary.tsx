"use client"

import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"
import { Button } from "@/components/ui/button"
import { log } from "@/lib/logger"

function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error 
  resetErrorBoundary: () => void 
}) {
  log.error("Client component error", { error })

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
      <h3 className="font-semibold text-red-800">Something went wrong</h3>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
      <Button
        size="sm"
        variant="outline"
        onClick={resetErrorBoundary}
        className="mt-3"
      >
        Try again
      </Button>
    </div>
  )
}

export function ClientErrorBoundary({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => log.error("Error boundary caught", { error })}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  )
}