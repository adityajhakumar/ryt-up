'use client'

import { supabase } from './supabase'

export async function checkStorageAvailability() {
  try {
    // Simple test to check if we can access storage
    const { data, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.warn('Storage not available:', error.message)
      return false
    }

    // Check if media bucket exists
    const bucketExists = data?.some(bucket => bucket.name === 'media')
    
    if (!bucketExists) {
      console.warn('Media bucket not found')
      return false
    }

    return true
  } catch (error) {
    console.warn('Storage check failed:', error)
    return false
  }
}

export async function uploadToSupabaseStorage(file: File, folder: 'images' | 'audio') {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
    
    // Upload file
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}

// Fallback: Convert file to base64 data URL for local storage
export function convertToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Initialize storage - check if bucket exists and create if needed
export async function initializeStorage() {
  try {
    console.log('Checking storage availability...')
    
    // First check if we can access storage at all
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.warn('Cannot access storage:', listError.message)
      return false
    }

    // Check if media bucket exists
    const bucketExists = buckets?.some(bucket => bucket.name === 'media')
    
    if (bucketExists) {
      console.log('Media bucket found')
      return true
    }

    console.log('Media bucket not found - this is expected if not created via SQL')
    return false
  } catch (error) {
    console.warn('Storage initialization failed:', error)
    return false
  }
}
