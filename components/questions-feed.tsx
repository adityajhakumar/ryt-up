'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase, type Post } from '@/lib/supabase'
import { useNickname } from '@/hooks/use-nickname'
import { uploadToSupabaseStorage, initializeStorage } from '@/lib/storage-setup'
import { EnhancedMediaUpload } from '@/components/enhanced-media-upload'
import { EnhancedErrorDisplay } from '@/components/enhanced-error-display'
import { EnhancedLoading } from '@/components/enhanced-loading'
import { User, MessageSquare, CheckCircle, Edit3, Play, Pause, MoreHorizontal } from 'lucide-react'

export function QuestionsFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storageReady, setStorageReady] = useState(false)
  const { nickname } = useNickname()

  useEffect(() => {
    initializeStorageCheck()
    fetchQuestions()
  }, [])

  const initializeStorageCheck = async () => {
    const ready = await initializeStorage()
    setStorageReady(ready)
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError('Failed to load questions')
      } else if (data) {
        setPosts(data)
        setError(null)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setError('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (file: File | null, preview: string) => {
    setSelectedImage(file)
    setImagePreview(preview)
  }

  const handleAudioSelect = (file: File | null) => {
    setSelectedAudio(file)
  }

  const uploadMediaSimple = async () => {
    let imageUrl = null
    let audioUrl = null

    try {
      if (selectedImage && storageReady) {
        imageUrl = await uploadToSupabaseStorage(selectedImage, 'images')
      }

      if (selectedAudio && storageReady) {
        audioUrl = await uploadToSupabaseStorage(selectedAudio, 'audio')
      }
    } catch (error) {
      console.error('Media upload error:', error)
    }

    return { imageUrl, audioUrl }
  }

  const handleAnswerQuestion = async (questionId: string) => {
    if (!answer.trim()) {
      setError('Please write an answer before submitting')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      let imageUrl = null
      let audioUrl = null
      
      if (storageReady && (selectedImage || selectedAudio)) {
        const mediaResult = await uploadMediaSimple()
        imageUrl = mediaResult.imageUrl
        audioUrl = mediaResult.audioUrl
      }

      const updateData: any = {
        answer: answer.trim(),
        nickname: (nickname || 'Anonymous')
      }

      if (imageUrl && imageUrl.startsWith('http')) {
        updateData.image_url = imageUrl
      }
      if (audioUrl && audioUrl.startsWith('http')) {
        updateData.audio_url = audioUrl
      }

      const { data, error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', questionId)
        .select()

      if (error) {
        console.error('Supabase update error:', error)
        setError(`Failed to submit answer: ${error.message}`)
      } else {
        setAnswer('')
        setSelectedQuestion(null)
        setSelectedImage(null)
        setSelectedAudio(null)
        setImagePreview(null)
        await fetchQuestions()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      setError('Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
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
    
    if (diffInHours < 1) return 'now'
    if (diffInHours < 24) return `${diffInHours}h`
    return `${Math.floor(diffInHours / 24)}d`
  }

  const clearError = () => setError(null)

  if (loading) {
    return <EnhancedLoading />
  }

  return (
    <div className="pb-20">
      {/* Error Message */}
      {error && (
        <div className="content-padding py-2">
          <EnhancedErrorDisplay
            error={error}
            type="error"
            onDismiss={clearError}
          />
        </div>
      )}

      {/* Questions Feed - Full Width */}
      <div className="content-spacing">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className={`bg-card border-b border-border px-3 py-2 sm:px-4 sm:py-3 hover:bg-muted/50 transition-colors ${
              selectedQuestion === post.id ? 'bg-muted/20' : ''
            }`}
          >
            {/* Post Header */}
            <div className="content-padding py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <span className="text-body-sm font-medium">{post.nickname}</span>
                      <span className="text-caption">•</span>
                      <span className="text-caption">{formatTimeAgo(post.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  {post.answer ? (
                    <div className="flex items-center gap-xs bg-green-100 dark:bg-green-950/20 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      <span className="text-caption font-medium">Answered</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-xs bg-orange-100 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full">
                      <MessageSquare className="w-3 h-3" />
                      <span className="text-caption font-medium">Open</span>
                    </div>
                  )}
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Question Content */}
            <div className="content-padding pb-3">
              <h2 className="text-title font-semibold leading-tight mb-2">
                {post.question}
              </h2>
              {post.description && (
                <p className="text-body-sm text-muted-foreground leading-relaxed">
                  {post.description}
                </p>
              )}

              {post.answer ? (
                <div className="mt-3 space-sm">
                  <div className="bg-muted/30 rounded-lg p-3 border-l-4 border-green-400">
                    <p className="text-body leading-relaxed whitespace-pre-wrap">
                      {post.answer}
                    </p>
                  </div>

                  {/* Media in answer */}
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden">
                      <img src={post.image_url || "/placeholder.svg"} alt="Answer image" className="w-full h-48 object-cover" />
                    </div>
                  )}

                  {post.audio_url && (
                    <div className="flex items-center gap-sm p-3 bg-muted/50 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAudio(post.audio_url!)}
                        className="w-8 h-8 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {playingAudio === post.audio_url ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </Button>
                      <span className="text-caption">Voice answer</span>
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
                </div>
              ) : (
                <div className="mt-3">
                  {selectedQuestion === post.id ? (
                    <div className="space-md p-4 bg-muted/20 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-sm text-caption text-muted-foreground mb-2">
                        <Edit3 className="w-4 h-4" />
                        <span>Share your knowledge:</span>
                      </div>
                      
                      <Textarea
                        placeholder="Write your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="min-h-[120px] border-border focus-professional bg-background resize-y"
                      />
                      
                      <div className="text-caption text-right text-muted-foreground mt-1">
                        {answer.length} characters
                      </div>

                      {/* Enhanced Media Upload */}
                      {storageReady && (
                        <div className="mt-3">
                          <EnhancedMediaUpload
                            onImageSelect={handleImageSelect}
                            onAudioSelect={handleAudioSelect}
                            selectedImage={selectedImage}
                            selectedAudio={selectedAudio}
                            imagePreview={imagePreview}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}

                      <div className="flex gap-sm mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedQuestion(null)
                            setAnswer('')
                            setSelectedImage(null)
                            setSelectedAudio(null)
                            setImagePreview(null)
                            setError(null)
                          }}
                          className="flex-1 h-9"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAnswerQuestion(post.id)}
                          disabled={!answer.trim() || isSubmitting}
                          className="flex-1 h-9 btn-primary-pro"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-xs">
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>
                              Submitting...
                            </div>
                          ) : (
                            'Submit Answer'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuestion(post.id)
                        setError(null)
                      }}
                      className="w-full h-9 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Answer this Question
                    </Button>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}

        {posts.length === 0 && !loading && (
          <div className="content-padding py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-title font-semibold mb-2">No questions yet</h3>
            <p className="text-body-sm text-muted-foreground">
              Be the first to ask a question!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
