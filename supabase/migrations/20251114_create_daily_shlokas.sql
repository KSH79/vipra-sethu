-- Enable required extension
create extension if not exists pgcrypto;

-- Create daily_shlokas table
create table if not exists public.daily_shlokas (
  id uuid primary key default gen_random_uuid(),
  sanskrit text not null,
  sanskrit_transliteration text,
  translations jsonb not null,
  source text not null,
  source_translations jsonb,
  category text default 'wisdom',
  active boolean default true,
  display_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_daily_shlokas_active on public.daily_shlokas(active) where active = true;
create index if not exists idx_daily_shlokas_display_date on public.daily_shlokas(display_date) where display_date is not null;

-- Seed starter shlokas
insert into public.daily_shlokas (sanskrit, sanskrit_transliteration, translations, source, category)
values
  ('सत्यं वद । धर्मं चर ।', 'Satyam vada, dharmam chara', '{"en": "Speak truth. Practice righteousness.", "kn": "ಸತ್ಯವನ್ನು ಹೇಳು । ಧರ್ಮವನ್ನು ಆಚರಿಸು ।"}', 'Taittiriya Upanishad', 'truth'),
  ('वसुधैव कुटुम्बकम्', 'Vasudhaiva kutumbakam', '{"en": "The world is one family", "kn": "ಜಗತ್ತೇ ಒಂದು ಕುಟುಂಬ"}', 'Maha Upanishad', 'unity'),
  ('परोपकाराय सतां विभूतयः', 'Paropkaraya satam vibhutayah', '{"en": "The wealth of the good is for helping others", "kn": "ಪರೋಪಕಾರಕ್ಕಾಗಿ ಸಜ್ಜನರ ಸಂಪತ್ತು"}', 'Bharavi', 'service'),
  ('विद्या ददाति विनयम्', 'Vidya dadati vinayam', '{"en": "Knowledge bestows humility", "kn": "ವಿದ್ಯೆಯು ವಿನಯವನ್ನು ನೀಡುತ್ತದೆ"}', 'Sanskrit Proverb', 'knowledge'),
  ('सत्यमेव जयते नानृतम्', 'Satyameva jayate nanritam', '{"en": "Truth alone triumphs, not falsehood", "kn": "ಸತ್ಯವೇ ಜಯಿಸುತ್ತದೆ, ಸುಳ್ಳಲ್ಲ"}', 'Mundaka Upanishad', 'truth')
on conflict do nothing;

-- RPC: get_daily_shloka
create or replace function public.get_daily_shloka()
returns table (
  id uuid,
  sanskrit text,
  sanskrit_transliteration text,
  translations jsonb,
  source text,
  source_translations jsonb,
  category text
) language plpgsql as $$
begin
  -- Priority 1: scheduled for today
  return query
  select s.id, s.sanskrit, s.sanskrit_transliteration, s.translations, s.source, s.source_translations, s.category
  from public.daily_shlokas s
  where s.active = true and s.display_date = current_date
  limit 1;

  if not found then
    -- Priority 2: deterministic rotation by date
    return query
    select s.id, s.sanskrit, s.sanskrit_transliteration, s.translations, s.source, s.source_translations, s.category
    from public.daily_shlokas s
    where s.active = true and s.display_date is null
    order by md5(s.id::text || current_date::text)
    limit 1;
  end if;
end;
$$;

-- RLS (optional, assuming public read is acceptable for landing)
alter table public.daily_shlokas enable row level security;
-- Allow anon read
create policy if not exists daily_shlokas_select on public.daily_shlokas for select using (true);
