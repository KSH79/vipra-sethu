import { createClient } from '@/lib/supabaseClient';
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
  async getCategories(): Promise<Category[]> {
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

    return (data as Category[]) || [];
  }

  /**
   * Get all active sampradayas for UI filters
   * Hotfix: Query table directly instead of RPC due to RPC 500s caused by
   * an RLS recursion bug on admins. Safe because sampradayas has public SELECT.
   */
  async getSampradayas(): Promise<Sampradaya[]> {
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

    return (data as Sampradaya[]) || [];
  }

  /**
   * Search providers with clean taxonomy filters
   */
  async searchProviders(filters: ProviderFilters): Promise<SearchResult<ProviderWithTaxonomy>> {
    const supabase = await createClient();
    const params = {
      p_text: filters.text || null,
      p_category: filters.category_code || null,
      p_languages: filters.languages || null,
      p_sampradaya: filters.sampradaya_code || null,
      p_lat: filters.lat || null,
      p_lon: filters.lon || null,
      p_radius_km: filters.radius_km || 15,
      p_limit: filters.limit || 50,
      p_offset: filters.offset || 0,
    };

    const { data, error } = await supabase.rpc('search_providers', params);
    
    if (error) {
      console.error('Error searching providers:', error);
      throw new Error('Failed to search providers');
    }
    
    // RPC now returns { providers, total_count, distance_km, text_similarity_score, text_rank } per row
    const rows = (data || []) as Array<{
      providers: ProviderWithTaxonomy;
      total_count: bigint;
      distance_km: number | null;
      text_similarity_score: number | null;
      text_rank: number | null;
    }>;
    
    const providers = rows.map(row => ({
      ...row.providers,
      distance_km: row.distance_km ?? undefined,
      text_similarity_score: row.text_similarity_score ?? undefined,
      text_rank: row.text_rank ?? undefined,
    }));
    
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    
    return {
      data: providers,
      total,
      hasMore: (filters.offset || 0) + providers.length < total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get provider details with taxonomy names
   */
  async getProviderDetails(providerId: string): Promise<ProviderWithTaxonomy | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_provider_details', {
      provider_id: providerId,
    });

    if (error) {
      console.error('Error fetching provider details:', error);
      throw new Error('Failed to fetch provider details');
    }

    // Current RPC returns rows like: [{ get_provider_details: { provider: {...}, photos:[], rituals:[] } }]
    if (!data) return null;
    const row = Array.isArray(data) ? (data[0] as any) : (data as any);
    const envelope = row?.get_provider_details ?? row;
    const provider = envelope?.provider ?? envelope;
    if (!provider) return null;

    // Normalize field naming differences
    if (provider.years_experience !== undefined && provider.experience_years === undefined) {
      provider.experience_years = provider.years_experience;
    }

    return provider as ProviderWithTaxonomy;
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
