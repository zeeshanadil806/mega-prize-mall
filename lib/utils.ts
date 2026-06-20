import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

import { formatCurrency } from "@/shared/format";
export { formatCurrency };

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-PK').format(num);
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

// Format date and time
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

// Truncate text
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + "..."
}

// Generate unique ID
export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Escape user input before using it in a Mongo $regex query.
// Without this, a search like "(.+)+$" can trigger catastrophic backtracking,
// and characters like `.` `*` `?` `(` `)` would be treated as regex operators
// instead of literal characters the user typed.
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
