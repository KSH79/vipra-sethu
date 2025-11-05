
"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle, XCircle, Eye, Clock, User, Briefcase, Phone, Mail, Globe } from "lucide-react";
import { analytics } from "@/lib/analytics";

// Mock pending providers - replace with actual Supabase call
const mockPendingProviders = [
  {
    id: "1",
    name: "Sharma Avadhani",
    category: "Vedic Purohit",
    languages: ["Kannada", "Sanskrit"],
    sampradaya: "Madhwa",
    phone: "9876543210",
    email: "sharma.avadhani@example.com",
    location: "Basavanagudi, Bangalore",
    experience: "12 years",
    about: "Experienced Vedic purohit specializing in Upanayana and Gruha Pravesha ceremonies.",
    submittedAt: "2025-01-15T10:30:00Z",
    status: "pending"
  },
  {
    id: "2",
    name: "Ganapathi Bhatt",
    category: "Cook",
    languages: ["Kannada", "Tulu"],
    sampradaya: "Smarta",
    phone: "9876543211",
    email: "ganapathi.bhatt@example.com",
    location: "Malleshwaram, Bangalore",
    experience: "8 years",
    about: "Traditional vegetarian cook specializing in South Indian cuisine for ceremonies and events.",
    submittedAt: "2025-01-14T15:45:00Z",
    status: "pending"
  },
  {
    id: "3",
    name: "Ramesh Sastri",
    category: "Vedic Purohit",
    languages: ["Telugu", "Sanskrit"],
    sampradaya: "Vaishnava",
    phone: "9876543212",
    email: "ramesh.sastri@example.com",
    location: "Jayanagar, Bangalore",
    experience: "15 years",
    about: "Vaishnava tradition purohit with expertise in Satyanarayana Puja and other rituals.",
    submittedAt: "2025-01-13T09:20:00Z",
    status: "pending"
  }
];

export default function Admin() {
  const [pendingProviders, setPendingProviders] = useState(mockPendingProviders);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending'|'approved'|'rejected'>('pending');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const handleApprove = async (providerId: string) => {
    setIsLoading(true);
    try {
      // Find provider data for tracking
      const provider = pendingProviders.find(p => p.id === providerId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingProviders(prev => 
        prev.filter(p => p.id !== providerId)
      );
      
      if (selectedProvider?.id === providerId) {
        setIsDrawerOpen(false);
        setSelectedProvider(null);
      }
      
      // Track admin approval
      if (provider) {
        analytics.trackAdminApproval(
          providerId,
          provider.name,
          'admin@example.com' // TODO: Get actual admin email from session
        );
      }
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (providerId: string) => {
    setIsLoading(true);
    try {
      // Find provider data for tracking
      const provider = pendingProviders.find(p => p.id === providerId);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingProviders(prev => 
        prev.filter(p => p.id !== providerId)
      );
      
      if (selectedProvider?.id === providerId) {
        setIsDrawerOpen(false);
        setSelectedProvider(null);
      }
      
      // Track admin rejection
      if (provider) {
        analytics.trackAdminRejection(
          providerId,
          provider.name,
          'admin@example.com', // TODO: Get actual admin email from session
          'Rejected by admin' // TODO: Get actual rejection reason
        );
      }
    } catch (error) {
      console.error('Rejection error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDrawer = (provider: any) => {
    setSelectedProvider(provider);
    setIsDrawerOpen(true);
  };

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

  const filteredPending = useMemo(() => {
    let list = pendingProviders;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category);
    }
    return list;
  }, [pendingProviders, search, category]);

  const totalPages = Math.max(1, Math.ceil(filteredPending.length / pageSize));
  const pagedPending = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPending.slice(start, start + pageSize);
  }, [filteredPending, page]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="section-padding">
        <div className="container-custom max-w-6xl space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h1 className="title-large mb-2">Admin Dashboard</h1>
            <p className="subtitle">Review and approve pending provider submissions</p>

            {/* KPI cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Pending Review</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{pendingProviders.length}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Approved (this month)</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">124</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Avg. Review Time</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">18 hrs</p>
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
                    <option value="vedic purohit">Vedic Purohit</option>
                    <option value="cook">Cook</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pending Providers List */}
            {activeTab === 'pending' && (filteredPending.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {pagedPending.map((provider) => (
                  <div key={provider.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    {/* Provider Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900 truncate">
                          {provider.name}
                        </h3>
                        <Badge variant="saffron">{provider.category}</Badge>
                        {provider.sampradaya && (
                          <Badge variant="sandstone">{provider.sampradaya}</Badge>
                        )}
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
                title="No pending approvals"
                description="All provider submissions have been reviewed. Check back later for new submissions."
                action={<Button variant="secondary">Refresh</Button>}
              />
            ))}

            {activeTab !== 'pending' && (
              <div className="p-8">
                <EmptyState
                  icon="✅"
                  title={`${activeTab === 'approved' ? 'Approved' : 'Rejected'} list`}
                  description={`No ${activeTab} items to display yet.`}
                />
              </div>
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
            {/* Header */}
            <div>
              <h2 className="title-large mb-1">{selectedProvider.name}</h2>
              <p className="subtitle">{selectedProvider.category}</p>
              
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge variant="saffron">{selectedProvider.category}</Badge>
                {selectedProvider.sampradaya && (
                  <Badge variant="sandstone">{selectedProvider.sampradaya}</Badge>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <span>{selectedProvider.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <span>{selectedProvider.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500" />
                  <span>{selectedProvider.location}</span>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Professional Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  <span>Experience: {selectedProvider.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>Languages: {selectedProvider.languages.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">About</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedProvider.about}
              </p>
            </div>

            {/* Submission Details */}
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Submission Details</h3>
              <div className="text-sm text-slate-600">
                <p>Submitted: {formatDate(selectedProvider.submittedAt)}</p>
                <p>Status: <Badge variant="saffron">Pending Review</Badge></p>
              </div>
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
