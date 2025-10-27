'use client'

import { ThemeToggle } from '@/components/theme-toggle'

export function EngagementHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Empty for balance */}
          <div className="w-10"></div>
          
          {/* Center: Clean Logo Text */}
          <div className="flex flex-col items-center">
            <h1 className="logo-text mb-1">
              RytUp
            </h1>
            <p className="text-caption font-medium">
              Ask. Answer. Rise.
            </p>
          </div>
          
          {/* Right: Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
