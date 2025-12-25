"use client"

import { Toaster, toast } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "group toast",
          title: "font-semibold",
          description: "text-sm opacity-90",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error: "border-red-500/20 bg-red-500/10 text-red-600",
          success: "border-green-500/20 bg-green-500/10 text-green-600",
          warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600",
          info: "border-blue-500/20 bg-blue-500/10 text-blue-600",
        },
      }}
    />
  )
}

// Export toast for direct use
export { toast }