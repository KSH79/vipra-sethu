
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { uploadProviderPhoto } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    
    // Extract form fields
    const payload: any = {
      name: form.get('name'),
      phone: form.get('phone'),
      whatsapp: form.get('whatsapp'),
      category_code: form.get('category'), // Updated to use category_code
      languages: String(form.get('languages') || '').split(',').map(s => s.trim()).filter(Boolean),
      sampradaya_code: form.get('sampradaya'), // Updated to use sampradaya_code
      status: 'pending_review'
    };
    
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
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for inserts
      { auth: { persistSession: false } }
    );
    
    // Handle photo upload
    const file = form.get('photo') as File | null;
    if (file && file.size > 0) {
      try {
        // Generate a temporary provider ID for the upload
        const tempProviderId = crypto.randomUUID();
        const uploadResult = await uploadProviderPhoto(file, tempProviderId);
        payload.photo_url = uploadResult.path;
      } catch (uploadError) {
        console.error('Photo upload failed:', uploadError);
        return NextResponse.json(
          { ok: false, error: `Photo upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}` },
          { status: 400 }
        );
      }
    }
    
    // Insert provider into database
    const { error } = await sb.from('providers').insert(payload);
    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { ok: false, error: `Failed to save provider: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
