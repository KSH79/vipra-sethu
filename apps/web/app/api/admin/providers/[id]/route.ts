import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const id = params.id

  const { data: provider, error } = await supabase
    .from('providers')
    .select(`
      id,
      name,
      phone,
      whatsapp,
      languages,
      photo_url,
      profile_photo_url,
      email,
      location_text,
      status,
      category_code,
      sampradaya_code,
      service_radius_km,
      years_experience,
      about,
      availability_notes,
      travel_notes,
      expectations,
      response_time_hours,
      rejection_reason
    `)
    .eq('id', id)
    .single()

  if (error || !provider) {
    return NextResponse.json({ error: error?.message || 'Not found' }, { status: 404 })
  }

  const { data: photo } = await supabase
    .from('provider_photos')
    .select('thumbnail_path, original_path')
    .eq('provider_id', id)
    .eq('is_primary', true)
    .limit(1)
    .maybeSingle()

  // Generate signed URLs for storage paths if needed
  const bucket = 'provider-photos'
  let thumbnail_url: string | null = null
  let original_url: string | null = null

  if (photo?.thumbnail_path) {
    if (photo.thumbnail_path.startsWith('http')) {
      thumbnail_url = photo.thumbnail_path
    } else {
      const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(photo.thumbnail_path, 60 * 60)
      thumbnail_url = signed?.signedUrl || null
    }
  }
  if (photo?.original_path) {
    if (photo.original_path.startsWith('http')) {
      original_url = photo.original_path
    } else {
      const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(photo.original_path, 60 * 60)
      original_url = signed?.signedUrl || null
    }
  }

  // Provider legacy fields: generate signed URLs if they look like storage keys
  let profile_photo_signed_url: string | null = null
  let photo_signed_url: string | null = null
  if (provider.profile_photo_url && !provider.profile_photo_url.startsWith('http')) {
    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(provider.profile_photo_url, 60 * 60)
    profile_photo_signed_url = signed?.signedUrl || null
  }
  if (provider.photo_url && !provider.photo_url.startsWith('http')) {
    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(provider.photo_url, 60 * 60)
    photo_signed_url = signed?.signedUrl || null
  }

  return NextResponse.json({ 
    provider: { 
      ...provider, 
      profile_photo_signed_url, 
      photo_signed_url 
    }, 
    photo: photo ? { ...photo, thumbnail_url, original_url } : null 
  })
}
