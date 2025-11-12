'use server';

import { createClient } from '@/lib/supabase/server';
import { DailyShloka } from '@/lib/types/daily-shloka';

export async function getDailyShloka(): Promise<DailyShloka> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_daily_shloka').single();
  if (error || !data) {
    return {
      id: 'fallback',
      sanskrit: 'सत्यं वद । धर्मं चर ।',
      translations: {
        en: 'Speak truth. Practice righteousness.',
        kn: 'ಸತ್ಯವನ್ನು ಹೇಳು । ಧರ್ಮವನ್ನು ಆಚರಿಸು ।'
      },
      source: 'Taittiriya Upanishad',
      category: 'truth'
    } as DailyShloka;
  }
  return data as DailyShloka;
}
