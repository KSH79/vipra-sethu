"use client";

import { useState, useEffect, useCallback } from "react";
import { ProviderFilters, SearchResult, ProviderWithTaxonomy } from "@/lib/types/taxonomy";
import { searchProviders } from "@/lib/services/taxonomy";
import { ProviderSearchForm } from "@/components/forms/ProviderSearchForm";
import { ProviderSearchResults } from "@/components/search/ProviderSearchResults";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageViewTracker } from "@/hooks/usePageView";
import { analytics } from "@/lib/analytics";

export default function Providers() {
  const [searchResults, setSearchResults] = useState<SearchResult<ProviderWithTaxonomy> | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<ProviderFilters>({ limit: 50, radius_km: 15 });

  // Load initial providers on mount
  useEffect(() => {
    loadInitialProviders();
  }, []);

  const loadInitialProviders = async () => {
    try {
      setLoading(true);
      const results = await searchProviders({ limit: 50 });
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to load providers:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSearch = useCallback(async (filters: ProviderFilters) => {
    try {
      setLoading(true);
      const results = await searchProviders({
        ...filters,
        limit: filters.limit || 50,
        offset: 0, // Reset offset for new search
      });
      setSearchResults(results);
      setCurrentFilters(filters);
      
      // Track search analytics
      analytics.trackSearch(
        filters.text || '',
        {
          category_code: filters.category_code,
          sampradaya_code: filters.sampradaya_code,
          languages: filters.languages,
          radius_km: filters.radius_km,
          location_lat: filters.lat,
          location_lon: filters.lon,
        },
        results.total || 0
      );
    } catch (error) {
      console.error('Failed to search providers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!searchResults || !searchResults.hasMore) return;

    try {
      setLoading(true);
      const nextFilters = {
        ...currentFilters,
        limit: 50,
        offset: searchResults.offset + searchResults.limit,
      };
      
      const moreResults = await searchProviders(nextFilters);
      
      setSearchResults(prev => prev ? {
        ...moreResults,
        data: [...prev.data, ...moreResults.data],
      } : moreResults);
      
      setCurrentFilters(nextFilters);
    } catch (error) {
      console.error('Failed to load more providers:', error);
    } finally {
      setLoading(false);
    }
  }, [searchResults, currentFilters]);

  return (
    <div className="min-h-screen bg-ivory">
      <PageViewTracker />
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-saffron-50 via-ivory to-gold-50">
        <div className="container-custom">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Find Trusted Service Providers
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with verified purohits, cooks, and essential services in your community
            </p>
          </div>

          {/* Search Summary */}
          {!initialLoad && searchResults && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-saffron-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-saffron-100 flex items-center justify-center">
                      <Search className="h-4 w-4 text-saffron-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {searchResults.total} provider{searchResults.total !== 1 ? 's' : ''} available
                      </p>
                      <p className="text-sm text-slate-600">
                        {searchResults.data.length > 0 && 
                          `Showing ${searchResults.data.length} result${searchResults.data.length !== 1 ? 's' : ''}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>All Locations</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container-custom space-y-8">
          {/* Search Form */}
          <ProviderSearchForm
            onSearch={handleSearch}
            loading={loading}
            initialFilters={{
              limit: 50,
              radius_km: 15,
            }}
          />

          {/* Search Results */}
          <ProviderSearchResults
            results={searchResults}
            loading={loading}
            onLoadMore={handleLoadMore}
          />

          {/* Initial Load Empty State */}
          {initialLoad && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!initialLoad && searchResults && searchResults.data.length > 0 && (
        <section className="py-12 bg-saffron-50">
          <div className="container-custom">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Can't find what you're looking for?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Our team is here to help you find the perfect service provider for your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button className="h-12 px-8 text-base font-semibold">
                  Request Callback
                </Button>
                <Button 
                  variant="outline" 
                  className="h-12 px-8 text-base font-medium"
                >
                  Browse All Categories
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
