"use client";

import { useState, useEffect } from "react";
import { searchProviders, getCategories } from "@/lib/services/taxonomy";
import { ProviderCard } from "@/components/providers/ProviderCard";
import { ProviderWithTaxonomy, Category } from "@/lib/types/taxonomy";
import Link from "next/link";
import { Search, Filter, X, ChevronDown } from "lucide-react";

type SortOption = 'newest' | 'experience' | 'name';

export default function Providers() {
  const [allProviders, setAllProviders] = useState<ProviderWithTaxonomy[]>([]);
  const [displayedProviders, setDisplayedProviders] = useState<ProviderWithTaxonomy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Pagination
  const [displayCount, setDisplayCount] = useState(12);
  const itemsPerPage = 12;

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [providersResult, categoriesResult] = await Promise.all([
        searchProviders({ limit: 100 }),
        getCategories()
      ]);
      setAllProviders(providersResult.data);
      setCategories(categoriesResult);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...allProviders];

    // Apply search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.name.toLowerCase().includes(searchLower) ||
        provider.about?.toLowerCase().includes(searchLower) ||
        provider.category_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(provider => 
        provider.category_code === selectedCategory
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'experience':
          return (b.experience_years || 0) - (a.experience_years || 0);
        case 'newest':
        default:
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
    });

    setDisplayedProviders(filtered);
    setDisplayCount(itemsPerPage); // Reset pagination when filters change
  }, [allProviders, searchText, selectedCategory, sortBy]);

  const hasActiveFilters = searchText || selectedCategory;
  const visibleProviders = displayedProviders.slice(0, displayCount);
  const hasMore = displayCount < displayedProviders.length;

  const clearFilters = () => {
    setSearchText("");
    setSelectedCategory("");
    setSortBy('newest');
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + itemsPerPage);
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-saffron-50 via-ivory to-gold-50">
        <div className="container-custom">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Find Trusted Service Providers
            </h1>
            <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
              Connect with verified purohits, cooks, and essential services in your community
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container-custom">
          {/* Search and Filters */}
          {!loading && !error && (
            <div className="mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, category, or description..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Category Filter */}
                <div className="flex-1">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.code} value={category.code}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Sort By */}
                <div className="flex-1">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-saffron-500 focus:border-transparent"
                    >
                      <option value="newest">Newest First</option>
                      <option value="experience">Most Experienced</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-gray-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-slate-600">
                  {displayedProviders.length === 0 ? (
                    'No providers found'
                  ) : (
                    <>
                      Showing <span className="font-medium text-slate-900">{visibleProviders.length}</span> of{' '}
                      <span className="font-medium text-slate-900">{displayedProviders.length}</span> provider
                      {displayedProviders.length !== 1 ? 's' : ''}
                    </>
                  )}
                </p>
                {hasActiveFilters && (
                  <p className="text-slate-500">
                    {displayedProviders.length} of {allProviders.length} total
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-xl bg-slate-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 rounded bg-slate-200 animate-pulse" />
                      <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                      <div className="h-10 w-full rounded bg-slate-200 animate-pulse" />
                      <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-red-800 font-medium mb-2">Error loading providers</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 text-sm rounded-lg border border-red-200 bg-white hover:bg-red-50 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Providers Grid */}
          {!loading && !error && visibleProviders.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProviders.map((p: ProviderWithTaxonomy) => (
                  <ProviderCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    about={p.about}
                    photo_thumbnail_url={(p as any).photo_thumbnail_url || undefined}
                    photo_url={(p as any).photo_url || undefined}
                    category_name={p.category_name}
                    service_type={(p as any).service_type}
                    languages={p.languages}
                    experience_years={p.experience_years}
                    location={(p as any).location_text || (p as any).location || undefined}
                    is_approved={(p as any).is_approved}
                    availability_status={(p as any).availability_status}
                    rating={(p as any).rating}
                    review_count={(p as any).review_count}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={loadMore}
                    className="px-8 py-3 bg-saffron-600 text-white font-medium rounded-lg hover:bg-saffron-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Load More ({displayedProviders.length - displayCount} remaining)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && displayedProviders.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No providers found</h3>
                <p className="text-slate-600 mb-6">
                  {hasActiveFilters 
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "There are no providers available at the moment."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-saffron-600 text-white font-medium rounded-lg hover:bg-saffron-700 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
