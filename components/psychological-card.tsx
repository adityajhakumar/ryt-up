'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PsychologicalCardProps {
  title: string
  description?: string
  author: string
  timestamp: string
  category: string
  isAnswered?: boolean
  onClick?: () => void
  className?: string
}

export function PsychologicalCard({
  title,
  description,
  author,
  timestamp,
  category,
  isAnswered = false,
  onClick,
  className
}: PsychologicalCardProps) {
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200 border-gray-200 dark:border-gray-700",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-semibold leading-tight text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {description}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Badge 
              variant={isAnswered ? "default" : "outline"}
              className={cn(
                "text-xs",
                isAnswered 
                  ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300" 
                  : "text-orange-700 border-orange-300 dark:text-orange-400"
              )}
            >
              {category}
            </Badge>
            
            {isAnswered && (
              <Badge className="bg-green-500 text-white text-xs">
                ✓ Answered
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="font-medium">{author}</span>
              <span className="text-orange-500">🇮🇳</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timestamp}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
