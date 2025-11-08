'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function ProvidersTest() {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('Connecting to Supabase...');
        const supabase = await createClient();
        
        setStatus('Testing simple query...');
        const { data: testData, error: testError } = await supabase
          .from('providers')
          .select('id, name, status')
          .eq('status', 'approved')
          .limit(5);

        if (testError) {
          throw new Error(`Simple query failed: ${testError.message}`);
        }

        setStatus('Testing RPC...');
        const { data: rpcData, error: rpcError } = await supabase.rpc('search_providers', {
          p_text: null,
          p_category: null,
          p_languages: null,
          p_sampradaya: null,
          p_lat: null,
          p_lon: null,
          p_radius_km: 15,
          p_limit: 5,
          p_offset: 0,
        });

        if (rpcError) {
          throw new Error(`RPC failed: ${rpcError.message}`);
        }

        setStatus('Success!');
        setData({
          simpleQuery: testData,
          rpcQuery: rpcData,
          counts: {
            simpleCount: testData?.length || 0,
            rpcCount: Array.isArray(rpcData) ? rpcData.length : 0
          }
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Error');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Providers Page Test</h1>
        
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-medium mb-3">Status: {status}</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {data && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Simple Query Results:</h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(data.simpleQuery, null, 2)}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">RPC Query Results:</h3>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                  {JSON.stringify(data.rpcQuery, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Counts:</h3>
                <pre className="bg-gray-50 p-3 rounded text-xs">
                  {JSON.stringify(data.counts, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-blue-700 text-sm">
            If this page loads and shows data, then the issue is in the main providers page component, not the database connection.
          </p>
        </div>
      </div>
    </div>
  );
}
