'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { getSignedPhotoUrl, generatePlaceholderUrl } from '@/lib/storage'

interface ProviderPhotoProps {
  photoUrl?: string | null
  providerName: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  priority?: boolean
  alt?: string
}

/**
 * Provider photo component with lazy loading and fallbacks
 * Handles signed URLs, loading states, and error cases
 */
export function ProviderPhoto({
  photoUrl,
  providerName,
  size = 'md',
  className = '',
  priority = false,
  alt
}: ProviderPhotoProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  }

  const sizePixels = {
    sm: 48,
    md: 64,
    lg: 96
  }

  const loadPhoto = useCallback(async () => {
    if (!photoUrl) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setHasError(false)
      
      // If it's already a full URL, use it directly
      if (photoUrl.startsWith('http')) {
        setImageUrl(photoUrl)
      } else {
        // Otherwise, treat it as a storage path and get signed URL
        const signedUrl = await getSignedPhotoUrl(photoUrl)
        setImageUrl(signedUrl)
      }
    } catch (error) {
      console.error('Failed to load provider photo:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [photoUrl])

  // Load photo when component mounts or photoUrl changes
  useState(() => {
    loadPhoto()
  })

  // Handle image load success
  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // Handle image load error
  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Show fallback while loading or on error
  if (isLoading || hasError || !photoUrl) {
    return (
      <div className={`
        ${sizeClasses[size]} 
        rounded-full 
        bg-saffron-100 
        flex 
        items-center 
        justify-center
        ${className}
      `}>
        <User className="h-1/2 w-1/2 text-saffron-600" />
      </div>
    )
  }

  return (
    <div className={`
      ${sizeClasses[size]} 
      rounded-full 
      overflow-hidden 
      relative
      ${className}
    `}>
      <Image
        src={imageUrl}
        alt={alt || `${providerName} photo`}
        fill
        sizes={`
          (max-width: 768px) ${sizePixels.sm}px,
          (max-width: 1024px) ${sizePixels.md}px,
          ${sizePixels.lg}px
        `}
        className="object-cover"
        priority={priority}
        onLoad={handleImageLoad}
        onError={handleImageError}
        placeholder="blur"
        blurDataURL={generatePlaceholderUrl(sizePixels[size], sizePixels[size])}
      />
    </div>
  )
}

interface ProviderPhotoCardProps {
  photoUrl?: string | null
  providerName: string
  className?: string
  aspectRatio?: 'square' | 'video'
}

/**
 * Provider photo for card layouts with different aspect ratios
 */
export function ProviderPhotoCard({
  photoUrl,
  providerName,
  className = '',
  aspectRatio = 'square'
}: ProviderPhotoCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video'
  }

  const loadPhoto = useCallback(async () => {
    if (!photoUrl) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setHasError(false)
      
      if (photoUrl.startsWith('http')) {
        setImageUrl(photoUrl)
      } else {
        const signedUrl = await getSignedPhotoUrl(photoUrl)
        setImageUrl(signedUrl)
      }
    } catch (error) {
      console.error('Failed to load provider photo:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [photoUrl])

  useState(() => {
    loadPhoto()
  })

  const handleImageLoad = () => {
    setIsLoading(false)
  }

  const handleImageError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  // Show fallback while loading or on error
  if (isLoading || hasError || !photoUrl) {
    return (
      <div className={`
        ${aspectRatioClasses[aspectRatio]}
        bg-saffron-100 
        rounded-lg 
        flex 
        items-center 
        justify-center
        ${className}
      `}>
        <User className="h-8 w-8 text-saffron-600" />
      </div>
    )
  }

  return (
    <div className={`
      ${aspectRatioClasses[aspectRatio]}
      rounded-lg 
      overflow-hidden 
      relative
      ${className}
    `}>
      <Image
        src={imageUrl}
        alt={`${providerName} photo`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        placeholder="blur"
        blurDataURL={generatePlaceholderUrl(400, aspectRatio === 'video' ? 225 : 400)}
      />
    </div>
  )
}
