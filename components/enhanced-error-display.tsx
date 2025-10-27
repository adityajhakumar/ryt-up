'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, X } from 'lucide-react'

interface EnhancedErrorDisplayProps {
  error: string
  onRetry?: () => void
  onDismiss?: () => void
  type?: 'error' | 'warning' | 'info'
}

export function EnhancedErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  type = 'error' 
}: EnhancedErrorDisplayProps) {
  const colors = {
    error: {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-800 dark:text-red-300',
      icon: 'text-red-600'
    },
    warning: {
      border: 'border-yellow-200 dark:border-yellow-800',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: 'text-yellow-600'
    },
    info: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'text-blue-600'
    }
  }

  const colorScheme = colors[type]

  return (
    <Card className={`${colorScheme.border} ${colorScheme.bg} animate-in slide-in-from-top-2 duration-300`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-5 w-5 ${colorScheme.icon} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <p className={`${colorScheme.text} font-medium`}>
              {error}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className={`h-8 w-8 p-0 ${colorScheme.text} hover:bg-white/50`}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className={`h-8 w-8 p-0 ${colorScheme.text} hover:bg-white/50`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
