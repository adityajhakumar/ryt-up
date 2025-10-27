'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useNickname } from '@/hooks/use-nickname'
import { generateUniqueSlug } from '@/lib/utils'
import { initializeStorage, uploadToSupabaseStorage, convertToDataUrl } from '@/lib/storage-setup'
import { EnhancedMediaUpload } from '@/components/enhanced-media-upload'
import { EnhancedErrorDisplay } from '@/components/enhanced-error-display'
import { CheckCircle, HelpCircle, PenTool, AlertTriangle, RefreshCw } from 'lucide-react'

export function AskQuestion() {
  const [question, setQuestion] = useState('')
  const [description, setDescription] = useState('')
  const [answer, setAnswer] = useState('')
  const [postType, setPostType] = useState<'question-only' | 'question-answer'>('question-only')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [storageReady, setStorageReady] = useState(false)
  const [isCheckingStorage, setIsCheckingStorage] = useState(true)
  const { nickname } = useNickname()

  useEffect(() => {
    initializeStorageCheck()
  }, [])

  const initializeStorageCheck = async () => {
    setIsCheckingStorage(true)
    const ready = await initializeStorage()
    setStorageReady(ready)
    setIsCheckingStorage(false)
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
      if (selectedImage) {
        if (storageReady) {
          imageUrl = await uploadToSupabaseStorage(selectedImage, 'images')
        } else {
          imageUrl = await convertToDataUrl(selectedImage)
        }
      }

      if (selectedAudio) {
        if (storageReady) {
          audioUrl = await uploadToSupabaseStorage(selectedAudio, 'audio')
        } else {
          audioUrl = await convertToDataUrl(selectedAudio)
        }
      }
    } catch (error) {
      console.error('Media upload error:', error)
    }

    return { imageUrl, audioUrl }
  }

  const handleSubmitPost = async () => {
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    if (postType === 'question-answer' && !answer.trim()) {
      setError('Please provide an answer for your question')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      let imageUrl = null
      let audioUrl = null
      
      if (selectedImage || selectedAudio) {
        const mediaResult = await uploadMediaSimple()
        imageUrl = mediaResult.imageUrl
        audioUrl = mediaResult.audioUrl
      }

      // Generate a temporary slug using current timestamp
      const tempSlug = generateUniqueSlug(question, Date.now().toString())

      const postData: any = {
        question: question.trim(),
        description: description.trim() || null,
        nickname: (nickname || 'Anonymous'),
        slug: tempSlug // Include slug in initial insert
      }

      if (postType === 'question-answer') {
        postData.answer = answer.trim()
      }

      if (imageUrl) postData.image_url = imageUrl
      if (audioUrl) postData.audio_url = audioUrl

      const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()

      if (insertError) {
        console.error('Supabase insert error:', insertError)
        setError(`Failed to submit post: ${insertError.message}`)
        return
      }

      // Now update with the proper slug using the actual ID
      const properSlug = generateUniqueSlug(question, insertData.id)
      const { error: updateError } = await supabase
        .from('posts')
        .update({ slug: properSlug })
        .eq('id', insertData.id)

      if (updateError) {
        console.error('Error updating slug:', updateError)
        // Don't fail the whole operation for slug update
      }

      setIsComplete(true)
      setTimeout(() => {
        resetForm()
      }, 3000)
    } catch (error) {
      console.error('Error submitting post:', error)
      setError('Failed to submit post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setQuestion('')
    setDescription('')
    setAnswer('')
    setPostType('question-only')
    setSelectedImage(null)
    setSelectedAudio(null)
    setImagePreview(null)
    setIsComplete(false)
    setError(null)
  }

  const clearError = () => setError(null)

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="card-clean">
          <CardContent className="p-8 text-center space-clean">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-primary-foreground" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-headline">
                {postType === 'question-only' ? 'Question Posted!' : 'Article Published!'}
              </h2>
              <p className="text-body text-muted-foreground">
                {postType === 'question-only' 
                  ? 'Your question is now live for the community to answer.'
                  : 'Your question and answer have been shared as an article.'
                }
              </p>
            </div>

            <Button 
              onClick={resetForm} 
              className="btn-primary-clean"
            >
              {postType === 'question-only' ? 'Ask Another Question' : 'Create Another Post'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="pb-20">
      {/* Clean Hero Section */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center space-clean">
          {/* Welcome */}
          <div className="space-y-4">
            <h1 className="text-display">Welcome to RytUp</h1>
            <p className="text-body text-muted-foreground">
              A platform for meaningful questions and answers
            </p>
          </div>

          {/* Clean CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <h2 className="text-title mb-2">Ask a Question That Matters</h2>
              <p className="text-sm opacity-90">What's on your mind today?</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-clean">
        {/* Clean Storage Status */}
        {isCheckingStorage && (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-foreground border-t-transparent"></div>
            <span className="text-body-sm">Checking media upload availability...</span>
          </div>
        )}

        {!isCheckingStorage && !storageReady && (
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
            <AlertTriangle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <span className="text-body-sm">Media uploads unavailable. Text posts work fine.</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={initializeStorageCheck}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <EnhancedErrorDisplay
            error={error}
            type="error"
            onDismiss={clearError}
          />
        )}

        {/* Clean Post Type Selection */}
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="text-title">What would you like to do?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={postType} onValueChange={(value: 'question-only' | 'question-answer') => setPostType(value)}>
              <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                postType === 'question-only' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <RadioGroupItem value="question-only" id="question-only" />
                <Label htmlFor="question-only" className="flex items-center gap-3 cursor-pointer flex-1">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Only ask a question</div>
                    <div className="text-caption">Let the community answer</div>
                  </div>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                postType === 'question-answer' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}>
                <RadioGroupItem value="question-answer" id="question-answer" />
                <Label htmlFor="question-answer" className="flex items-center gap-3 cursor-pointer flex-1">
                  <PenTool className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Ask and answer now</div>
                    <div className="text-caption">Share your knowledge as an article</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Clean Question Form */}
        <Card className="card-clean">
          <CardHeader>
            <CardTitle className="text-title">Your Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="block text-body-sm font-medium">
                Question Title *
              </label>
              <Input
                placeholder="What would you like to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="focus-clean"
              />
              <div className="text-caption">
                {question.length} characters
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-body-sm font-medium">
                Additional Details (Optional)
              </label>
              <Textarea
                placeholder="Provide more context or background..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] focus-clean resize-none"
              />
              <div className="text-caption">
                {description.length} characters
              </div>
            </div>

            {/* Media Upload */}
            {!isCheckingStorage && storageReady && (
              <div className="space-y-2">
                <label className="block text-body-sm font-medium">
                  Add Media (Optional)
                </label>
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
          </CardContent>
        </Card>

        {/* Clean Answer Form */}
        {postType === 'question-answer' && (
          <Card className="card-clean">
            <CardHeader>
              <CardTitle className="text-title">Your Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="block text-body-sm font-medium">
                  Share Your Knowledge *
                </label>
                <Textarea
                  placeholder="Write your detailed answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[200px] focus-clean resize-y"
                />
                <div className="text-caption">
                  {answer.length} characters
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clean Submit Button */}
        <Button
          onClick={handleSubmitPost}
          disabled={!question.trim() || (postType === 'question-answer' && !answer.trim()) || isSubmitting}
          className="w-full btn-primary-clean disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
              Publishing...
            </div>
          ) : (
            postType === 'question-only' ? 'Post Question' : 'Publish Article'
          )}
        </Button>
      </div>
    </div>
  )
}
