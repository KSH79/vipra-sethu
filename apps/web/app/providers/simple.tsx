'use client';

import { useState, useEffect } from 'react';
import { searchProviders } from '@/lib/services/taxonomy';

export default function ProvidersSimple() {
  const [status, setStatus] = useState('Loading...');
  const [providers, setProviders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  console.log('ProvidersSimple: Component rendering');
  console.log('ProvidersSimple: Current state:', { status, providersCount: providers.length, error });

  useEffect(() => {
    console.log('ProvidersSimple: useEffect triggered');
    
    const loadProviders = async () => {
      try {
        console.log('ProvidersSimple: Starting to load providers');
        setStatus('Loading providers...');
        
        const results = await searchProviders({ limit: 10 });
        console.log('ProvidersSimple: Got results:', results);
        
        setProviders(results.data);
        setStatus(`Loaded ${results.data.length} providers`);
      } catch (err) {
        console.error('ProvidersSimple: Error loading providers:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Error');
      }
    };

    loadProviders();
  }, []);

  console.log('ProvidersSimple: About to render JSX');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Providers Page - Simple Data Test</h1>
        
        <div className="mt-8 p-4 bg-white rounded border">
          <h2 className="font-medium mb-2">Status:</h2>
          <p>{status}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">Error: {error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-white rounded border">
          <h2 className="font-medium mb-2">Providers ({providers.length}):</h2>
          {providers.length > 0 ? (
            <div className="space-y-2">
              {providers.map((provider, index) => (
                <div key={provider.id} className="p-2 bg-gray-50 rounded text-sm">
                  {index + 1}. {provider.name} - {provider.category_name || 'No category'}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No providers loaded</p>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700 text-sm">
            Check the browser console for detailed logging messages.
          </p>
        </div>
      </div>
    </div>
  );
}
