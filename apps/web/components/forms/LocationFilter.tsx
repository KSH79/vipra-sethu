'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Crosshair } from 'lucide-react';

interface LocationFilterProps {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  onLocationChange: (lat?: number, lon?: number, radiusKm?: number) => void;
  className?: string;
}

export function LocationFilter({
  latitude,
  longitude,
  radiusKm = 15,
  onLocationChange,
  className = ''
}: LocationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [locationText, setLocationText] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const hasLocation = latitude !== undefined && longitude !== undefined;

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        onLocationChange(lat, lon, radiusKm);
        setIsGettingLocation(false);
        setIsOpen(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter it manually.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleManualLocation = () => {
    // Simple parsing for "city, state" or just city
    // In a real implementation, you'd use a geocoding service
    if (locationText.trim()) {
      // For now, we'll just clear location and let user know
      // In production, you'd geocode this text to lat/lng
      alert('Location search will be available soon. Please use "Use my location" for now.');
    }
  };

  const handleClearLocation = () => {
    onLocationChange(undefined, undefined, undefined);
    setLocationText('');
  };

  const handleRadiusChange = (newRadius: number) => {
    if (hasLocation) {
      onLocationChange(latitude, longitude, newRadius);
    } else {
      onLocationChange(undefined, undefined, newRadius);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {hasLocation ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-900">
                Within {radiusKm || 15} km
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Location set
            </Badge>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Add location</span>
            <MapPin className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <svg
          className={`absolute right-3 top-3 h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4 space-y-4">
            {/* Current Location Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Crosshair className="h-4 w-4" />
                {isGettingLocation ? 'Getting location...' : 'Use my current location'}
              </button>
            </div>

            {/* Manual Location Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Or enter location manually
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="City, State"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleManualLocation}
                  disabled={!locationText.trim()}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Search
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Location search coming soon
              </p>
            </div>

            {/* Radius Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search radius: {radiusKm || 15} km
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={radiusKm || 15}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {/* Clear Location */}
            {hasLocation && (
              <button
                type="button"
                onClick={handleClearLocation}
                className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear location
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
