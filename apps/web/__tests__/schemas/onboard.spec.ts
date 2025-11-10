import { describe, it, expect } from 'vitest'
import { onboardSchema } from '../../lib/schemas/onboard'

describe('onboardSchema', () => {
  it('accepts valid minimal payload', () => {
    const data = {
      name: 'Sri Guru',
      phone: '9876543210',
      whatsapp: '',
      category: 'purohit',
      languages: ['kannada'],
      sampradaya: '',
      serviceRadius: '',
      termsAccepted: true,
    }
    const parsed = onboardSchema.parse(data)
    expect(parsed.name).toBe('Sri Guru')
  })

  it('rejects missing required fields', () => {
    const data = {
      name: '',
      phone: '',
      category: '',
      languages: [],
      termsAccepted: false,
    } as any
    expect(() => onboardSchema.parse(data)).toThrow()
  })

  it('requires at least one language and termsAccepted true', () => {
    const base = {
      name: 'AB',
      phone: '1234567890',
      category: 'cook',
      languages: [],
      termsAccepted: false,
    }
    expect(() => onboardSchema.parse(base)).toThrow()

    const ok = { ...base, languages: ['hindi'], termsAccepted: true }
    expect(onboardSchema.parse(ok).languages).toEqual(['hindi'])
  })
})
