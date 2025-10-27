'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame, MessageCircle } from 'lucide-react'
import { supabase, type Post } from '@/lib/supabase'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AskQuestion } from '@/components/ask-question'
import { ArticlesFeed } from '@/components/articles-feed'
import { QuestionsFeed } from '@/components/questions-feed'
import { ProfilePage } from '@/components/profile-page'
import { EngagementHeader } from '@/components/engagement-header'
import { PsychologicalCard } from '@/components/psychological-card'

const trendingTags = [
  { name: 'Startup', emoji: '🚀' },
  { name: 'Career', emoji: '💼' },
  { name: 'Spiritual', emoji: '🕉️' },
  { name: 'Technology', emoji: '💻' },
  { name: 'Culture', emoji: '🎭' },
  { name: 'Education', emoji: '📚' },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'ask' | 'articles' | 'questions' | 'profile'>('ask')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (data && !error) {
        setPosts(data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'ask':
        return <AskQuestion />
      case 'articles':
        return <ArticlesFeed />
      case 'questions':
        return <QuestionsFeed />
      case 'profile':
        return <ProfilePage />
      default:
        return (
          <div className="space-y-6 pb-20">
            {/* Trending Topics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Trending Topics
                </h2>
              </div>
              
              <div className="flex gap-3 overflow-x-auto pb-2">
                {trendingTags.map((tag) => (
                  <Badge
                    key={tag.name}
                    variant="secondary"
                    className="whitespace-nowrap cursor-pointer hover:bg-yellow-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    {tag.emoji} #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Recent Questions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Questions
                </h2>
              </div>
              
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="animate-pulse border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : posts.length > 0 ? (
                  posts.slice(0, 5).map((post) => (
                    <PsychologicalCard
                      key={post.id}
                      title={post.question}
                      description={post.description}
                      author={post.nickname}
                      timestamp={formatTimeAgo(post.created_at)}
                      category="General"
                      isAnswered={!!post.answer}
                      onClick={() => {
                        // Navigate to question detail
                      }}
                    />
                  ))
                ) : (
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 mb-2">No questions yet</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Be the first to ask a question!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <EngagementHeader />
      
      <main className="max-w-md mx-auto px-4 py-6">
        {renderContent()}
      </main>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Footer */}
      <div className="pb-16 pt-8">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            🇮🇳 Made with love for Indians, by Indians
          </p>
        </div>
      </div>
    </div>
  )
}
