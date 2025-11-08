'use client'

import { useState } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'

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

  // Show fallback if no photo URL or error
  if (!photoUrl || hasError) {
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
        src={photoUrl}
        alt={alt || `${providerName} photo`}
        fill
        sizes={`${sizePixels[size]}px`}
        className="object-cover"
        priority={priority}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

interface ProviderPhotoCardProps {
  photoUrl?: string | null
  providerName: string
  className?: string
  aspectRatio?: 'square' | 'video'
  alt?: string
}

/**
 * Provider photo for card layouts with different aspect ratios
 */
export function ProviderPhotoCard({
  photoUrl,
  providerName,
  className = '',
  aspectRatio = 'square',
  alt
}: ProviderPhotoCardProps) {
  const [hasError, setHasError] = useState(false)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video'
  }

  // Show fallback if no photo URL or error
  if (!photoUrl || hasError) {
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
        src={photoUrl}
        alt={alt || `${providerName} photo`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  )
}
