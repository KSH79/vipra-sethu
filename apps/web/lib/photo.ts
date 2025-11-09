import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase env not configured')
  return createClient(url, key, { auth: { persistSession: false } })
}

export type ThumbnailResult = {
  originalPath: string
  thumbnailPath: string
  mimeType: string
  sizeBytes: number
}

/**
 * Upload original image and generate a ~512px WebP thumbnail on the server
 * - originals/{providerId}/{uuid}.{ext}
 * - thumbs/{providerId}/{uuid}.webp
 */
export async function uploadWithThumbnail(file: File, providerId: string): Promise<ThumbnailResult> {
  const allowed = ['image/jpeg','image/jpg','image/png','image/webp']
  const origExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const extAllowed = ['jpg','jpeg','png','webp']
  const inferredMime = file.type || (origExt === 'png' ? 'image/png' : (origExt === 'webp' ? 'image/webp' : 'image/jpeg'))
  if (!allowed.includes(file.type) && !extAllowed.includes(origExt)) {
    throw new Error(`Invalid file type: type=${file.type || 'n/a'} ext=.${origExt}`)
  }
  if (file.size > 5 * 1024 * 1024) throw new Error('File too large (max 5MB)')

  const admin = getAdmin()
  const arrayBuf = await file.arrayBuffer()
  const buf = Buffer.from(arrayBuf)

  // derive extension
  const baseName = `${providerId}/${crypto.randomUUID()}`
  const originalPath = `originals/${baseName}.${origExt}`
  const thumbnailPath = `thumbs/${baseName}.webp`

  // upload original
  const { error: upErr } = await admin.storage
    .from('provider-photos')
    .upload(originalPath, buf, { contentType: inferredMime, upsert: true })
  if (upErr) throw upErr

  // generate thumbnail
  const thumbBuf = await sharp(buf)
    .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 75 })
    .toBuffer()

  const { error: thErr } = await admin.storage
    .from('provider-photos')
    .upload(thumbnailPath, thumbBuf, { contentType: 'image/webp', upsert: true })
  if (thErr) throw thErr

  return {
    originalPath,
    thumbnailPath,
    mimeType: inferredMime,
    sizeBytes: file.size,
  }
}
