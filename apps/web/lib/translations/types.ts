import type { SupportedLanguage } from './db-helpers';

export interface TranslatableField {
  en: string;
  kn?: string;
  hi?: string;
  ta?: string;
  te?: string;
  ml?: string;
  mr?: string;
  gu?: string;
  bn?: string;
  pa?: string;
}

export interface TranslatableCategory {
  id: string;
  name_translations: TranslatableField;
  description_translations?: TranslatableField;
}

export interface TranslatableSampradaya {
  id: string;
  name_translations: TranslatableField;
  description_translations?: TranslatableField;
}

export interface TranslatableLanguage {
  code: string;
  name_translations: TranslatableField;
}

export interface TranslatableServiceRadiusOption {
  id: string;
  name_translations: TranslatableField;
  description_translations?: TranslatableField;
}

export interface TranslatableExperienceLevel {
  id: string;
  name_translations: TranslatableField;
  description_translations?: TranslatableField;
}

export interface TranslatableTerms {
  id: string;
  content_translations: TranslatableField;
}

export interface UserProfile {
  id: string;
  preferred_language: SupportedLanguage;
}
