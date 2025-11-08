"use client";

import { useState } from "react";
import { ProviderCard } from "./ProviderCard";
import { SearchBar } from "./SearchBar";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  SortAsc, 
  Users, 
  MapPin, 
  Star,
  SlidersHorizontal
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  category: string;
  languages: string[];
  sampradaya?: string;
  phone: string;
  email?: string;
  location: string;
  experience: string;
  about: string;
  rating?: number;
  verified?: boolean;
  photo?: string;
}

interface SearchFilters {
  location?: string;
  category?: string;
  sampradaya?: string;
  languages?: string[];
}

interface ProviderListProps {
  providers: Provider[];
  loading?: boolean;
  error?: string;
  onSearch?: (query: string, filters: SearchFilters) => void;
  onContact?: (provider: Provider) => void;
  className?: string;
}

export function ProviderList({ 
  providers, 
  loading = false, 
  error, 
  onSearch,
  onContact,
  className 
}: ProviderListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState("experience");

  // Filter providers based on search and filters
  const filteredProviders = providers.filter(provider => {
    const matchesQuery = !searchQuery || 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.about.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = !searchFilters.location || 
      provider.location.toLowerCase().includes(searchFilters.location.toLowerCase());

    const matchesCategory = !searchFilters.category || 
      provider.category === searchFilters.category;

    const matchesSampradaya = !searchFilters.sampradaya || 
      provider.sampradaya === searchFilters.sampradaya;

    return matchesQuery && matchesLocation && matchesCategory && matchesSampradaya;
  });

  // Sort providers
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case "experience":
        return parseInt(b.experience) - parseInt(a.experience);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "name":
        return a.name.localeCompare(b.name);
      case "verified":
        return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
      default:
        return 0;
    }
  });

  const handleSearch = (query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    onSearch?.(query, filters);
  };

  const handleContact = (provider: Provider) => {
    onContact?.(provider);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert className={className}>
        <Search className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (providers.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No providers found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button variant="outline" onClick={() => handleSearch("", {})}>
            Clear search
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <SearchBar 
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {sortedProviders.length} Providers Found
          </h2>
          <p className="text-sm text-muted-foreground">
            {searchQuery && `Searching for "${searchQuery}" • `}
            Sorted by {sortBy}
          </p>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("experience")}>
                <Users className="h-4 w-4 mr-2" />
                Experience
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("rating")}>
                <Star className="h-4 w-4 mr-2" />
                Rating
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                <SortAsc className="h-4 w-4 mr-2" />
                Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("verified")}>
                <Users className="h-4 w-4 mr-2" />
                Verified First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active Filters Summary */}
      {Object.values(searchFilters).some(v => v) && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {searchFilters.location && (
                  <Badge variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {searchFilters.location}
                  </Badge>
                )}
                {searchFilters.category && (
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" />
                    {searchFilters.category}
                  </Badge>
                )}
                {searchFilters.sampradaya && (
                  <Badge variant="secondary">
                    {searchFilters.sampradaya}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch("", {})}
              >
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedProviders.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onContact={handleContact}
          />
        ))}
      </div>

      {/* No Results for Current Search */}
      {sortedProviders.length === 0 && !loading && providers.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <SlidersHorizontal className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search filters to see more results
            </p>
            <Button variant="outline" onClick={() => handleSearch("", {})}>
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
