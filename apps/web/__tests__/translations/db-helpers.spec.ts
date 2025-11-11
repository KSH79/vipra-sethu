import { describe, it, expect } from 'vitest';
import { getTranslation, buildTranslation, hasTranslation, getTranslationCoverage } from '@/lib/translations/db-helpers';

describe('Translation Helper Functions', () => {
  describe('getTranslation', () => {
    it('returns English when locale is en', () => {
      const t = { en: 'Hello', kn: 'ನಮಸ್ಕಾರ' };
      expect(getTranslation(t, 'en')).toBe('Hello');
    });

    it('returns Kannada when locale is kn', () => {
      const t = { en: 'Hello', kn: 'ನಮಸ್ಕಾರ' };
      expect(getTranslation(t, 'kn')).toBe('ನಮಸ್ಕಾರ');
    });

    it('falls back to English when missing', () => {
      const t = { en: 'Hello', kn: '' };
      expect(getTranslation(t, 'kn')).toBe('Hello');
    });

    it('handles null/undefined', () => {
      expect(getTranslation(null as unknown as any, 'en')).toBe('');
      expect(getTranslation(undefined as unknown as any, 'en')).toBe('');
    });
  });

  describe('buildTranslation', () => {
    it('creates object with English', () => {
      const r = buildTranslation('Hello');
      expect(r.en).toBe('Hello');
      expect(r.kn).toBe('');
    });

    it('includes provided translations', () => {
      const r = buildTranslation('Hello', { kn: 'ನಮಸ್ಕಾರ' });
      expect(r.en).toBe('Hello');
      expect(r.kn).toBe('ನಮಸ್ಕಾರ');
    });
  });

  describe('hasTranslation', () => {
    it('true when exists', () => {
      expect(hasTranslation({ en: 'Hello', kn: 'ನಮಸ್ಕಾರ' }, 'kn')).toBe(true);
    });
    it('false when empty', () => {
      expect(hasTranslation({ en: 'Hello', kn: '' }, 'kn')).toBe(false);
    });
  });

  describe('getTranslationCoverage', () => {
    it('calculates coverage', () => {
      const items = [
        { name_translations: { en: 'Cat1', kn: 'ವರ್ಗ1' } },
        { name_translations: { en: 'Cat2', kn: '' } },
      ];
      expect(getTranslationCoverage(items, 'kn', ['name_translations'])).toBe(50);
    });
  });
});
