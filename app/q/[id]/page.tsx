'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { VoiceRecorder } from '@/components/voice-recorder'
import { ArrowLeft, Clock, ThumbsUp, MessageCircle, Volume2, User } from 'lucide-react'
import { supabase, type Question, type Answer } from '@/lib/supabase'

export default function QuestionPage() {
  const params = useParams()
  const router = useRouter()
  const questionId = params.id as string

  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [newAnswer, setNewAnswer] = useState('')
  const [nickname, setNickname] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debateMode, setDebateMode] = useState(false)

  useEffect(() => {
    if (questionId) {
      fetchQuestion()
      fetchAnswers()
    }
  }, [questionId])

  const fetchQuestion = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single()

    if (data && !error) {
      setQuestion(data)
    }
  }

  const fetchAnswers = async () => {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('question_id', questionId)
      .order('upvotes', { ascending: false })

    if (data && !error) {
      setAnswers(data)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim() && !nickname.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('answers')
        .insert([
          {
            question_id: questionId,
            text: newAnswer.trim(),
            nickname: nickname.trim() || 'Anonymous',
            stance: 'neutral'
          }
        ])

      if (!error) {
        setNewAnswer('')
        setNickname('')
        fetchAnswers()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpvote = async (answerId: string) => {
    const answer = answers.find(a => a.id === answerId)
    if (!answer) return

    const { error } = await supabase
      .from('answers')
      .update({ upvotes: answer.upvotes + 1 })
      .eq('id', answerId)

    if (!error) {
      fetchAnswers()
    }
  }

  const handleAudioUploaded = async (audioUrl: string) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('answers')
        .insert([
          {
            question_id: questionId,
            audio_url: audioUrl,
            nickname: nickname.trim() || 'Anonymous',
            stance: 'neutral'
          }
        ])

      if (!error) {
        setNickname('')
        fetchAnswers()
      }
    } catch (error) {
      console.error('Error submitting voice answer:', error)
    } finally {
      setIsSubmitting(false)
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

  const agreeAnswers = answers.filter(a => a.stance === 'agree')
  const disagreeAnswers = answers.filter(a => a.stance === 'disagree')
  const neutralAnswers = answers.filter(a => a.stance === 'neutral')

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading question...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              RytUp
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Question Card */}
        <Card className="border-orange-200 dark:border-gray-700 shadow-lg">
          <CardHeader>
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {question.question}
              </h1>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {question.tag}
                </Badge>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTimeAgo(question.timestamp)}
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {answers.length} answers
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Answer Input */}
        <Card className="border-orange-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">
              Share Your Thoughts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Your nickname (optional)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="border-orange-200 dark:border-gray-600"
              />
            </div>
            
            <Textarea
              placeholder="Write your answer here..."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="min-h-[100px] border-orange-200 dark:border-gray-600"
            />
            
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <VoiceRecorder 
                onAudioUploaded={handleAudioUploaded}
                disabled={isSubmitting}
              />
              
              <Button
                onClick={handleSubmitAnswer}
                disabled={!newAnswer.trim() || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Answers ({answers.length})
            </h2>
          </div>

          <div className="space-y-4">
            {answers.map((answer) => (
              <Card key={answer.id} className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {answer.nickname}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(answer.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpvote(answer.id)}
                        className="flex items-center gap-1 text-gray-500 hover:text-orange-600"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {answer.upvotes}
                      </Button>
                    </div>

                    {answer.text && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {answer.text}
                      </p>
                    )}

                    {answer.audio_url && (
                      <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-gray-800 rounded-lg">
                        <Volume2 className="h-4 w-4 text-orange-600" />
                        <audio controls className="flex-1">
                          <source src={answer.audio_url} type="audio/webm" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {answers.length === 0 && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No answers yet. Be the first to share your thoughts!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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
