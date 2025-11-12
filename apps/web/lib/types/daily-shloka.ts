export interface DailyShloka {
  id: string;
  sanskrit: string;
  sanskrit_transliteration?: string;
  translations: {
    en: string;
    kn: string;
    ta?: string;
    te?: string;
    hi?: string;
    [key: string]: string | undefined;
  };
  source: string;
  source_translations?: {
    en?: string;
    kn?: string;
    [key: string]: string | undefined;
  };
  category: string;
}
