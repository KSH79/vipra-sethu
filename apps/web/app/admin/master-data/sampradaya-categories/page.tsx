"use client";

import { useEffect, useMemo, useState } from "react";

type Mapping = {
  sampradaya_code: string;
  category_code: string;
  created_at?: string;
};

type Option = { code: string; name: string };

export default function SampradayaCategoryManager() {
  const [items, setItems] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sampradayas, setSampradayas] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  const [filterSampradaya, setFilterSampradaya] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  const [form, setForm] = useState<{ sampradaya_code: string; category_code: string }>({ sampradaya_code: "", category_code: "" });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((i) => (
      (!filterSampradaya || i.sampradaya_code === filterSampradaya) &&
      (!filterCategory || i.category_code === filterCategory)
    ));
  }, [items, filterSampradaya, filterCategory]);

  async function loadOptions() {
    const [sRes, cRes] = await Promise.all([
      fetch('/api/master-data/sampradayas?active=true', { cache: 'no-store' }),
      fetch('/api/master-data/categories?active=true', { cache: 'no-store' })
    ]);
    const sJson = await sRes.json();
    const cJson = await cRes.json();
    if (!sJson.ok) throw new Error(sJson.error || 'Failed to load sampradayas');
    if (!cJson.ok) throw new Error(cJson.error || 'Failed to load categories');
    setSampradayas((sJson.data || []).map((r: any) => ({ code: r.code, name: r.name })));
    setCategories((cJson.data || []).map((r: any) => ({ code: r.code, name: r.name })));
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterSampradaya) params.set('sampradaya_code', filterSampradaya);
      if (filterCategory) params.set('category_code', filterCategory);
      const res = await fetch(`/api/admin/master-data/sampradaya-categories?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to fetch');
      setItems(json.data || []);
    } catch (e: any) {
      setError(e?.message || 'Load failed');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await loadOptions();
        await load();
      } catch (e: any) {
        setError(e?.message || 'Init failed');
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAdd() {
    try {
      if (!form.sampradaya_code || !form.category_code) return alert('Select both');
      setSaving(true);
      const res = await fetch('/api/admin/master-data/sampradaya-categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Create failed');
      setForm({ sampradaya_code: '', category_code: '' });
      await load();
    } catch (e: any) {
      alert(e?.message || 'Create failed');
    } finally { setSaving(false); }
  }

  async function onDelete(m: Mapping) {
    if (!confirm(`Remove mapping ${m.sampradaya_code} ↔ ${m.category_code}?`)) return;
    const res = await fetch('/api/admin/master-data/sampradaya-categories', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(m)
    });
    const json = await res.json();
    if (!json.ok) return alert(json.error || 'Delete failed');
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sampradaya ↔ Category</h1>
          <p className="mt-1 text-slate-600">Control which sampradayas apply to which services.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select value={filterSampradaya} onChange={(e)=>setFilterSampradaya(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Sampradayas</option>
          {sampradayas.map(s=> <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
        <select value={filterCategory} onChange={(e)=>setFilterCategory(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Categories</option>
          {categories.map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <button onClick={load} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Apply</button>
      </div>

      {/* Add mapping */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 grid gap-3 sm:grid-cols-3">
        <select value={form.sampradaya_code} onChange={(e)=>setForm(f=>({...f, sampradaya_code:e.target.value}))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Select Sampradaya</option>
          {sampradayas.map(s=> <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>
        <select value={form.category_code} onChange={(e)=>setForm(f=>({...f, category_code:e.target.value}))} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Select Category</option>
          {categories.map(c=> <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <button disabled={saving} onClick={onAdd} className="rounded-md bg-saffron-700 px-3 py-2 text-white text-sm font-medium hover:bg-saffron-800 disabled:opacity-60">{saving ? 'Adding…' : 'Add Mapping'}</button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-2">Sampradaya</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>)}
            {error && !loading && (<tr><td colSpan={3} className="px-4 py-8 text-center text-red-600">{error}</td></tr>)}
            {!loading && !error && filtered.length === 0 && (<tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">No mappings</td></tr>)}
            {filtered.map((row) => (
              <tr key={`${row.sampradaya_code}-${row.category_code}`} className="border-t border-slate-100">
                <td className="px-4 py-2">{sampradayas.find(s=>s.code===row.sampradaya_code)?.name || row.sampradaya_code}</td>
                <td className="px-4 py-2">{categories.find(c=>c.code===row.category_code)?.name || row.category_code}</td>
                <td className="px-4 py-2">
                  <button onClick={() => onDelete(row)} className="rounded-md border border-red-300 text-red-700 px-2 py-1 text-xs hover:bg-red-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
