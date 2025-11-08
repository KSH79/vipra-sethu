"use client";

import { useState, useEffect } from "react";
import { searchProviders, getCategories } from "@/lib/services/taxonomy";
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
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-saffron-600 border-r-transparent"></div>
              <p className="mt-4 text-slate-600">Loading providers...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-red-800 font-medium mb-2">Error loading providers</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Providers Grid */}
          {!loading && !error && visibleProviders.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleProviders.map((provider: ProviderWithTaxonomy) => (
                  <Link
                    key={provider.id}
                    href={`/providers/${provider.id}`}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-saffron-200 transition-all duration-200 group"
                  >
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 group-hover:text-saffron-600 transition-colors">
                          {provider.name}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {provider.category_name || 'Service Provider'}
                        </p>
                      </div>

                      {provider.about && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {provider.about}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {provider.languages && provider.languages.length > 0 && (
                          <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                            {provider.languages.join(', ')}
                          </span>
                        )}
                        {provider.experience_years && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                            {provider.experience_years}+ years
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
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
