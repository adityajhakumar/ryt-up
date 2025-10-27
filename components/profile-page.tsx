'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useNickname } from '@/hooks/use-nickname'
import { User, Edit3, Save, Flag, Heart, MessageCircle, BookOpen } from 'lucide-react'

export function ProfilePage() {
  const { nickname, updateNickname } = useNickname()
  const [isEditing, setIsEditing] = useState(false)
  const [tempNickname, setTempNickname] = useState(nickname)

  const handleSave = () => {
    updateNickname(tempNickname.trim() || 'Anonymous')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempNickname(nickname)
    setIsEditing(false)
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="text-center">
          <h1 className="heading-secondary text-foreground">Profile</h1>
          <p className="caption-text">Manage your identity on RytUp</p>
        </div>
      </div>

      <div className="px-4 py-4 mobile-spacing">
        {/* Profile Card */}
        <Card className="mobile-card border-border shadow-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={tempNickname}
                  onChange={(e) => setTempNickname(e.target.value)}
                  placeholder="Enter your nickname"
                  className="text-center border-border focus:border-yellow-400 focus:ring-yellow-400/20"
                />
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="btn-secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="heading-secondary text-foreground">
                    {nickname || 'Anonymous'}
                  </h2>
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300">
                    🇮🇳 Indian
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary"
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit Nickname
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="mobile-card border-border text-center">
            <CardContent className="p-4">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <Heart className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-lg font-bold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Likes Given</div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card border-border text-center">
            <CardContent className="p-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Comments</div>
            </CardContent>
          </Card>
          
          <Card className="mobile-card border-border text-center">
            <CardContent className="p-4">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-lg font-bold text-foreground">0</div>
              <div className="text-xs text-muted-foreground">Articles</div>
            </CardContent>
          </Card>
        </div>

        {/* About RytUp */}
        <Card className="mobile-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="heading-secondary flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-600" />
              About RytUp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-foreground">
                Voices of India, for India
              </h3>
              <p className="body-text text-muted-foreground leading-relaxed">
                RytUp is a platform where Indians share knowledge, ask questions, and build community. 
                No login required - just pure, authentic conversations.
              </p>
              <Badge className="bg-gradient-to-r from-orange-500 to-green-500 text-white border-0">
                🇮🇳 Made with love for Indians, by Indians
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* How RytUp Works */}
        <Card className="mobile-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="heading-secondary">How RytUp Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-950/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Ask & Answer</h4>
                  <p className="text-sm text-muted-foreground">Post a question and immediately share your own answer</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-950/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Read Articles</h4>
                  <p className="text-sm text-muted-foreground">Browse complete Q&A posts from the community</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-950/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Help Others</h4>
                  <p className="text-sm text-muted-foreground">Answer open questions and share your knowledge</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
