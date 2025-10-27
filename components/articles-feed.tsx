'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase, type Post } from '@/lib/supabase'
import { useNickname } from '@/hooks/use-nickname'
import { EnhancedLoading } from '@/components/enhanced-loading'
import { EnhancedErrorDisplay } from '@/components/enhanced-error-display'
import { ChevronUp, ChevronDown, MessageCircle, Send, Play, Pause, Heart, Share2, User, Check, Copy } from 'lucide-react'

interface Comment {
  id: string
  comment: string
  nickname: string
  created_at: string
}

export function ArticlesFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set())
  const [showComments, setShowComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set())
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({})
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)
  const { nickname } = useNickname()

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .not('answer', 'is', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching articles:', error)
        setError('Failed to load articles')
      } else if (data) {
        setPosts(data)
        data.forEach(post => {
          fetchLikes(post.id)
        })
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
      setError('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const fetchLikes = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)

      if (error) {
        console.error('Error fetching likes:', error)
        return
      }

      if (data) {
        setLikes(prev => ({ ...prev, [postId]: data.length }))
        const userLiked = data.some(like => like.nickname === (nickname || 'Anonymous'))
        if (userLiked) {
          setUserLikes(prev => new Set([...prev, postId]))
        }
      }
    } catch (error) {
      console.error('Error fetching likes:', error)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return
      }

      if (data) {
        setComments(prev => ({ ...prev, [postId]: data }))
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleLike = async (postId: string) => {
    const isLiked = userLikes.has(postId)
    const currentNickname = nickname || 'Anonymous'
    
    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('nickname', currentNickname)
        
        if (error) {
          console.error('Error unliking post:', error)
          return
        }
        
        setUserLikes(prev => {
          const newSet = new Set(prev)
          newSet.delete(postId)
          return newSet
        })
        setLikes(prev => ({ ...prev, [postId]: Math.max(0, (prev[postId] || 0) - 1) }))
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ post_id: postId, nickname: currentNickname }])
        
        if (error) {
          console.error('Error liking post:', error)
          return
        }
        
        setUserLikes(prev => new Set([...prev, postId]))
        setLikes(prev => ({ ...prev, [postId]: (prev[postId] || 0) + 1 }))
      }
    } catch (error) {
      console.error('Error handling like:', error)
    }
  }

  const handleComment = async (postId: string) => {
    const comment = newComment[postId]?.trim()
    if (!comment) return

    setIsSubmittingComment(prev => ({ ...prev, [postId]: true }))

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          comment,
          nickname: nickname || 'Anonymous'
        }])

      if (error) {
        console.error('Error submitting comment:', error)
        return
      }

      setNewComment(prev => ({ ...prev, [postId]: '' }))
      fetchComments(postId)
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }))
    }
  }

  const handleShare = async (postId: string, question: string, slug?: string) => {
    const shareUrl = `${window.location.origin}/article/${slug || postId}`
    const shareText = `Check out this article on RytUp: "${question}"`
    
    try {
      // Primary method: Modern clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl)
        setCopiedPostId(postId)
        setTimeout(() => setCopiedPostId(null), 2000)
        return
      }
      
      // Fallback 1: Legacy clipboard method
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
        setCopiedPostId(postId)
        setTimeout(() => setCopiedPostId(null), 2000)
        return
      }
      
      // Fallback 2: Native share API
      if (navigator.share) {
        await navigator.share({
          title: 'RytUp Article',
          text: shareText,
          url: shareUrl
        })
        return
      }
      
      // Final fallback: Show URL in prompt
      const userCopied = prompt('Copy this link to share:', shareUrl)
      if (userCopied !== null) {
        setCopiedPostId(postId)
        setTimeout(() => setCopiedPostId(null), 2000)
      }
      
    } catch (error) {
      console.error('Error sharing:', error)
      
      // Emergency fallback: Show URL in alert
      alert(`Share this article: ${shareUrl}`)
    }
  }

  const toggleComments = (postId: string) => {
    const newShowComments = new Set(showComments)
    if (newShowComments.has(postId)) {
      newShowComments.delete(postId)
    } else {
      newShowComments.add(postId)
      if (!comments[postId]) {
        fetchComments(postId)
      }
    }
    setShowComments(newShowComments)
  }

  const toggleExpanded = (postId: string) => {
    const newExpanded = new Set(expandedPosts)
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId)
    } else {
      newExpanded.add(postId)
    }
    setExpandedPosts(newExpanded)
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
    
    if (diffInHours < 1) return 'now'
    if (diffInHours < 24) return `${diffInHours}h`
    return `${Math.floor(diffInHours / 24)}d`
  }

  const truncateText = (text: string, maxLength: number = 300) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return <EnhancedLoading />
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <EnhancedErrorDisplay
          error={error}
          type="error"
          onRetry={fetchArticles}
        />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <div className="max-w-2xl mx-auto">
        {posts.map((post) => {
          const isExpanded = expandedPosts.has(post.id)
          const showPostComments = showComments.has(post.id)
          const postComments = comments[post.id] || []
          const likeCount = likes[post.id] || 0
          const isLiked = userLikes.has(post.id)
          const isSubmittingThisComment = isSubmittingComment[post.id] || false
          const isCopied = copiedPostId === post.id
          
          return (
            <article key={post.id} className="border-b border-border animate-fade-in-up px-2 py-3 sm:px-4 sm:py-4">

              {/* Clean Post Header */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{post.nickname}</div>
                    <div className="text-caption">{formatTimeAgo(post.created_at)}</div>
                  </div>
                </div>

                {/* Question */}
                <h2 className="text-lg font-semibold mb-1 leading-snug">
                  {post.question}
                </h2>
                {post.description && (
                  <p className="text-body text-muted-foreground mb-2 leading-relaxed">
                    {post.description}
                  </p>
                )}

                {/* Answer */}
                <div className="text-body leading-relaxed whitespace-pre-wrap mb-2">
                  {isExpanded ? post.answer : truncateText(post.answer || '', 300)}
                </div>
                
                {post.answer && post.answer.length > 300 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(post.id)}
                    className="mb-3 h-auto p-0 text-caption hover:text-primary font-medium"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Show less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Read more
                      </>
                    )}
                  </Button>
                )}

                {/* Media */}
                {post.image_url && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img 
                      src={post.image_url || "/placeholder.svg"} 
                      alt="Post image" 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                )}

                {post.audio_url && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAudio(post.audio_url!)}
                      className="w-10 h-10 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {playingAudio === post.audio_url ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <span className="text-caption">Voice message</span>
                    {playingAudio === post.audio_url && (
                      <audio
                        src={post.audio_url}
                        autoPlay
                        onEnded={() => setPlayingAudio(null)}
                        className="hidden"
                      />
                    )}
                  </div>
                )}

                {/* Clean Actions */}
                <div className="flex items-center gap-4 pt-2 border-t border-border text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`h-10 px-3 rounded-lg transition-colors ${
                      isLiked 
                        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' 
                        : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="text-body-sm font-medium">{likeCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleComments(post.id)}
                    className="h-10 px-3 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span className="text-body-sm font-medium">{postComments.length}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(post.id, post.question, post.slug)}
                    className={`h-10 px-3 rounded-lg transition-colors ${
                      isCopied
                        ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        <span className="text-body-sm font-medium">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        <span className="text-body-sm font-medium">Share</span>
                      </>
                    )}
                  </Button>
                </div>

                {/* Clean Comments Section */}
                {showPostComments && (
                  <div className="mt-4 pt-4 border-t border-border">
                    {/* Existing Comments */}
                    {postComments.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {postComments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-body-sm font-medium">
                                  {comment.nickname}
                                </span>
                                <span className="text-caption">
                                  {formatTimeAgo(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-body-sm leading-relaxed">
                                {comment.comment}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <Input
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                        className="flex-1 focus-clean"
                        onKeyPress={(e) => e.key === 'Enter' && !isSubmittingThisComment && handleComment(post.id)}
                        disabled={isSubmittingThisComment}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleComment(post.id)}
                        disabled={!newComment[post.id]?.trim() || isSubmittingThisComment}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isSubmittingThisComment ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}

        {posts.length === 0 && (
          <div className="px-4 py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-title mb-2">No articles yet</h3>
            <p className="text-body text-muted-foreground">
              Be the first to share your knowledge!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
