'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { useState, useEffect } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleThemeToggle}
      className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-gray-600 dark:text-gray-400" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-gray-600 dark:text-gray-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
