
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uploadWithThumbnail } from "@/lib/photo";

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    
    // Extract form fields
    const payload: any = {
      name: form.get('name'),
      phone: form.get('phone'),
      category_code: form.get('category'),
      sampradaya_code: form.get('sampradaya') || null,
      status: 'pending_review',
    };
    // If a TEST_USER_ID is provided (local/E2E), set user_id to satisfy NOT NULL/FK
    const testUserId = process.env.TEST_USER_ID
    if (testUserId) {
      payload.user_id = testUserId
    }
    
    // Validate required fields
    if (!payload.name || !payload.phone || !payload.category_code) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: name, phone, and category are required' },
        { status: 400 }
      );
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(payload.phone as string)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client for database operations
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supaUrl || !supaKey) {
      console.error('Onboarding API env error: missing Supabase URL or SERVICE_ROLE_KEY')
      return NextResponse.json(
        { ok: false, error: 'Server configuration error: Supabase env not set' },
        { status: 500 }
      )
    }
    const sb = createClient(
      supaUrl,
      supaKey, // Use service role for inserts
      { auth: { persistSession: false } }
    );
    
    // 1) Insert provider first to get provider_id
    const { data: providerRow, error: insertErr } = await sb
      .from('providers')
      .insert(payload)
      .select('id')
      .single();
    if (insertErr || !providerRow) {
      console.error('Database insert error:', insertErr);
      return NextResponse.json(
        { ok: false, error: `Failed to save provider: ${insertErr?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const providerId: string = providerRow.id as string;

    // 2) If photo present, upload + generate thumbnail, then record metadata and update provider
    const file = form.get('photo') as File | null;
    if (file && file.size > 0) {
      console.log('Onboarding API: received photo', { size: file.size, type: file.type })
      try {
        const { originalPath, thumbnailPath, mimeType, sizeBytes } = await uploadWithThumbnail(file, providerId);

        // Insert photo metadata (new schema)
        let metaErr = null as any
        try {
          const res = await sb.from('provider_photos').insert({
            provider_id: providerId,
            original_path: originalPath,
            thumbnail_path: thumbnailPath,
            mime_type: mimeType,
            size_bytes: sizeBytes,
            is_primary: true,
          })
          metaErr = res.error
        } catch (e) {
          metaErr = e
        }
        if (metaErr) {
          console.error('provider_photos insert (new schema) failed:', metaErr?.message || metaErr)
          throw metaErr
        } else {
          console.log('provider_photos insert used new schema (original/thumbnail paths)')
        }
      } catch (uploadError) {
        console.error('Photo upload/thumbnail failed:', uploadError);
        const msg = uploadError instanceof Error ? uploadError.message : String(uploadError)
        return NextResponse.json(
          { ok: false, error: `Photo upload failed: ${msg}` },
          { status: 400 }
        );
      }
    } else if (file && file.size === 0) {
      console.error('Photo file present but empty');
      return NextResponse.json(
        { ok: false, error: 'Photo file is empty. Please reselect and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, id: providerId });
    
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
