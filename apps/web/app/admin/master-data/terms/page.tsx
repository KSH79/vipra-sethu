"use client";

import { useEffect, useMemo, useState } from "react";

type Term = {
  id: string;
  type: "user_terms" | "provider_terms" | "privacy_policy" | "other";
  version: string;
  content: string;
  effective_date?: string | null;
  description?: string | null;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

const TYPES: Array<{ value: Term["type"]; label: string }> = [
  { value: "provider_terms", label: "Provider Terms" },
  { value: "user_terms", label: "User Terms" },
  { value: "privacy_policy", label: "Privacy Policy" },
  { value: "other", label: "Other" },
];

export default function TermsManager() {
  const [items, setItems] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [q, setQ] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Term | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Term>>({
    type: "provider_terms",
    version: "",
    content: "",
    effective_date: "",
    description: "",
    display_order: 0,
    is_active: false,
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (filterType && i.type !== filterType) return false;
      if (!includeInactive && !i.is_active) return false;
      if (!includeDeleted && i.deleted_at) return false;
      if (!term) return true;
      return (
        i.version.toLowerCase().includes(term) ||
        (i.description || "").toLowerCase().includes(term)
      );
    });
  }, [items, filterType, includeInactive, includeDeleted, q]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (includeInactive) params.set("includeInactive", "true");
      if (includeDeleted) params.set("includeDeleted", "true");
      const res = await fetch(`/api/admin/master-data/terms?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to fetch");
      setItems(json.data || []);
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  function openCreate() {
    setEditing(null);
    setForm({ type: "provider_terms", version: "", content: "", effective_date: "", description: "", display_order: 0, is_active: false });
    setShowForm(true);
  }
  function openEdit(row: Term) {
    setEditing(row);
    setForm({
      type: row.type,
      version: row.version,
      content: row.content,
      effective_date: row.effective_date || "",
      description: row.description || "",
      display_order: row.display_order,
      is_active: row.is_active,
    });
    setShowForm(true);
  }

  async function onSave() {
    try {
      setSaving(true);
      const isEdit = !!editing;
      const url = isEdit ? `/api/admin/master-data/terms/${encodeURIComponent(editing!.id)}` : "/api/admin/master-data/terms";
      const method = isEdit ? "PUT" : "POST";
      const body: any = {
        type: form.type,
        version: form.version,
        content: form.content,
        effective_date: form.effective_date || null,
        description: form.description,
        display_order: Number(form.display_order) || 0,
        is_active: !!form.is_active,
      };
      if (isEdit) delete body.type; // avoid changing type during edit by default
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      alert(e?.message || "Save failed");
    } finally { setSaving(false); }
  }

  async function onDelete(id: string) {
    if (!confirm("Soft delete this terms version?")) return;
    const res = await fetch(`/api/admin/master-data/terms/${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) return alert(json.error || "Delete failed");
    await load();
  }

  async function setActive(row: Term) {
    const res = await fetch(`/api/admin/master-data/terms/${encodeURIComponent(row.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: true }),
    });
    const json = await res.json();
    if (!json.ok) return alert(json.error || "Failed to activate");
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Terms & Policies</h1>
          <p className="mt-1 text-slate-600">Versioned content with single active per type.</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-saffron-700 px-3 py-2 text-white text-sm font-medium hover:bg-saffron-800">Add Version</button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <select value={filterType} onChange={(e)=>setFilterType(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">All types</option>
          {TYPES.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search by version/description" className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron-500" />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={includeInactive} onChange={(e)=>setIncludeInactive(e.target.checked)} /> Include inactive
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={includeDeleted} onChange={(e)=>setIncludeDeleted(e.target.checked)} /> Include deleted
        </label>
        <button onClick={load} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">Apply</button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Version</th>
              <th className="px-4 py-2">Effective</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (<tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading…</td></tr>)}
            {error && !loading && (<tr><td colSpan={5} className="px-4 py-8 text-center text-red-600">{error}</td></tr>)}
            {!loading && !error && filtered.length === 0 && (<tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No terms</td></tr>)}
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{TYPES.find(t=>t.value===row.type)?.label || row.type}</td>
                <td className="px-4 py-2">{row.version}</td>
                <td className="px-4 py-2 text-slate-700">{row.effective_date ? new Date(row.effective_date).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ring-1 ${row.is_active ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-600 ring-slate-200'}`}>
                    {row.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {!row.is_active && (
                      <button onClick={()=>setActive(row)} className="rounded-md border border-emerald-300 text-emerald-700 px-2 py-1 text-xs hover:bg-emerald-50">Set Active</button>
                    )}
                    <button onClick={()=>openEdit(row)} className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Edit</button>
                    <button onClick={()=>onDelete(row.id)} className="rounded-md border border-red-300 text-red-700 px-2 py-1 text-xs hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? 'Edit Terms' : 'Add Terms'}</h2>
              <button onClick={()=>setShowForm(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              {!editing && (
                <div>
                  <label className="block text-sm text-slate-700">Type</label>
                  <select value={String(form.type || '')} onChange={(e)=>setForm(f=>({...f, type: e.target.value as Term['type']}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500">
                    {TYPES.map(t=> <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700">Version</label>
                  <input value={String(form.version || '')} onChange={(e)=>setForm(f=>({...f, version:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" placeholder="e.g., 2025-11-10" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700">Effective Date</label>
                  <input type="date" value={String(form.effective_date || '')} onChange={(e)=>setForm(f=>({...f, effective_date:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700">Description</label>
                <input value={String(form.description || '')} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-700">Content</label>
                <textarea value={String(form.content || '')} onChange={(e)=>setForm(f=>({...f, content:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" rows={12} placeholder="Paste or type rich text (basic)" />
                <p className="mt-1 text-xs text-slate-500">Note: We use a simple editor for Phase 0. Rich editor can be added later.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700">Display Order</label>
                  <input type="number" value={Number(form.display_order || 0)} onChange={(e)=>setForm(f=>({...f, display_order:Number(e.target.value)}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm(f=>({...f, is_active:e.target.checked}))} />
                    Set Active
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
