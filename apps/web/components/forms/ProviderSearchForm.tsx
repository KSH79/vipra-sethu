'use client';

import { useState } from 'react';
import { ProviderFilters } from '@/lib/types/taxonomy';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryFilter } from './CategoryFilter';
import { SampradayaFilter } from './SampradayaFilter';
import { LanguageFilter } from './LanguageFilter';
import { LocationFilter } from './LocationFilter';
import { Badge } from '@/components/ui/badge';

interface ProviderSearchFormProps {
  onSearch: (filters: ProviderFilters) => void;
  loading?: boolean;
  initialFilters?: ProviderFilters;
  className?: string;
}

export function ProviderSearchForm({
  onSearch,
  loading = false,
  initialFilters = {},
  className = ''
}: ProviderSearchFormProps) {
  const [filters, setFilters] = useState<ProviderFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch({ ...filters, offset: 0 });
  };

  const handleClear = () => {
    const clearedFilters = {
      text: undefined,
      category_code: undefined,
      sampradaya_code: undefined,
      languages: undefined,
      lat: undefined,
      lon: undefined,
      radius_km: undefined,
      limit: 50,
      offset: 0,
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters = filters.text || 
    filters.category_code || 
    filters.sampradaya_code || 
    (filters.languages && filters.languages.length > 0) ||
    (filters.lat && filters.lon) ||
    filters.radius_km;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Basic Search */}
      <div className="space-y-4">
        <div>
          <label htmlFor="search-text" className="block text-sm font-medium text-gray-700 mb-2">
            Search Providers
          </label>
          <Input
            id="search-text"
            type="text"
            placeholder="Search by name, skills, or description..."
            value={filters.text || ''}
            onChange={(e) => setFilters({ ...filters, text: e.target.value || undefined })}
            className="w-full"
          />
        </div>

        {/* Primary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryFilter
            selectedCategory={filters.category_code}
            onCategoryChange={(category) => setFilters({ ...filters, category_code: category })}
            placeholder="Select service category"
          />
          <SampradayaFilter
            selectedSampradaya={filters.sampradaya_code}
            onSampradayaChange={(sampradaya) => setFilters({ ...filters, sampradaya_code: sampradaya })}
            placeholder="Select religious tradition"
          />
        </div>

        {/* Secondary Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LanguageFilter
            selectedLanguages={filters.languages}
            onLanguagesChange={(languages) => setFilters({ ...filters, languages })}
          />
          <LocationFilter
            latitude={filters.lat}
            longitude={filters.lon}
            radiusKm={filters.radius_km}
            onLocationChange={(lat, lon, radiusKm) => setFilters({ 
              ...filters, 
              lat, 
              lon, 
              radius_km: radiusKm 
            })}
          />
        </div>

        {/* Advanced Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? 'Hide' : 'Show'} advanced filters
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius (km)
                </label>
                <Input
                  id="radius"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="15"
                  value={filters.radius_km || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    radius_km: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-2">
                  Results per page
                </label>
                <Input
                  id="limit"
                  type="number"
                  min="5"
                  max="100"
                  placeholder="50"
                  value={filters.limit || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    limit: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2">
            {filters.text && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Text: {filters.text}
                <button
                  onClick={() => setFilters({ ...filters, text: undefined })}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.category_code && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category_code}
                <button
                  onClick={() => setFilters({ ...filters, category_code: undefined })}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.sampradaya_code && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tradition: {filters.sampradaya_code}
                <button
                  onClick={() => setFilters({ ...filters, sampradaya_code: undefined })}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {filters.languages && filters.languages.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Languages: {filters.languages.length}
                <button
                  onClick={() => setFilters({ ...filters, languages: undefined })}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
            {(filters.lat && filters.lon) && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Location: {filters.radius_km || 15}km
                <button
                  onClick={() => setFilters({ ...filters, lat: undefined, lon: undefined })}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="flex-1"
          >
            Search Providers
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={loading}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
