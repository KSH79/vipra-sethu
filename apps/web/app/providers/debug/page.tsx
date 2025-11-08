'use client';

import { useState, useEffect } from 'react';
import { searchProviders } from '@/lib/services/taxonomy';

export default function ProvidersDebug() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [providers, setProviders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    console.log('ProvidersDebug: Component mounted');
    
    const loadProviders = async () => {
      try {
        console.log('ProvidersDebug: Starting to load providers');
        setStatus('Loading providers...');
        
        const results = await searchProviders({ limit: 5 });
        console.log('ProvidersDebug: Got results:', results);
        
        setProviders(results.data);
        setStatus(`Success! Loaded ${results.data.length} providers`);
      } catch (err) {
        console.error('ProvidersDebug: Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Error loading providers');
      }
    };

    loadProviders();
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Providers Debug Page</h1>
        
        <div className="mt-4 p-4 bg-white rounded border">
          <h2 className="font-medium mb-2">Status:</h2>
          <p className="text-sm">{status}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 text-sm">Error: {error}</p>
            </div>
          )}
        </div>

        {providers.length > 0 && (
          <div className="mt-4 p-4 bg-white rounded border">
            <h2 className="font-medium mb-2">Providers ({providers.length}):</h2>
            <div className="space-y-2">
              {providers.map((provider, index) => (
                <div key={provider.id} className="p-2 bg-gray-50 rounded text-sm">
                  {index + 1}. {provider.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700 text-sm">
            Check browser console for detailed logs
          </p>
        </div>
      </div>
    </div>
  );
}
