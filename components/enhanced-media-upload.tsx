'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Image, Mic, Play, Pause, Camera, FileAudio } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onAudioSelect: (file: File) => void
  selectedImage?: File | null
  selectedAudio?: File | null
  imagePreview?: string | null
  disabled?: boolean
  className?: string
}

export function EnhancedMediaUpload({
  onImageSelect,
  onAudioSelect,
  selectedImage,
  selectedAudio,
  imagePreview,
  disabled = false,
  className
}: MediaUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file too large. Please choose a file under 5MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const preview = e.target?.result as string
        onImageSelect(file, preview)
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 500)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }

    clearInterval(progressInterval)
  }

  const handleAudioUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('Audio file too large. Please choose a file under 10MB.')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      onAudioSelect(file)
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      console.error('Error processing audio:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }

    clearInterval(progressInterval)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(f => f.type.startsWith('image/'))
    const audioFile = files.find(f => f.type.startsWith('audio/'))

    if (imageFile) handleImageUpload(imageFile)
    if (audioFile) handleAudioUpload(audioFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-all duration-200",
          dragOver 
            ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20" 
            : "border-gray-300 dark:border-gray-600 hover:border-yellow-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Upload className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Images up to 5MB, Audio up to 10MB
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => imageInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Add Image
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => audioInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="flex items-center gap-2"
            >
              <Mic className="h-4 w-4" />
              Add Audio
            </Button>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
        }}
        className="hidden"
      />
      
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleAudioUpload(file)
        }}
        className="hidden"
      />

      {/* Media Previews */}
      <div className="space-y-3">
        {/* Image Preview */}
        {selectedImage && imagePreview && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <img 
                    src={imagePreview || "/placeholder.svg"} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="absolute -top-2 -right-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        onImageSelect(null as any, '')
                        if (imageInputRef.current) imageInputRef.current.value = ''
                      }}
                      className="h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-300">
                      Image Added
                    </span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 truncate">
                    {selectedImage.name}
                  </p>
                  <p className="text-xs text-green-500">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audio Preview */}
        {selectedAudio && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                    <FileAudio className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      Audio Added
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 truncate">
                    {selectedAudio.name}
                  </p>
                  <p className="text-xs text-blue-500">
                    {(selectedAudio.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onAudioSelect(null as any)
                    if (audioInputRef.current) audioInputRef.current.value = ''
                  }}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
