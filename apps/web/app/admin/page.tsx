
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle, XCircle, Eye, Clock, User, Briefcase, Phone, Mail, Globe } from "lucide-react";
import { approveProvider, rejectProvider } from "@/app/admin/actions";

type ProviderRow = {
  id: string;
  name: string;
  category?: string;
  category_code?: string;
  sampradaya?: string;
  phone?: string;
  email?: string;
  location?: string;
  experience?: string;
  languages?: string[];
  about?: string;
  submittedAt: string;
  status: string;
}

type Category = { code: string; name: string }

export default function Admin() {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [metrics, setMetrics] = useState<{pendingCount:number;approvedThisMonth:number;avgReviewHours:number}>({pendingCount:0,approvedThisMonth:0,avgReviewHours:0});
  const [selectedProvider, setSelectedProvider] = useState<ProviderRow|null>(null);
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<{
    email?: string|null;
    location_text?: string|null;
    service_radius_km?: number|null;
    years_experience?: number|null;
    about?: string|null;
    whatsapp?: string|null;
    languages?: string[]|null;
    availability_notes?: string|null;
    travel_notes?: string|null;
    expectations?: string[]|null;
    response_time_hours?: number|null;
    rejection_reason?: string|null;
    photo_url?: string|null;
    profile_photo_url?: string|null;
    photo_signed_url?: string|null;
    profile_photo_signed_url?: string|null;
    photo?: { thumbnail_path?: string|null; original_path?: string|null; thumbnail_url?: string|null; original_url?: string|null }|null
  } | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending'|'approved'|'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isListLoading, setIsListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const statusMap: Record<typeof activeTab, string> = {
    pending: 'pending_review',
    approved: 'approved',
    rejected: 'rejected',
  }

  async function loadCategories() {
    const res = await fetch('/api/admin/categories', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed categories')
    const json = await res.json()
    setCategories(json.categories as Category[])
  }

  async function loadMetrics() {
    const res = await fetch('/api/admin/metrics', { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed metrics')
    const json = await res.json()
    setMetrics(json)
  }

  async function loadProviders() {
    setIsListLoading(true)
    setListError(null)
    try {
      const params = new URLSearchParams()
      params.set('status', statusMap[activeTab])
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/admin/providers?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed providers')
      const json = await res.json()
      setProviders(json.providers as ProviderRow[])
      setTotal(json.total as number)
    } catch (e: any) {
      setListError(e?.message || 'Failed to load providers')
    } finally {
      setIsListLoading(false)
    }
  }

  useEffect(() => {
    loadCategories().catch(() => {})
    loadMetrics().catch(() => {})
  }, [])

  useEffect(() => {
    loadProviders()
  }, [activeTab, category, search, page])

  const retryLoad = () => {
    loadProviders()
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pagedProviders = providers; // server paginates

  const handleApprove = async (providerId: string) => {
    setIsLoading(true)
    // optimistic remove
    const prev = providers
    setProviders(prev.filter(p=>p.id!==providerId))
    try {
      await approveProvider(providerId)
      await Promise.all([loadMetrics(), loadProviders()])
      if (selectedProvider?.id === providerId) {
        setIsDrawerOpen(false)
        setSelectedProvider(null)
      }
    } catch (e) {
      // revert
      setProviders(prev)
      console.error('Approval error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (providerId: string) => {
    setIsLoading(true)
    const prev = providers
    setProviders(prev.filter(p=>p.id!==providerId))
    try {
      await rejectProvider(providerId)
      await Promise.all([loadMetrics(), loadProviders()])
      if (selectedProvider?.id === providerId) {
        setIsDrawerOpen(false)
        setSelectedProvider(null)
      }
    } catch (e) {
      setProviders(prev)
      console.error('Rejection error:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const openDrawer = (provider: ProviderRow) => {
    setSelectedProvider(provider);
    setIsDrawerOpen(true);
  };

  // Load full detail on open (no over-fetch for the list)
  useEffect(() => {
    let active = true
    async function loadDetail() {
      if (!selectedProvider) { setDetail(null); return }
      setDetailLoading(true)
      try {
        const res = await fetch(`/api/admin/providers/${selectedProvider.id}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('detail fetch failed')
        const json = await res.json()
        if (!active) return
        setDetail({
          email: json?.provider?.email ?? null,
          location_text: json?.provider?.location_text ?? null,
          service_radius_km: json?.provider?.service_radius_km ?? null,
          years_experience: json?.provider?.years_experience ?? null,
          about: json?.provider?.about ?? null,
          whatsapp: json?.provider?.whatsapp ?? null,
          languages: json?.provider?.languages ?? null,
          availability_notes: json?.provider?.availability_notes ?? null,
          travel_notes: json?.provider?.travel_notes ?? null,
          expectations: json?.provider?.expectations ?? null,
          response_time_hours: json?.provider?.response_time_hours ?? null,
          rejection_reason: json?.provider?.rejection_reason ?? null,
          photo_url: json?.provider?.photo_url ?? json?.provider?.profile_photo_url ?? null,
          profile_photo_url: json?.provider?.profile_photo_url ?? null,
          photo_signed_url: json?.provider?.photo_signed_url ?? null,
          profile_photo_signed_url: json?.provider?.profile_photo_signed_url ?? null,
          photo: json?.photo ?? null,
        })
      } catch {
        if (active) setDetail(null)
      } finally {
        if (active) setDetailLoading(false)
      }
    }
    loadDetail()
    return () => { active = false }
  }, [selectedProvider])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Server-paginated list; filtering and pagination done via API

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="section-padding flex items-center justify-center min-h-screen py-12">
        <div className="container-custom max-w-6xl w-full space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="title-large mb-2">Admin Dashboard</h1>
            <p className="subtitle">Review and approve pending provider submissions</p>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Pending Review</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.pendingCount}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Approved (this month)</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.approvedThisMonth}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Avg. Review Time</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{metrics.avgReviewHours || 0} hrs</p>
              </div>
            </div>
          </div>

          {/* Tabs + Controls */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <div className="flex gap-2 rounded-xl bg-slate-100 p-1 w-fit">
                  {(['pending','approved','rejected'] as const).map(tab => (
                    <button
                      key={tab}
                      className={`px-3 py-1.5 text-sm rounded-lg ${activeTab===tab? 'bg-white text-slate-900 shadow-sm':'text-slate-600 hover:text-saffron'}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase()+tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="md:ml-auto flex items-center gap-2">
                  <input
                    type="search"
                    value={search}
                    onChange={(e)=>{setSearch(e.target.value); setPage(1);}}
                    placeholder="Search name, category, location"
                    className="h-10 w-56 rounded-xl border border-sandstone/30 px-3 focus:outline-none focus:ring-2 focus:ring-saffron/40"
                    aria-label="Search submissions"
                  />
                  <select
                    value={category}
                    onChange={(e)=>{setCategory(e.target.value); setPage(1);}}
                    className="h-10 rounded-xl border border-sandstone/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/40"
                    aria-label="Filter by category"
                  >
                    <option value="">All categories</option>
                    {categories.map(c => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Providers List for active tab */}
            {!isListLoading && providers.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {pagedProviders.map((provider) => (
                  <div key={provider.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    {/* Provider Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900 truncate">{provider.name}</h3>
                        <Badge variant="default">{(categories.find(c=>c.code===provider.category_code)?.name) || provider.category || provider.category_code}</Badge>
                        {provider.sampradaya && (<Badge variant="secondary">{provider.sampradaya}</Badge>)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {provider.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {provider.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {provider.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        Submitted {formatDate(provider.submittedAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDrawer(provider)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleApprove(provider.id);
                        }}
                      >
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isLoading}
                          className="bg-green-700 hover:bg-green-800 text-white flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
                {/* Pagination */}
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
                    <Button variant="secondary" size="sm" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon="📋"
                title={activeTab === 'pending' ? 'No pending approvals' : `No ${activeTab} providers`}
                description={activeTab === 'pending' 
                  ? 'All provider submissions have been reviewed. Check back later for new submissions.' 
                  : 'No records match your current filters.'}
                action={<Button variant="secondary" onClick={retryLoad}>Refresh</Button>}
              />
            )}
          </div>
        </div>
      </div>

      {/* Provider Detail Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="right"
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-6">
            {/* Photo at top */}
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-xl overflow-hidden border bg-slate-100 flex items-center justify-center">
                {(() => {
                  const url =
                    detail?.photo?.thumbnail_url
                    || (detail?.photo?.thumbnail_path && typeof detail.photo.thumbnail_path === 'string' && detail.photo.thumbnail_path.startsWith('http') ? detail.photo.thumbnail_path : null)
                    || detail?.profile_photo_signed_url
                    || detail?.photo_signed_url
                    || detail?.profile_photo_url
                    || detail?.photo_url;
                  return url ? (
                    <img src={url} alt="Provider photo" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-500">No Photo</span>
                  );
                })()}
              </div>
              <div>
                <h2 className="title-large mb-1">{selectedProvider.name || 'N/A'}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{(categories.find(c=>c.code===selectedProvider.category_code)?.name) || selectedProvider.category_code || 'N/A'}</Badge>
                  <Badge variant="secondary">{selectedProvider.sampradaya || 'N/A'}</Badge>
                </div>
              </div>
            </div>

            {/* Details list */}
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Phone:</span><span>{selectedProvider.phone || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Email:</span><span>{detail?.email || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Location:</span><span>{detail?.location_text || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">WhatsApp:</span><span>{detail?.whatsapp || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Languages:</span><span>{(detail?.languages && detail.languages.length>0) ? detail.languages.join(', ') : 'N/A'}</span></div>
              <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Experience:</span><span>{detail?.years_experience ?? selectedProvider.experience ?? 'N/A'}</span></div>
              <div>
                <span className="font-medium inline-block w-40">About:</span>
                <p className="mt-1 text-slate-700">{detail?.about || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Service radius:</span><span>{detail?.service_radius_km != null ? `${detail.service_radius_km} km` : 'N/A'}</span></div>
              <div>
                <span className="font-medium inline-block w-40">Availability:</span>
                <p className="mt-1 text-slate-700">{detail?.availability_notes || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium inline-block w-40">Travel:</span>
                <p className="mt-1 text-slate-700">{detail?.travel_notes || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium inline-block w-40">Expectations:</span>
                <p className="mt-1 text-slate-700">{(detail?.expectations && detail.expectations.length>0) ? detail.expectations.join(', ') : 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /><span className="font-medium w-40 inline-block">Response time:</span><span>{detail?.response_time_hours != null ? `${detail.response_time_hours} hrs` : 'N/A'}</span></div>
              <div>
                <span className="font-medium inline-block w-40">Rejection reason:</span>
                <p className="mt-1 text-slate-700">{detail?.rejection_reason || 'N/A'}</p>
              </div>
            </div>

            {/* Status at the bottom */}
            <div className="pt-2 text-sm text-slate-600">
              <p>Status: <Badge variant="default">{selectedProvider.status || 'N/A'}</Badge></p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1"
              >
                Close
              </Button>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReject(selectedProvider.id);
                }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isLoading}
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </form>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApprove(selectedProvider.id);
                }}
                className="flex-1"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-700 hover:bg-green-800 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </form>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
