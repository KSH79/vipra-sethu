"use client";

import { cn } from "@/lib/utils";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ChevronDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  key: string;
  label: string;
  options: FilterOption[];
  selected?: string[];
  multi?: boolean;
}

export interface FilterChipsProps {
  filters: FilterGroup[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
  resultCount?: number;
  className?: string;
}

/**
 * Filter chips component for faceted search
 */
export function FilterChips({
  filters,
  selectedFilters,
  onFilterChange,
  onClearAll,
  resultCount,
  className
}: FilterChipsProps) {
  const hasActiveFilters = Object.keys(selectedFilters).some(key => 
    selectedFilters[key]?.length > 0
  );

  const handleFilterClick = (filterKey: string, value: string) => {
    const current = selectedFilters[filterKey] || [];
    const isSelected = current.includes(value);
    
    let newValues: string[];
    if (isSelected) {
      newValues = current.filter(v => v !== value);
    } else {
      const filter = filters.find(f => f.key === filterKey);
      newValues = filter?.multi ? [...current, value] : [value];
    }
    
    onFilterChange(filterKey, newValues);
  };

  const handleRemoveFilter = (filterKey: string, value: string) => {
    const current = selectedFilters[filterKey] || [];
    const newValues = current.filter(v => v !== value);
    onFilterChange(filterKey, newValues);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Filter dropdown buttons */}
      {filters.map((filter) => {
        const selected = selectedFilters[filter.key] || [];
        const hasSelection = selected.length > 0;
        
        return (
          <div key={filter.key} className="relative">
            <button
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-sandstone/30 bg-white px-3 py-1.5 text-sm",
                "hover:border-saffron/50 transition-colors",
                hasSelection && "bg-saffron/10 border-saffron/60 text-saffron"
              )}
            >
              {filter.label}
              {hasSelection && (
                <span className="text-xs">({selected.length})</span>
              )}
              <ChevronDown className="h-3 w-3" />
            </button>
            
            {/* Dropdown would go here - simplified for now */}
          </div>
        );
      })}

      {/* Urgent toggle */}
      <button
        className={cn(
          "rounded-full px-3 py-1.5 text-sm border",
          selectedFilters.urgent?.length > 0
            ? "bg-saffron/10 text-saffron border-saffron/30"
            : "border-sandstone/30 bg-white hover:border-saffron/50"
        )}
        onClick={() => {
          const current = selectedFilters.urgent || [];
          onFilterChange('urgent', current.length > 0 ? [] : ['true']);
        }}
      >
        Urgent ⚡
      </button>

      {/* Active filter chips */}
      {Object.entries(selectedFilters).map(([key, values]) =>
        values.map((value) => {
          const filter = filters.find(f => f.key === key);
          const option = filter?.options.find(o => o.value === value);
          
          if (key === 'urgent') {
            return (
              <div
                key="urgent"
                className="inline-flex items-center gap-2 rounded-full bg-saffron/10 text-saffron px-3 py-1.5 text-sm"
              >
                <span>Urgent ⚡</span>
                <button
                  onClick={() => handleRemoveFilter(key, value)}
                  className="h-4 w-4 rounded-full bg-saffron/20 hover:bg-saffron/30 flex items-center justify-center"
                  aria-label="Remove urgent filter"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          }
          
          return (
            <div
              key={`${key}-${value}`}
              className="inline-flex items-center gap-2 rounded-full bg-saffron/10 text-saffron px-3 py-1.5 text-sm"
            >
              <span>{option?.label || value}</span>
              <button
                onClick={() => handleRemoveFilter(key, value)}
                className="h-4 w-4 rounded-full bg-saffron/20 hover:bg-saffron/30 flex items-center justify-center"
                aria-label={`Remove ${option?.label || value} filter`}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })
      )}

      {/* Clear all and results count */}
      <div className="ml-auto flex items-center gap-2">
        {resultCount !== undefined && (
          <span className="text-sm text-slate-600">
            {resultCount} found
          </span>
        )}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-slate-600 hover:text-saffron"
          >
            Clear all
          </Button>
        )}
      </div>
    </div>
  );
}
