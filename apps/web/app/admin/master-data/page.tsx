"use client";

import Link from "next/link";

const cards = [
  { href: "/admin/master-data/categories", title: "Categories / Services", desc: "Manage service categories", key: "categories" },
  { href: "/admin/master-data/sampradayas", title: "Sampradayas", desc: "Manage traditions", key: "sampradayas" },
  { href: "/admin/master-data/languages", title: "Languages", desc: "Manage ISO 639-1 languages", key: "languages" },
  { href: "/admin/master-data/service-radius", title: "Service Radius", desc: "Distance options for providers", key: "service_radius" },
  { href: "/admin/master-data/experience-levels", title: "Experience Levels", desc: "Beginner / Intermediate / Expert", key: "experience" },
  { href: "/admin/master-data/sampradaya-categories", title: "Sampradaya ↔ Category", desc: "Applicability mapping", key: "mapping" },
  { href: "/admin/master-data/terms", title: "Terms & Policies", desc: "Versioned legal content", key: "terms" },
];

export default function MasterDataHome() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Master Data</h1>
      <p className="mt-2 text-slate-600">Create and manage reference data used across the platform.</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link key={c.key} href={c.href} className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
              </div>
              <span className="text-saffron-700 text-xl group-hover:translate-x-0.5 transition">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
