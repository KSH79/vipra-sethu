'use client';

import { useState, useEffect } from 'react';
import { Sampradaya } from '@/lib/types/taxonomy';
import { getSampradayas } from '@/lib/services/taxonomy';
import { Badge } from '@/components/ui/badge';

interface SampradayaFilterProps {
  selectedSampradaya?: string;
  onSampradayaChange: (sampradayaCode: string | undefined) => void;
  className?: string;
  placeholder?: string;
}

export function SampradayaFilter({
  selectedSampradaya,
  onSampradayaChange,
  className = '',
  placeholder = 'Select tradition'
}: SampradayaFilterProps) {
  const [sampradayas, setSampradayas] = useState<Sampradaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadSampradayas() {
      try {
        const data = await getSampradayas();
        setSampradayas(data);
      } catch (error) {
        console.error('Failed to load sampradayas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSampradayas();
  }, []);

  const selectedSampradayaData = sampradayas.find(sam => sam.code === selectedSampradaya);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {selectedSampradayaData ? (
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{selectedSampradayaData.name}</span>
            <Badge variant="secondary" className="text-xs">
              {selectedSampradayaData.code}
            </Badge>
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {/* Clear Option */}
          <button
            type="button"
            onClick={() => {
              onSampradayaChange(undefined);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b border-gray-100"
          >
            <span className="text-gray-500">All traditions</span>
          </button>

          {/* Sampradaya Options */}
          {sampradayas.map((sampradaya) => (
            <button
              key={sampradaya.code}
              type="button"
              onClick={() => {
                onSampradayaChange(sampradaya.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                selectedSampradaya === sampradaya.code ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{sampradaya.name}</span>
                <Badge variant="outline" className="text-xs">
                  {sampradaya.code}
                </Badge>
              </div>
              {sampradaya.description && (
                <p className="text-sm text-gray-500 mt-1">{sampradaya.description}</p>
              )}
            </button>
          ))}
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
