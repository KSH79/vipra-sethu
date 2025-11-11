import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'
import { getLocaleFromRequest } from '@/lib/i18n/locale-server'
import { getTranslation } from '@/lib/translations/db-helpers'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const locale = getLocaleFromRequest(req)

    const status = req.nextUrl.searchParams.get('status') || undefined
    const category = req.nextUrl.searchParams.get('category') || undefined
    const search = req.nextUrl.searchParams.get('search') || undefined
    const page = Math.max(Number(req.nextUrl.searchParams.get('page') || '1'), 1)
    const pageSize = Math.min(Math.max(Number(req.nextUrl.searchParams.get('pageSize') || '10'), 1), 100)
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('providers')
      .select(`
        id,
        name,
        status,
        category_code,
        sampradaya_code,
        created_at,
        photo_url,
        categories:categories(code,name,name_translations),
        sampradayas:sampradayas(code,name,name_translations)
      `, { count: 'exact' })

    if (status) {
      if (status === 'pending_review') {
        query = query.in('status', ['pending_review', 'pending'])
      } else {
        query = query.eq('status', status)
      }
    }
    if (category) query = query.eq('category_code', category)
    if (search) query = query.or(`name.ilike.%${search}%,about.ilike.%${search}%`)

    const { data, error, count } = await query.range(from, to)
    if (error) throw error

    const providers = (data || []).map((p: any) => {
      const cat = p?.categories
      const samp = p?.sampradayas
      const mapCatKn = (code?: string) => {
        switch ((code || '').toLowerCase()) {
          case 'purohit': return 'ವೈದಿಕ ಪುರೋಹಿತ'
          case 'cook': return 'ಅಡುಗೆಯವರು'
          case 'essentials': return 'ಅಗತ್ಯಗಳು'
          case 'seniorcare': return 'ವರಿಷ್ಠ ಆರೈಕೆ'
          case 'pilgrimage': return 'ತೀರ್ಥಯಾತ್ರೆ ಮಾರ್ಗದರ್ಶಿ'
          case 'other': return 'ಇತರೆ'
          default: return undefined
        }
      }
      const mapSampKn = (code?: string) => {
        switch ((code || '').toLowerCase()) {
          case 'madhwa': return 'ಮಾಧ್ವ'
          case 'smarta': return 'ಸ್ಮಾರ್ತ'
          case 'vaishnava': return 'ವೈಷ್ಣವ'
          case 'shaivite': return 'ಶೈವ'
          case 'other': return 'ಇತರೆ'
          default: return undefined
        }
      }
      const mapCatEnNameToKn = (name?: string) => {
        const n = (name || '').toLowerCase()
        switch (n) {
          case 'vedic purohit': return 'ವೈದಿಕ ಪುರೋಹಿತ'
          case 'cook': return 'ಅಡುಗೆಯವರು'
          case 'essentials': return 'ಅಗತ್ಯಗಳು'
          case 'senior care':
          case 'seniorcare': return 'ವರಿಷ್ಠ ಆರೈಕೆ'
          case 'pilgrimage guide':
          case 'pilgrimage': return 'ತೀರ್ಥಯಾತ್ರೆ ಮಾರ್ಗದರ್ಶಿ'
          case 'other': return 'ಇತರೆ'
          default: return undefined
        }
      }
      const isKn = locale === 'kn'
      return {
        ...p,
        submittedAt: p?.created_at || null,
        category: cat ? { code: cat.code, name: (isKn ? (mapCatKn(cat?.code) || mapCatEnNameToKn(p?.category_code) || getTranslation(cat?.name_translations as any, locale)) : getTranslation(cat?.name_translations as any, locale)) || cat?.name || '' } : null,
        sampradaya: samp ? { code: samp.code, name: (isKn ? (mapSampKn(samp?.code) || getTranslation(samp?.name_translations as any, locale)) : getTranslation(samp?.name_translations as any, locale)) || samp?.name || '' } : null,
        category_name: (() => {
          const byJoin = cat ? ((isKn ? (mapCatKn(cat?.code) || getTranslation(cat?.name_translations as any, locale)) : getTranslation(cat?.name_translations as any, locale)) || cat?.name) : undefined
          const byCode = isKn ? mapCatKn(p?.category_code) : undefined
          const byCodeEn = isKn ? mapCatEnNameToKn(p?.category_code) : undefined
          return byJoin || byCode || byCodeEn || null
        })(),
        sampradaya_name: (() => {
          const byJoin = samp ? ((isKn ? (mapSampKn(samp?.code) || getTranslation(samp?.name_translations as any, locale)) : getTranslation(samp?.name_translations as any, locale)) || samp?.name) : undefined
          const byCode = isKn ? mapSampKn(p?.sampradaya_code) : undefined
          return byJoin || byCode || null
        })(),
      }
    })

    return NextResponse.json({ providers, total: count || providers.length, page, pageSize })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to fetch providers' }, { status: 400 })
  }
}
