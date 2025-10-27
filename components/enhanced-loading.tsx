'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function EnhancedLoading() {
  return (
    <div className="space-y-6 pb-20">
      {/* Header Skeleton */}
      <div className="text-center space-y-3">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
        <div className="flex justify-center gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              
              {/* Meta info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>

              {/* Action button */}
              <Skeleton className="h-9 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
