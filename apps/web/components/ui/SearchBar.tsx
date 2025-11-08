"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Users, 
  Calendar,
  ChevronDown 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchFilters {
  location?: string;
  category?: string;
  sampradaya?: string;
  languages?: string[];
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading?: boolean;
  className?: string;
}

const categories = [
  "Vedic Purohit",
  "Cook", 
  "Priest",
  "Astrologer",
  "Ceremony Specialist"
];

const sampradayas = [
  "Madhwa",
  "Smarta",
  "Sri Vaishnava",
  "Shaivite",
  "Gaudiya Vaishnava"
];

const languages = [
  "Kannada", "Hindi", "Tamil", "Telugu", "Sanskrit", "English"
];

export function SearchBar({ onSearch, loading = false, className }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const clearFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    v && (typeof v === 'string' ? v.length > 0 : v.length > 0)
  ).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search providers by name, service, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4 h-12 text-base"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          size="default"
          className="h-12 px-6"
        >
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-1">
          {filters.location && (
            <Badge variant="default" className="gap-1">
              <MapPin className="h-3 w-3" />
              {filters.location}
              <button
                onClick={() => clearFilter('location')}
                className="ml-1 hover:bg-muted rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="default" className="gap-1">
              <Users className="h-3 w-3" />
              {filters.category}
              <button
                onClick={() => clearFilter('category')}
                className="ml-1 hover:bg-muted rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sampradaya && (
            <Badge variant="default" className="gap-1">
              {filters.sampradaya}
              <button
                onClick={() => clearFilter('sampradaya')}
                className="ml-1 hover:bg-muted rounded-full w-4 h-4 flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input
                  placeholder="Enter location..."
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.category || "Select category"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => handleFilterChange('category', category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Sampradaya Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tradition</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.sampradaya || "Select tradition"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {sampradayas.map((sampradaya) => (
                      <DropdownMenuItem
                        key={sampradaya}
                        onClick={() => handleFilterChange('sampradaya', sampradaya)}
                      >
                        {sampradaya}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
