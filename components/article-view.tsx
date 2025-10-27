'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase, type Post } from '@/lib/supabase'
import { useNickname } from '@/hooks/use-nickname'
import { EngagementHeader } from '@/components/engagement-header'
import { Heart, MessageCircle, Share2, User, Clock, ArrowLeft, Play, Pause, Send, Check, Copy } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  comment: string
  nickname: string
  created_at: string
}

interface ArticleViewProps {
  article: Post
}

export function ArticleView({ article }: ArticleViewProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const { nickname } = useNickname()

  useEffect(() => {
    fetchComments()
    fetchLikes()
  }, [article.id])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', article.id)
        .order('created_at', { ascending: true })

      if (data && !error) {
        setComments(data)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const fetchLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', article.id)

      if (data && !error) {
        setLikes(data.length)
        const userLiked = data.some(like => like.nickname === (nickname || 'Anonymous'))
        setIsLiked(userLiked)
      }
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const handleLike = async () => {
    const currentNickname = nickname || 'Anonymous'
    
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', article.id)
          .eq('nickname', currentNickname)
        
        if (!error) {
          setIsLiked(false)
          setLikes(prev => Math.max(0, prev - 1))
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: article.id, nickname: currentNickname }])
        
        if (!error) {
          setIsLiked(true)
          setLikes(prev => prev + 1)
        }
      }
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handleComment = async () => {
    const comment = newComment.trim()
    if (!comment) return

    setIsSubmittingComment(true)

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: article.id,
          comment,
          nickname: nickname || 'Anonymous'
        }])

      if (!error) {
        setNewComment('')
        fetchComments()
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Check out this article on RytUp: "${article.question}"`
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
        return
      }
      
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)
      
      if (successful) {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
        return
      }
      
      if (navigator.share) {
        await navigator.share({
          title: 'RytUp Article',
          text: shareText,
          url: shareUrl
        })
        return
      }
      
      const userCopied = prompt('Copy this link to share:', shareUrl)
      if (userCopied !== null) {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      }
      
    } catch (error) {
      console.error('Error sharing:', error)
      alert(`Share this article: ${shareUrl}`)
    }
  }

  const toggleAudio = (audioUrl: string) => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null)
    } else {
      setPlayingAudio(audioUrl)
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      <EngagementHeader />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to RytUp
            </Button>
          </Link>
        </div>

        {/* Article Card */}
        <Card className="border border-border bg-background">
          <CardContent className="px-4 py-3 sm:px-6 sm:py-4">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-foreground">{article.nickname}</div>
                <div className="flex items-center gap-2 text-caption">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(article.created_at)}
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300">
                    🇮🇳 Indian
                  </Badge>
                </div>
              </div>
            </div>

            {/* Question */}
            <h1 className="text-xl sm:text-2xl font-semibold mb-3 leading-snug">
              {article.question}
            </h1>

            {article.description && (
              <p className="text-body text-muted-foreground mb-6 leading-relaxed">
                {article.description}
              </p>
            )}

            {/* Answer */}
            <div className="prose prose-lg max-w-none mb-6">
              <div className="bg-muted/30 rounded-lg p-6 border-l-4 border-primary">
                <p className="text-body leading-relaxed whitespace-pre-wrap m-0">
                  {article.answer}
                </p>
              </div>
            </div>

            {/* Media */}
            {article.image_url && (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img 
                  src={article.image_url || "/placeholder.svg"} 
                  alt="Article image" 
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {article.audio_url && (
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAudio(article.audio_url!)}
                  className="w-12 h-12 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {playingAudio === article.audio_url ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <span className="text-body-sm">Voice message from {article.nickname}</span>
                {playingAudio === article.audio_url && (
                  <audio
                    src={article.audio_url}
                    autoPlay
                    onEnded={() => setPlayingAudio(null)}
                    className="hidden"
                  />
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-6 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`h-12 px-4 rounded-lg transition-colors ${
                  isLiked 
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' 
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-body font-medium">{likes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-12 px-4 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                <span className="text-body font-medium">{comments.length}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className={`h-12 px-4 rounded-lg transition-colors ${
                  isCopied
                    ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    <span className="text-body font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5 mr-2" />
                    <span className="text-body font-medium">Share</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="card-clean mt-6">
          <CardContent className="p-6">
            <h3 className="text-title mb-4">
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            <div className="flex gap-3 mb-6">
              <Input
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 focus-clean"
                onKeyPress={(e) => e.key === 'Enter' && !isSubmittingComment && handleComment()}
                disabled={isSubmittingComment}
              />
              <Button
                onClick={handleComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmittingComment ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-body font-medium">
                        {comment.nickname}
                      </span>
                      <span className="text-caption">
                        {formatTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-body leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-body text-muted-foreground">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-gradient-to-r from-orange-500 to-green-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg font-medium">
            🇮🇳 Made with love for Indians, by Indians
          </p>
        </div>
      </footer>
    </div>
  )
}
