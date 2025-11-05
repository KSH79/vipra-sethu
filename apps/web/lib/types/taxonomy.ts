/**
 * Taxonomy types for Vipra Sethu platform
 * Based on clean database schema with normalized categories and sampradayas
 */

export interface Category {
  code: string;
  name: string;
  description?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Sampradaya {
  code: string;
  name: string;
  description?: string;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  email?: string;
  category_code: string;
  sampradaya_code?: string;
  languages: string[];
  experience_years?: number;
  about?: string;
  location_text?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km?: number;
  availability_notes?: string;
  travel_notes?: string;
  expectations?: string[];
  response_time_hours?: number;
  photo_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  created_at: string;
  updated_at: string;
  approved_at?: string;
  approved_by?: string;
}

export interface ProviderWithTaxonomy extends Provider {
  category_name?: string;
  sampradaya_name?: string;
  distance_km?: number;
  text_similarity_score?: number;
  text_rank?: number;
}

export interface ProviderFilters {
  text?: string;
  category_code?: string;
  sampradaya_code?: string;
  languages?: string[];
  lat?: number;
  lon?: number;
  radius_km?: number;
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

export interface ProviderStats {
  total_providers: number;
  approved_providers: number;
  pending_providers: number;
  rejected_providers: number;
  category_stats: Array<{
    category_code: string;
    category_name: string;
    provider_count: number;
  }>;
  sampradaya_stats: Array<{
    sampradaya_code: string;
    sampradaya_name: string;
    provider_count: number;
  }>;
}
