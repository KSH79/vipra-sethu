'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

// Common languages spoken in India for religious services
const COMMON_LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'bn', name: 'Bengali' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'ur', name: 'Urdu' },
];

interface LanguageFilterProps {
  selectedLanguages?: string[];
  onLanguagesChange: (languages: string[] | undefined) => void;
  className?: string;
}

export function LanguageFilter({
  selectedLanguages = [],
  onLanguagesChange,
  className = ''
}: LanguageFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageToggle = (languageCode: string) => {
    if (selectedLanguages?.includes(languageCode)) {
      // Remove language
      const newLanguages = selectedLanguages.filter(lang => lang !== languageCode);
      onLanguagesChange(newLanguages.length > 0 ? newLanguages : undefined);
    } else {
      // Add language
      const newLanguages = [...(selectedLanguages || []), languageCode];
      onLanguagesChange(newLanguages);
    }
  };

  const handleClearAll = () => {
    onLanguagesChange(undefined);
  };

  const getSelectedLanguageNames = () => {
    return selectedLanguages?.map(code => {
      const language = COMMON_LANGUAGES.find(lang => lang.code === code);
      return language ? language.name : code;
    }) || [];
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        {selectedLanguages && selectedLanguages.length > 0 ? (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <span className="text-sm text-gray-900">
                {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {getSelectedLanguageNames().slice(0, 2).map((name, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {name}
                  </Badge>
                ))}
                {selectedLanguages.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedLanguages.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-500">Select languages</span>
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-auto">
          {/* Header with clear all */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Languages</span>
            {selectedLanguages && selectedLanguages.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Language Options */}
          <div className="grid grid-cols-2 gap-1 p-2">
            {COMMON_LANGUAGES.map((language) => (
              <label
                key={language.code}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages?.includes(language.code) || false}
                  onChange={() => handleLanguageToggle(language.code)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {language.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {language.code.toUpperCase()}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500">
            Select all languages that apply
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
