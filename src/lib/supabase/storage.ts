'use client'

import { createClient } from './client'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export class SupabaseStorageService {
  private supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createClient()
  }

  // Upload an image file
  async uploadImage(
    file: File,
    bucket: string = 'property-images',
    folder: string = '',
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const name = fileName || `${timestamp}-${Math.random().toString(36).substring(7)}`
      const fullPath = folder ? `${folder}/${name}.${extension}` : `${name}.${extension}`

      const { data, error } = await this.supabase
        .storage
        .from(bucket)
        .upload(fullPath, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: { publicUrl } } = this.supabase
        .storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        path: data.path
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      return {
        url: '',
        path: '',
        error: error.message || 'Failed to upload file'
      }
    }
  }

  // Upload multiple images
  async uploadImages(
    files: File[],
    bucket: string = 'property-images',
    folder: string = ''
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    for (const file of files) {
      const result = await this.uploadImage(file, bucket, folder)
      results.push(result)
    }
    
    return results
  }

  // Delete an image
  async deleteImage(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .storage
        .from(bucket)
        .remove([path])
      
      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting file:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all images in a folder
  async getImages(bucket: string, folder: string): Promise<{ urls: string[]; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .storage
        .from(bucket)
        .list(folder)

      if (error) throw error
      
      const urls = data.map(item => {
          const { data: { publicUrl } } = this.supabase
            .storage
            .from(bucket)
            .getPublicUrl(`${folder ? folder + '/' : ''}${item.name}`)
          return publicUrl
      })

      return { urls }
    } catch (error: any) {
      console.error('Error listing files:', error)
      return { urls: [], error: error.message }
    }
  }

  // Upload property images
  async uploadPropertyImages(
    propertyId: string,
    images: File[]
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    
    for (let i = 0; i < images.length; i++) {
        const result = await this.uploadImage(images[i], 'property-images', propertyId, `image-${i + 1}`)
        results.push(result)
    }
    
    return results
  }

  // Upload user avatar
  async uploadAvatar(
    userId: string,
    file: File
  ): Promise<UploadResult> {
    return this.uploadImage(file, 'user-avatars', userId, 'avatar')
  }

  // Get placeholder image URL (for fallback)
  getPlaceholderImage(width: number = 400, height: number = 300): string {
    return `https://picsum.photos/${width}/${height}`
  }
}

let storageServiceInstance: SupabaseStorageService | null = null

export function getStorageService(): SupabaseStorageService {
  if (!storageServiceInstance) {
    storageServiceInstance = new SupabaseStorageService()
  }
  return storageServiceInstance
}
