'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle, BookOpen, MessageSquare, User } from 'lucide-react'

interface BottomNavigationProps {
  activeTab: 'ask' | 'articles' | 'questions' | 'profile'
  onTabChange: (tab: 'ask' | 'articles' | 'questions' | 'profile') => void
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: 'ask', label: 'Ask', icon: PlusCircle },
    { id: 'articles', label: 'Articles', icon: BookOpen },
    { id: 'questions', label: 'Questions', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {tabs.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 rounded-lg transition-all duration-200 ${
                activeTab === id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
