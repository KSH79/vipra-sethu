"use client";

import { useEffect, useMemo, useState } from "react";

type Language = {
  code: string;
  name: string;
  native_name?: string | null;
  description?: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export default function LanguagesManager() {
  const [items, setItems] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Language | null>(null);
  const [form, setForm] = useState<Partial<Language>>({ code: "", name: "", native_name: "", description: "", display_order: 0, is_active: true });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (!includeInactive && !i.is_active) return false;
      if (!includeDeleted && i.deleted_at) return false;
      if (!term) return true;
      return (
        i.code.toLowerCase().includes(term) ||
        i.name.toLowerCase().includes(term) ||
        (i.native_name || "").toLowerCase().includes(term)
      );
    });
  }, [items, q, includeInactive, includeDeleted]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (includeInactive) params.set("includeInactive", "true");
      if (includeDeleted) params.set("includeDeleted", "true");
      const res = await fetch(`/api/admin/master-data/languages?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to fetch");
      setItems(json.data || []);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    try {
      setSaving(true);
      const isEdit = !!editing;
      const url = isEdit ? `/api/admin/master-data/languages/${encodeURIComponent(editing!.code)}` : "/api/admin/master-data/languages";
      const method = isEdit ? "PUT" : "POST";
      const body: any = {
        code: form.code,
        name: form.name,
        native_name: form.native_name,
        description: form.description,
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
      };
      if (isEdit) delete body.code;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      setShowForm(false);
      setEditing(null);
      setForm({ code: "", name: "", native_name: "", description: "", display_order: 0, is_active: true });
      await load();
    } catch (e: any) {
      alert(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(code: string) {
    if (!confirm(`Soft delete language ${code}?`)) return;
    const res = await fetch(`/api/admin/master-data/languages/${encodeURIComponent(code)}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) return alert(json.error || "Delete failed");
    await load();
  }

  async function onToggleActive(row: Language) {
    const res = await fetch(`/api/admin/master-data/languages/${encodeURIComponent(row.code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !row.is_active }),
    });
    const json = await res.json();
    if (!json.ok) return alert(json.error || "Update failed");
    await load();
  }

  function openCreate() {
    setEditing(null);
    setForm({ code: "", name: "", native_name: "", description: "", display_order: 0, is_active: true });
    setShowForm(true);
  }
  function openEdit(row: Language) {
    setEditing(row);
    setForm({
      code: row.code,
      name: row.name,
      native_name: row.native_name || "",
      description: row.description || "",
      display_order: row.display_order,
      is_active: row.is_active,
    });
    setShowForm(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Languages</h1>
          <p className="mt-1 text-slate-600">Manage ISO 639-1 languages used across the platform.</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-saffron-700 px-3 py-2 text-white text-sm font-medium hover:bg-saffron-800">Add Language</button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code, name or native name"
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron-500"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
          Include inactive
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />
          Include deleted
        </label>
        <button onClick={load} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Apply</button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Native</th>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No languages found</td></tr>
            )}
            {filtered.map((row) => (
              <tr key={row.code} className="border-t border-slate-100">
                <td className="px-4 py-2 font-mono text-xs text-slate-700">{row.code}</td>
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2 text-slate-600">{row.native_name || "—"}</td>
                <td className="px-4 py-2 text-slate-600">{row.display_order}</td>
                <td className="px-4 py-2">
                  <button onClick={() => onToggleActive(row)} className={`rounded-full px-2 py-0.5 text-xs ring-1 ${row.is_active ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(row)} className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
                    <button onClick={() => onDelete(row.code)} className="rounded-md border border-red-300 text-red-700 px-2 py-1 text-xs hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal (simple overlay) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Language' : 'Add Language'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              {!editing && (
                <div>
                  <label className="block text-sm text-slate-700">Code</label>
                  <input value={String(form.code || '')} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" placeholder="e.g., kn" />
                </div>
              )}
              <div>
                <label className="block text-sm text-slate-700">Name</label>
                <input value={String(form.name || '')} onChange={(e)=>setForm(f=>({...f, name:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" placeholder="e.g., Kannada" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">Native Name</label>
                <input value={String(form.native_name || '')} onChange={(e)=>setForm(f=>({...f, native_name:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" placeholder="e.g., ಕನ್ನಡ" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">Description</label>
                <textarea value={String(form.description || '')} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700">Display Order</label>
                  <input type="number" value={Number(form.display_order || 0)} onChange={(e)=>setForm(f=>({...f, display_order:Number(e.target.value)}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm(f=>({...f, is_active:e.target.checked}))} />
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={()=>setShowForm(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Cancel</button>
              <button disabled={saving} onClick={onSave} className="rounded-md bg-saffron-700 px-3 py-2 text-white text-sm font-medium hover:bg-saffron-800 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
