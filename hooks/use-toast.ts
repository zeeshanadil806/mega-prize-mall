"use client"

import { toast as sonnerToast } from "sonner"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

export function useToast() {
  const toast = ({
    title,
    description,
    variant = "default",
  }: ToastProps) => {
    const message = description ? `${title}: ${description}` : title || ""
    
    switch (variant) {
      case "destructive":
        return sonnerToast.error(message)
      case "success":
        return sonnerToast.success(message)
      default:
        return sonnerToast(message)
    }
  }

  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

// Direct export for simple usage
export { sonnerToast as toast }