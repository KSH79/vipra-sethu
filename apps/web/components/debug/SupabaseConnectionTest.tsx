'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/Button';

export function SupabaseConnectionTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('loading');
    setMessage('Testing connection...');
    setDetails(null);

    try {
      const supabase = await createClient();
      
      // Test basic connection
      console.log('Testing Supabase connection...');
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // Test simple query
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('count')
        .single();

      if (categoriesError) {
        throw new Error(`Categories query failed: ${categoriesError.message}`);
      }

      // Test providers count
      const { data: providersData, error: providersError } = await supabase
        .from('providers')
        .select('count')
        .eq('status', 'approved')
        .single();

      if (providersError) {
        throw new Error(`Providers query failed: ${providersError.message}`);
      }

      // Test RPC function
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

      setStatus('success');
      setMessage('Connection successful!');
      setDetails({
        categories: categoriesData,
        providers: providersData,
        rpcResult: Array.isArray(rpcData) ? `Found ${rpcData.length} providers` : 'RPC returned non-array data',
        rpcDataLength: Array.isArray(rpcData) ? rpcData.length : 0,
      });

    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setDetails({
        error: error,
        envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        envKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      });
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="bg-white rounded-lg border p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">Supabase Connection Test</h3>
        <Button variant="outline" size="sm" onClick={testConnection}>
          Test Again
        </Button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            status === 'loading' ? 'bg-yellow-500 animate-pulse' :
            status === 'success' ? 'bg-green-500' :
            'bg-red-500'
          }`} />
          <span className={`text-sm ${
            status === 'loading' ? 'text-yellow-700' :
            status === 'success' ? 'text-green-700' :
            'text-red-700'
          }`}>
            {status === 'loading' ? 'Testing...' :
             status === 'success' ? 'Connected' :
             'Failed'}
          </span>
        </div>
        
        {message && (
          <p className="text-sm text-gray-600">{message}</p>
        )}
        
        {details && (
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Debug info</summary>
            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
