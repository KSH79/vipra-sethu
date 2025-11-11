"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Item = {
  id: string;
  title: string;
  version: string;
  content: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
};

export default function TermsManager() {
  const t = useTranslations("admin.masterDataPages.terms");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Item>>({ title: "", version: "", content: "", is_active: true });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      if (!includeInactive && !i.is_active) return false;
      if (!includeDeleted && i.deleted_at) return false;
      if (!term) return true;
      return (
        (i.title || "").toLowerCase().includes(term) ||
        (i.version || "").toLowerCase().includes(term)
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
      const res = await fetch(`/api/admin/master-data/terms?${params.toString()}`, { cache: "no-store" });
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
      const url = isEdit ? `/api/admin/master-data/terms/${encodeURIComponent(editing!.id)}` : "/api/admin/master-data/terms";
      const method = isEdit ? "PUT" : "POST";
      const body: any = {
        title: form.title,
        version: form.version,
        content: form.content,
        is_active: !!form.is_active,
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Save failed");
      setShowForm(false);
      setEditing(null);
      setForm({ title: "", version: "", content: "", is_active: true });
      await load();
    } catch (e: any) {
      alert(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    const res = await fetch(`/api/admin/master-data/terms/${encodeURIComponent(id)}`, { method: "DELETE" });
    const json = await res.json();
    if (!json.ok) return alert(json.error || "Delete failed");
    await load();
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: "", version: "", content: "", is_active: true });
    setShowForm(true);
  }
  function openEdit(row: Item) {
    setEditing(row);
    setForm({ title: row.title, version: row.version, content: row.content, is_active: row.is_active });
    setShowForm(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-slate-600">{t("subtitle")}</p>
        </div>
        <button onClick={openCreate} className="rounded-md bg-saffron-700 px-3 py-2 text-white text-sm font-medium hover:bg-saffron-800">{t("add")}</button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-saffron-500"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
          {t("includeInactive")}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} />
          {t("includeDeleted")}
        </label>
        <button onClick={load} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">{t("apply")}</button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-4 py-2">{t("columns.title")}</th>
              <th className="px-4 py-2">{t("columns.version")}</th>
              <th className="px-4 py-2">{t("columns.active")}</th>
              <th className="px-4 py-2">{t("columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">{t("loading")}</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">{t("empty")}</td></tr>
            )}
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-2 text-slate-700">{row.title}</td>
                <td className="px-4 py-2 text-slate-700">{row.version}</td>
                <td className="px-4 py-2">
                  <span className="text-sm">{row.is_active ? t("active") : t("inactive")}</span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(row)} className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">{t("edit")}</button>
                    <button onClick={() => onDelete(row.id)} className="rounded-md border border-red-300 text-red-700 px-2 py-1 text-xs hover:bg-red-50">{t("delete")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editing ? t("editTitle") : t("addTitle")}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm text-slate-700">{t("form.title")}</label>
                <input value={String(form.title || '')} onChange={(e)=>setForm(f=>({...f, title:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" placeholder={t("form.titlePlaceholder")} />
              </div>
              <div>
                <label className="block text-sm text-slate-700">{t("form.version")}</label>
                <input value={String(form.version || '')} onChange={(e)=>setForm(f=>({...f, version:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" placeholder={t("form.versionPlaceholder")} />
              </div>
              <div>
                <label className="block text-sm text-slate-700">{t("form.content")}</label>
                <textarea value={String(form.content || '')} onChange={(e)=>setForm(f=>({...f, content:e.target.value}))} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-saffron-500" rows={10} />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={!!form.is_active} onChange={(e)=>setForm(f=>({...f, is_active:e.target.checked}))} />
                  {t("form.active")}
                </label>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={()=>setShowForm(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">{t("cancel")}</button>
              <button disabled={saving} onClick={onSave} className="rounded-md bg-saffron-700 px-3 py-2 text-white text-sm font-medium hover:bg-saffron-800 disabled:opacity-60">{saving ? t("saving") : t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
