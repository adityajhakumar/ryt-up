import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '') // Trim hyphens from start/end
    .substring(0, 50) // Limit length
}

export function generateUniqueSlug(text: string, id: string): string {
  const baseSlug = generateSlug(text)
  const shortId = id.substring(0, 8)
  return `${baseSlug}-${shortId}`
}
