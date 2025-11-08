"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ProviderPhoto, ProviderPhotoCard } from "@/components/ui/ProviderPhoto";
import { getWhatsAppLink, getTelLink, getWhatsAppContextLink } from "@/lib/utils";
import { getProviderDetails } from "@/lib/services/taxonomy";
import { ProviderWithTaxonomy } from "@/lib/types/taxonomy";
import { MessageCircle, Phone, Share2, MapPin, Languages, Clock, Star, Loader2 } from "lucide-react";
// Temporarily disabled to fix blank page issue
// import { PageViewTracker } from "@/hooks/usePageView";
// import { analytics } from "@/lib/analytics";

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
        
        // Analytics tracking temporarily disabled
        // const source = searchParams?.get('source') || 'direct_link';
        // analytics.trackProviderView(providerId, data?.name || 'Unknown Provider', source);
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
    
    // Analytics tracking temporarily disabled
    // analytics.trackContactClick(providerId, provider.name || 'Unknown Provider', contactMethod, 'provider_detail', messageContext);
    // analytics.trackContactAttempt(providerId, provider.name || 'Unknown Provider', contactMethod);
    
    console.log('Contact clicked:', contactMethod, messageContext);
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
      {/* PageViewTracker temporarily disabled */}
      {/* Sticky Action Bar - Modern Clean Design */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-xl">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <nav className="text-sm text-slate-500 hidden md:block">
              <Link href="/providers" className="hover:text-slate-900 transition-colors">Providers</Link>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900 font-medium">{provider.name || 'Unknown Provider'}</span>
            </nav>
            <div className="flex gap-3">
              {provider.phone && (
                <>
                  <a
                    href={getWhatsAppContextLink(provider.phone, provider.name || 'Unknown Provider', 'general')}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleContactClick('whatsapp', 'general')}
                    className="px-5 py-2.5 rounded-full bg-saffron-600 text-white text-sm font-medium hover:bg-saffron-700 transition-all inline-flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                  <a
                    href={getTelLink(provider.phone)}
                    onClick={() => handleContactClick('phone')}
                    className="px-5 py-2.5 rounded-full bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all inline-flex items-center gap-2 shadow-sm hover:shadow-md"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                </>
              )}
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full text-slate-600 hover:bg-slate-100 transition-all"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="section-padding">
        <div className="container-custom max-w-7xl">
          {/* Two-column layout - Better proportions */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* Main column - Centered and wider */}
            <div className="space-y-8 max-w-3xl mx-auto lg:mx-0 w-full">
              {/* Provider Header - Modern Clean Design */}
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  <ProviderPhoto
                    photoUrl={provider.photo_url}
                    providerName={provider.name || 'Unknown Provider'}
                    size="lg"
                    priority
                  />
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
                        {provider.name || 'Unknown Provider'}
                      </h1>
                      <p className="text-lg text-slate-600">{provider.category_name || 'Service Provider'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {provider.status === 'approved' && (
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Verified
                        </span>
                      )}
                      {provider.sampradaya_name && (
                        <span className="px-3 py-1 rounded-full bg-saffron-50 text-saffron-700 text-sm font-medium">
                          {provider.sampradaya_name}
                        </span>
                      )}
                      {provider.experience_years && (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {provider.experience_years} years
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Location</p>
                          <p className="text-sm">{provider.location_text || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Languages className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Languages</p>
                          <p className="text-sm">{provider.languages?.join(", ") || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section - No Accordion, Always Visible */}
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">About</h2>
                <div className="space-y-6">
                  <p className="text-base leading-relaxed text-slate-700">
                    {provider.about || 'No description available.'}
                  </p>
                  {provider.expectations && provider.expectations.length > 0 && (
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                        What to Expect
                      </h3>
                      <ul className="space-y-3">
                        {provider.expectations.map((exp, index) => (
                          <li key={index} className="flex items-start gap-3 text-slate-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                            <span className="text-sm leading-relaxed">{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Service Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-saffron-100 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-saffron-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Service Area</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {provider.service_radius_km 
                        ? `Available within ${provider.service_radius_km} km${provider.travel_notes ? '. ' + provider.travel_notes : ''}`
                        : 'Please contact for availability'}
                    </p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-slate-900">Response Time</h3>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Typically responds within {provider.response_time_hours || 2} hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Rituals & Services - Simplified */}
              <div className="bg-gradient-to-br from-saffron-50 to-orange-50 rounded-3xl p-8">
                <div className="text-center max-w-md mx-auto">
                  <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="text-3xl">🕉️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Rituals & Services</h2>
                  <p className="text-slate-600 mb-6">
                    Contact {provider.name?.split(' ')[0]} to discuss specific rituals and ceremonies
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-4 py-2 bg-white text-slate-700 rounded-full text-sm font-medium shadow-sm">Traditional Ceremonies</span>
                    <span className="px-4 py-2 bg-white text-slate-700 rounded-full text-sm font-medium shadow-sm">Puja Services</span>
                    <span className="px-4 py-2 bg-white text-slate-700 rounded-full text-sm font-medium shadow-sm">Custom Rituals</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right sidebar - Subtle Contact Card */}
            <div className="lg:sticky lg:top-28 space-y-6 h-fit">
              {/* Contact Card - Subtle White Design */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Contact</h3>
                <div className="space-y-3">
                  {provider.phone ? (
                    <>
                      <a
                        href={getWhatsAppContextLink(provider.phone, provider.name || 'Unknown Provider', 'general')}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleContactClick('whatsapp', 'general')}
                        className="w-full py-3 rounded-full bg-saffron-600 text-white font-medium hover:bg-saffron-700 transition-all inline-flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                      <a
                        href={getTelLink(provider.phone)}
                        onClick={() => handleContactClick('phone')}
                        className="w-full py-3 rounded-full bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-all inline-flex items-center justify-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    </>
                  ) : (
                    <p className="text-slate-500 text-sm">Contact information not available</p>
                  )}
                </div>
                
                {/* Quick Info */}
                <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                  {provider.response_time_hours && (
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Responds in ~{provider.response_time_hours} hours</span>
                    </div>
                  )}
                  {provider.distance_km && (
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.distance_km.toFixed(1)} km away</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA - Simplified */}
      <section className="bg-white mt-16">
        <div className="container-custom py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Looking for more providers?
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Explore our directory of verified professionals
            </p>
            <Link 
              href="/providers"
              className="inline-flex items-center gap-2 px-8 py-4 bg-saffron-600 text-white font-medium rounded-full hover:bg-saffron-700 transition-all shadow-lg hover:shadow-xl"
            >
              Browse All Providers
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
