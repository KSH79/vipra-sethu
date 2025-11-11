import { createClient } from '@/lib/supabaseClient';
import { getTranslation, type SupportedLanguage } from '@/lib/translations/db-helpers';
import { 
  Category, 
  Sampradaya, 
  Provider, 
  ProviderWithTaxonomy, 
  ProviderFilters, 
  SearchResult, 
  ProviderStats 
} from '@/lib/types/taxonomy';

/**
 * Taxonomy service functions for interacting with Supabase
 * Uses clean taxonomy implementation with code-based filters
 */

export class TaxonomyService {
  /**
   * Get all active categories for UI filters
   * Hotfix: Query table directly instead of RPC due to RPC 500s caused by
   * an RLS recursion bug on admins. Safe because categories has public SELECT.
   */
  async getCategories(locale: SupportedLanguage = 'en'): Promise<Category[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }

    const rows = (data as any[]) || [];
    return rows.map((row) => ({
      ...(row as Category),
      translatedName: getTranslation(row?.name_translations as any, locale) || row?.name,
      translatedDescription: getTranslation(row?.description_translations as any, locale) || row?.description,
    }));
  }

  /**
   * Get all active sampradayas for UI filters
   * Hotfix: Query table directly instead of RPC due to RPC 500s caused by
   * an RLS recursion bug on admins. Safe because sampradayas has public SELECT.
   */
  async getSampradayas(locale: SupportedLanguage = 'en'): Promise<Sampradaya[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sampradayas')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching sampradayas:', error);
      throw new Error('Failed to fetch sampradayas');
    }

    const rows = (data as any[]) || [];
    return rows.map((row) => ({
      ...(row as Sampradaya),
      translatedName: getTranslation(row?.name_translations as any, locale) || row?.name,
      translatedDescription: getTranslation(row?.description_translations as any, locale) || row?.description,
    }));
  }

  /**
   * Search providers with clean taxonomy filters
   */
  async searchProviders(filters: ProviderFilters): Promise<SearchResult<ProviderWithTaxonomy>> {
    const params = new URLSearchParams()
    if (filters.text) params.set('text', filters.text)
    if (filters.category_code) params.set('category_code', filters.category_code)
    if (filters.limit != null) params.set('limit', String(filters.limit))
    if (filters.offset != null) params.set('offset', String(filters.offset))
    // Note: location/language filters can be added later on server side

    const res = await fetch(`/api/providers/search?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to search providers')
    const json = await res.json()
    return {
      data: (json.data || []) as ProviderWithTaxonomy[],
      total: json.total || 0,
      hasMore: ((filters.offset || 0) + (json.data?.length || 0)) < (json.total || 0),
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    }
  }

  /**
   * Get provider details with taxonomy names
   */
  async getProviderDetails(providerId: string): Promise<ProviderWithTaxonomy | null> {
    const res = await fetch(`/api/providers/${providerId}`)
    if (res.status === 404) return null
    if (!res.ok) throw new Error('Failed to fetch provider details')
    const json = await res.json()
    return (json.data || null) as ProviderWithTaxonomy | null
  }

  /**
   * Get provider statistics for admin dashboard
   */
  async getProviderStats(): Promise<ProviderStats> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_provider_stats');
    
    if (error) {
      console.error('Error fetching provider stats:', error);
      throw new Error('Failed to fetch provider stats');
    }
    
    return data || {
      total_providers: 0,
      approved_providers: 0,
      pending_providers: 0,
      rejected_providers: 0,
      category_stats: [],
      sampradaya_stats: [],
    };
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<Array<{ category_code: string; category_name: string; provider_count: number }>> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_category_stats');
    
    if (error) {
      console.error('Error fetching category stats:', error);
      throw new Error('Failed to fetch category stats');
    }
    
    return data || [];
  }

  /**
   * Get sampradaya statistics
   */
  async getSampradayaStats(): Promise<Array<{ sampradaya_code: string; sampradaya_name: string; provider_count: number }>> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_sampradaya_stats');
    
    if (error) {
      console.error('Error fetching sampradaya stats:', error);
      throw new Error('Failed to fetch sampradaya stats');
    }
    
    return data || [];
  }
}

// Export singleton instance
export const taxonomyService = new TaxonomyService();

// Export convenience functions
export const getCategories = () => taxonomyService.getCategories();
export const getSampradayas = () => taxonomyService.getSampradayas();
export const searchProviders = (filters: ProviderFilters) => taxonomyService.searchProviders(filters);
export const getProviderDetails = (id: string) => taxonomyService.getProviderDetails(id);
export const getProviderStats = () => taxonomyService.getProviderStats();
