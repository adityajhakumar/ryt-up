'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square, Upload } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface VoiceRecorderProps {
  onAudioUploaded: (audioUrl: string) => void
  disabled?: boolean
}

export function VoiceRecorder({ onAudioUploaded, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await uploadAudio(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadAudio = async (audioBlob: Blob) => {
    setIsUploading(true)
    try {
      const fileName = `audio_${Date.now()}.webm`
      const { data, error } = await supabase.storage
        .from('audio-answers')
        .upload(fileName, audioBlob)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('audio-answers')
        .getPublicUrl(fileName)

      onAudioUploaded(publicUrl)
    } catch (error) {
      console.error('Error uploading audio:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          disabled={disabled || isUploading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Mic className="h-4 w-4" />
          Record Voice
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2 animate-pulse"
        >
          <Square className="h-4 w-4" />
          Stop Recording
        </Button>
      )}
      
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
    </div>
  )
}
