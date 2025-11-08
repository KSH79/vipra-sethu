'use client';

import { ProviderWithTaxonomy, SearchResult } from '@/lib/types/taxonomy';
import { ProviderCardWithTaxonomy } from '@/components/ui/ProviderCardWithTaxonomy';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ProviderSearchResultsProps {
  results: SearchResult<ProviderWithTaxonomy> | null;
  loading: boolean;
  onLoadMore: () => void;
  className?: string;
}

export function ProviderSearchResults({
  results,
  loading,
  onLoadMore,
  className = ''
}: ProviderSearchResultsProps) {
  // Loading state
  if (loading && !results) {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-14 w-14 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No results
  if (!results || results.data.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          icon={<Search className="h-12 w-12 text-gray-400" />}
          title="No providers found"
          description="Try adjusting your search filters or browse all providers."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Clear search
            </Button>
          }
        />
      </div>
    );
  }

  const { data, hasMore, total } = results;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Results summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {data.length} of {total} providers
        </p>
        {total > data.length && (
          <p className="text-sm text-gray-500">
            {total - data.length} more providers available
          </p>
        )}
      </div>

      {/* Provider cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((provider) => (
          <ProviderCardWithTaxonomy
            key={provider.id}
            provider={provider}
            className="w-full"
          />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            className="min-w-32"
          >
            Load More
          </Button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && data.length > 0 && (
        <div className="text-center py-6 text-sm text-gray-500">
          You've reached the end of the results
        </div>
      )}
    </div>
  );
}
