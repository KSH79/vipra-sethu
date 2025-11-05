
"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Accordion, AccordionItem } from "@/components/ui/Accordion";
import { ProviderPhoto, ProviderPhotoCard } from "@/components/ui/ProviderPhoto";
import { getWhatsAppLink, getTelLink, getWhatsAppContextLink } from "@/lib/utils";
import { getProviderDetails } from "@/lib/services/taxonomy";
import { ProviderWithTaxonomy } from "@/lib/types/taxonomy";
import { MessageCircle, Phone, Share2, MapPin, Languages, Clock, Star, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageViewTracker } from "@/hooks/usePageView";
import { analytics } from "@/lib/analytics";

export default function ProviderDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const providerId = params.id as string;
  const [provider, setProvider] = useState<ProviderWithTaxonomy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    async function loadProvider() {
      if (!providerId) return;
      
      try {
        setLoading(true);
        const data = await getProviderDetails(providerId);
        setProvider(data);
        
        // Track provider view analytics
        const source = searchParams?.get('source') || 'direct_link';
        analytics.trackProviderView(
          providerId,
          data?.name || 'Unknown Provider',
          source
        );
      } catch (err) {
        console.error('Failed to load provider:', err);
        setError('Failed to load provider details');
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [providerId, searchParams]);

  const handleContactClick = (contactMethod: 'whatsapp' | 'phone', messageContext?: 'general' | 'ritual' | 'consultation') => {
    if (!provider) return;
    
    // Track contact CTA with enhanced analytics
    analytics.trackContactClick(
      providerId,
      provider.name || 'Unknown Provider',
      contactMethod,
      'provider_detail',
      messageContext
    );
    
    // Also track the existing contact attempt for backward compatibility
    analytics.trackContactAttempt(
      providerId,
      provider.name || 'Unknown Provider',
      contactMethod
    );
  };

  const handleShare = async () => {
    if (!provider) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: provider.name || 'Service Provider',
          text: `${provider.name || 'Service Provider'} - ${provider.category_name || 'Service Provider'}`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copying link
        await navigator.clipboard.writeText(window.location.href);
      }
    } else {
      // Fallback to copying link
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-64 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="container-custom py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Provider not found</h2>
            <p className="text-slate-600 mb-4">{error || 'This provider could not be loaded.'}</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageViewTracker />
      {/* Sticky Action Bar */}
      <div className="sticky top-14 z-30 bg-ivory/90 backdrop-blur border-b border-sandstone/20">
        <div className="container-custom py-2">
          <div className="flex items-center gap-2">
            <nav className="text-sm text-slate-600 hidden md:block">
              <span className="hover:text-saffron">Providers</span>
              <span className="mx-2">/</span>
              <span className="text-slate-900 font-medium">{provider.name || 'Unknown Provider'}</span>
            </nav>
            <h1 className="font-medium truncate flex-1 md:hidden">{provider.name || 'Unknown Provider'}</h1>
            <div className="flex gap-2">
              {provider.phone && (
                <>
                  <a
                    href={getWhatsAppContextLink(provider.phone, provider.name || 'Unknown Provider', 'general')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleContactClick('whatsapp', 'general')}
                    className="h-9 px-3 rounded-xl bg-saffron text-white text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={getTelLink(provider.phone)}
                    onClick={() => handleContactClick('phone')}
                    className="h-9 px-3 rounded-xl border border-sandstone/30 text-sm hover:border-saffron/50 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </>
              )}
              <button
                onClick={handleShare}
                className="h-9 px-3 rounded-xl text-saffron hover:bg-saffron/10 transition-colors inline-flex items-center gap-1.5"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding">
        <div className="container-custom max-w-6xl">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <ProviderPhoto
                    photoUrl={provider.photo_url}
                    providerName={provider.name || 'Unknown Provider'}
                    size="lg"
                    priority
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{provider.name || 'Unknown Provider'}</h2>
                      <p className="text-slate-600">{provider.category_name || 'Service Provider'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {provider.status === 'approved' && (
                        <Badge variant="verified">Verified</Badge>
                      )}
                      {provider.sampradaya_name && (
                        <Badge variant="saffron">{provider.sampradaya_name}</Badge>
                      )}
                      {provider.experience_years && (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Star className="h-4 w-4 text-gold" />
                          {provider.experience_years} years experience
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.location_text || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 min-w-0">
                        <Languages className="h-4 w-4" />
                        <span className="truncate whitespace-nowrap">{provider.languages?.join(" · ") || 'Languages not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        <span>Responds in ~{provider.response_time_hours || 2} hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <Accordion
                  items={[
                    {
                      title: "About",
                      defaultOpen: true,
                      children: (
                        <div className="px-4 md:px-6 pt-5 pb-6 space-y-4">
                          <p className="leading-7">{provider.about || 'No description available.'}</p>
                          {provider.expectations && provider.expectations.length > 0 && (
                            <div className="p-4 bg-gold/5 rounded-xl">
                              <h4 className="text-slate-900 font-semibold mb-1">Client Expectations</h4>
                              <ul className="text-sm text-slate-700 leading-6 list-disc list-inside space-y-1">
                                {provider.expectations.map((exp, index) => (
                                  <li key={index}>{exp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      title: "Rituals Performed",
                      children: (
                        <div className="px-4 md:px-6 py-4 flex flex-wrap gap-2">
                          {/* TODO: Fetch rituals from provider_rituals table */}
                          <span className="text-sm text-slate-500">Rituals information will be available soon</span>
                        </div>
                      )
                    },
                    {
                      title: "Availability & Travel",
                      children: (
                        <div className="px-4 md:px-6 pt-5 pb-6 space-y-4">
                          <div>
                            <h4 className="text-slate-900 font-semibold tracking-tight mb-1">Availability</h4>
                            <p className="text-sm text-slate-700 leading-6">{provider.availability_notes || 'Availability information not provided.'}</p>
                          </div>
                          <div>
                            <h4 className="text-slate-900 font-semibold tracking-tight mb-1">Travel Radius</h4>
                            <p className="text-sm text-slate-700 leading-6">
                              {provider.service_radius_km 
                                ? `Willing to travel up to ${provider.service_radius_km} km${provider.travel_notes ? '. ' + provider.travel_notes : ''}`
                                : 'Travel preferences not specified.'}
                            </p>
                          </div>
                        </div>
                      )
                    },
                    {
                      title: "Photos",
                      children: (
                        <div className="px-4 md:px-6 py-4">
                          {provider.photo_url ? (
                            <div className="space-y-4">
                              <ProviderPhotoCard
                                photoUrl={provider.photo_url}
                                providerName={provider.name || 'Unknown Provider'}
                                className="w-full max-w-md mx-auto"
                              />
                              <p className="text-sm text-slate-600 text-center">
                                Photo of {provider.name || 'provider'}
                              </p>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-slate-500">
                              <div className="h-16 w-16 rounded-full bg-sandstone/10 flex items-center justify-center mx-auto mb-3">
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <p className="text-sm">No photos available</p>
                            </div>
                          )}
                        </div>
                      )
                    },
                    {
                      title: "Contact Information",
                      children: (
                        <div className="px-4 md:px-6 py-4 space-y-3">
                          {provider.phone ? (
                            <div className="flex items-center gap-3">
                              <Phone className="h-4 w-4 text-slate-600" />
                              <span className="text-sm">{provider.phone}</span>
                              <a href={getTelLink(provider.phone)} className="ml-auto text-xs text-saffron hover:underline">Call</a>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500">Phone number not available</div>
                          )}
                          {provider.email && (
                            <div className="flex items-center gap-3">
                              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">{provider.email}</span>
                            </div>
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              </div>

              {/* Related Providers - TODO: Implement related providers logic */}
              {/* <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Related Providers</h3>
                <div className="text-sm text-slate-500">Related providers will be shown here soon</div>
              </div> */}
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  {provider.phone ? (
                    <>
                      <a
                        href={getWhatsAppContextLink(provider.phone, provider.name || 'Unknown Provider', 'general')}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('whatsapp', 'general')}
                        className="w-full h-11 rounded-xl bg-saffron text-white hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                      <a
                        href={getTelLink(provider.phone)}
                        onClick={() => handleContactClick('phone')}
                        className="w-full h-11 rounded-xl border border-sandstone/30 hover:border-saffron/50 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call Now
                      </a>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Contact information not available</p>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              {provider.distance_km && (
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4">Location</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{provider.distance_km.toFixed(1)} km away</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
