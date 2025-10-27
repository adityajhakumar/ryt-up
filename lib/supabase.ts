import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Post = {
  id: string
  question: string
  description?: string
  answer?: string
  nickname: string
  image_url?: string
  audio_url?: string
  slug?: string
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  comment: string
  nickname: string
  created_at: string
}

export type Like = {
  id: string
  post_id: string
  nickname: string
  created_at: string
}

export type Question = {
  id: string
  question: string
  tag: string
  language: string
  timestamp: string
}

export type Answer = {
  id: string
  question_id: string
  text?: string
  audio_url?: string
  nickname: string
  upvotes: number
  timestamp: string
  stance: 'agree' | 'disagree' | 'neutral'
}
