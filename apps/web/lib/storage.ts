import { createClient } from '@supabase/supabase-js'

/**
 * Service role client for admin operations on Supabase Storage
 * Uses service role key for elevated permissions (upload, delete)
 * Lazy-loaded to prevent browser initialization errors
 */
let supabaseAdmin: ReturnType<typeof createClient> | null = null

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured')
    }
    
    supabaseAdmin = createClient(url, key)
  }
  return supabaseAdmin
}

/**
 * Storage helper functions for provider photo management
 * Uses signed URLs for secure access and service role for uploads
 */

export interface UploadResult {
  path: string
  url: string
}

/**
 * Generate a signed URL for accessing a private photo
 * @param path - Storage path of the photo
 * @param ttl - Time to live in seconds (default: 15 minutes)
 */
export async function getSignedPhotoUrl(path: string, ttl: number = 900): Promise<string> {
  const { data, error} = await getSupabaseAdmin().storage
    .from('provider-photos')
    .createSignedUrl(path, ttl)
  
  if (error) {
    console.error('Error generating signed URL:', error)
    throw new Error('Failed to generate photo URL')
  }
  
  return data.signedUrl
}

/**
 * Upload a provider photo to Supabase Storage
 * @param file - Photo file to upload
 * @param providerId - Provider ID for folder structure
 * @returns Upload result with path and public URL
 */
export async function uploadProviderPhoto(
  file: File, 
  providerId: string
): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.')
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${providerId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await getSupabaseAdmin().storage
    .from('provider-photos')
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true
    })
  
  if (error) {
    console.error('Error uploading photo:', error)
    throw new Error('Failed to upload photo')
  }

  // Generate signed URL for immediate access
  const signedUrl = await getSignedPhotoUrl(data.path)
  
  return {
    path: data.path,
    url: signedUrl
  }
}

/**
 * Delete a provider photo from storage
 * @param path - Storage path of the photo to delete
 */
export async function deleteProviderPhoto(path: string): Promise<void> {
  const { error } = await getSupabaseAdmin().storage
    .from('provider-photos')
    .remove([path])
  
  if (error) {
    console.error('Error deleting photo:', error)
    throw new Error('Failed to delete photo')
  }
}

/**
 * Get photo info including metadata
 * @param path - Storage path of the photo
 */
export async function getPhotoInfo(path: string) {
  const { data } = await getSupabaseAdmin().storage
    .from('provider-photos')
    .getPublicUrl(path)
  
  return data
}

/**
 * Transform photo URL to include size parameters for optimization
 * @param url - Original photo URL
 * @param width - Desired width
 * @param height - Desired height
 */
export function getOptimizedPhotoUrl(url: string, width?: number, height?: number): string {
  const urlObj = new URL(url)
  
  if (width) {
    urlObj.searchParams.set('width', width.toString())
  }
  
  if (height) {
    urlObj.searchParams.set('height', height.toString())
  }
  
  return urlObj.toString()
}

/**
 * Generate a placeholder data URL for lazy loading
 * @param width - Placeholder width
 * @param height - Placeholder height
 */
export function generatePlaceholderUrl(width: number = 400, height: number = 300): string {
  // Simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui">
        Loading...
      </text>
    </svg>
  `.trim()
  
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
