'use client';

import { useState, useEffect } from 'react';
import { getCategories, getSampradayas } from '@/lib/services/taxonomy';

export function TaxonomyDebug() {
  const [categories, setCategories] = useState<any[]>([]);
  const [sampradayas, setSampradayas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading categories...');
        const cats = await getCategories();
        console.log('Categories loaded:', cats);
        setCategories(cats);
        
        console.log('Loading sampradayas...');
        const sams = await getSampradayas();
        console.log('Sampradayas loaded:', sams);
        setSampradayas(sams);
        
      } catch (err) {
        console.error('Error loading taxonomy:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg m-4">
      <h2 className="text-xl font-bold mb-4">Taxonomy Debug</h2>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-red-700 font-semibold">Error: {error}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Categories ({categories.length}):</h3>
          <ul className="list-disc pl-5">
            {categories.map(cat => (
              <li key={cat.code}>{cat.name} ({cat.code})</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Sampradayas ({sampradayas.length}):</h3>
          <ul className="list-disc pl-5">
            {sampradayas.map(sam => (
              <li key={sam.code}>{sam.name} ({sam.code})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
