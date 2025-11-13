'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  city?: string | null;
  phone?: string | null;
  preferred_language?: string;
  onboarding_completed?: boolean;
  profile_completed?: boolean;
}, redirectTo?: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Use admin client to avoid RLS recursion errors and ensure row exists
  const admin = createAdminClient();
  const payload = {
    id: user.id,
    ...data,
    updated_at: new Date().toISOString(),
  } as Record<string, any>;

  const { error } = await admin
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id')
    .single();

  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/home');
  revalidatePath('/complete-profile');
  if (redirectTo) {
    redirect(redirectTo);
  }
  return { success: true };
}

export async function getUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data;
}

export async function updateUserPreference(key: string, value: any) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.rpc('update_user_preference', {
    p_user_id: user.id,
    p_key: key,
    p_value: value,
  });

  if (error) throw error;
  revalidatePath('/');
  return { success: true };
}
