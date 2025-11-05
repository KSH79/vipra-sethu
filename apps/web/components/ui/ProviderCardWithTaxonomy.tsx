import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ProviderPhoto } from "./ProviderPhoto";
import { getWhatsAppLink, getTelLink, getWhatsAppContextLink } from "@/lib/utils";
import { MessageCircle, Phone, Eye } from "lucide-react";
import { ProviderWithTaxonomy } from "@/lib/types/taxonomy";
import { analytics } from "@/lib/analytics";

export interface ProviderCardProps {
  provider: ProviderWithTaxonomy;
  className?: string;
}

/**
 * Enhanced Provider card component with taxonomy display
 * Shows category and sampradaya names with their codes
 */
export function ProviderCardWithTaxonomy({ provider, className }: ProviderCardProps) {
  const router = useRouter();
  const {
    id,
    name,
    category_name,
    category_code,
    sampradaya_name,
    sampradaya_code,
    languages,
    experience_years,
    response_time_hours,
    phone,
    about,
    status,
    photo_url,
  } = provider;

  const isApproved = status === 'approved';
  const responseTimeText = response_time_hours 
    ? `~${response_time_hours}h` 
    : undefined;

  const handleContactClick = (contactMethod: 'whatsapp' | 'phone') => {
    // Track contact CTA with enhanced analytics
    analytics.trackContactClick(
      id,
      name || 'Unknown Provider',
      contactMethod,
      'provider_card'
    );
    
    // Also track the existing contact attempt for backward compatibility
    analytics.trackContactAttempt(
      id,
      name || 'Unknown Provider',
      contactMethod
    );
  };

  return (
    <article
      onClick={() => router.push(`/providers/${id}`)}
      className={cn(
        "group bg-white rounded-2xl shadow-soft border border-gray-100 p-5 flex flex-col gap-4 min-h-[240px]",
        "hover:shadow-xl hover:-translate-y-1 hover:border-saffron-200",
        "transition-all duration-300 cursor-pointer",
        !isApproved && "opacity-75",
        className
      )}
      role="button"
      tabIndex={0}
      aria-label={`View profile for ${name}`}
    >
      {/* Header with avatar and info */}
      <div className="flex items-center gap-4">
        <ProviderPhoto
          photoUrl={photo_url}
          providerName={name}
          size="md"
          className="group-hover:scale-105 transition-transform duration-300 shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate text-base group-hover:text-saffron-700 
                         transition-colors duration-200">{name}</h3>
          <p className="text-sm text-slate-600 font-medium">
            {category_name || category_code || 'Unknown Category'}
            {experience_years && ` • ${experience_years} yrs`}
          </p>
        </div>
      </div>

      {/* Status and Taxonomy Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {isApproved ? (
          <Badge variant="verified" className="text-xs font-medium">Approved</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs font-medium">
            {status === 'pending' ? 'Pending' : status}
          </Badge>
        )}
        
        {/* Category Badge */}
        {category_code && (
          <Badge variant="saffron" className="text-xs font-medium">
            {category_name || category_code}
            {category_name && category_code && (
              <span className="ml-1 opacity-70">({category_code})</span>
            )}
          </Badge>
        )}
        
        {/* Sampradaya Badge */}
        {sampradaya_code && (
          <Badge variant="outline" className="text-xs font-medium border-saffron-200 text-saffron-700">
            {sampradaya_name || sampradaya_code}
            {sampradaya_name && sampradaya_code && (
              <span className="ml-1 opacity-70">({sampradaya_code})</span>
            )}
          </Badge>
        )}
      </div>

      {/* About/Description */}
      {about && (
        <p className="text-sm text-slate-600 line-clamp-2">
          {about}
        </p>
      )}

      {/* Languages */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {languages && languages.length > 0 && (
            <span className="block truncate text-sm text-slate-600 font-medium px-2 py-1 bg-gray-50 rounded-lg">
              🌐 {languages.slice(0, 3).join(" · ")}
              {languages.length > 3 && ` +${languages.length - 3}`}
            </span>
          )}
        </div>
      </div>

      {/* Response time */}
      {responseTimeText && isApproved && (
        <div className="flex items-center gap-1 text-sm text-slate-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          Responds in {responseTimeText}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 mt-auto">
        {phone && isApproved && (
          <a
            href={getWhatsAppContextLink(phone, name || 'Unknown Provider', 'general')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-saffron text-white text-sm font-medium
                     hover:bg-saffron-600 hover:shadow-lg hover:-translate-y-0.5
                     transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleContactClick('whatsapp');
            }}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        {phone && isApproved && (
          <a
            href={getTelLink(phone)}
            onClick={(e) => {
              e.stopPropagation();
              handleContactClick('phone');
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-gray-200 text-sm font-medium
                     hover:border-saffron-300 hover:bg-saffron-50 hover:text-saffron-700 hover:shadow-md
                     transition-all duration-200"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        )}
        <a
          href={`/providers/${id}`}
          onClick={(e) => e.stopPropagation()}
          className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-sm font-medium text-saffron-600
                   hover:bg-saffron-50 hover:text-saffron-700 hover:shadow-md
                   transition-all duration-200"
        >
          <Eye className="h-4 w-4" />
          View
        </a>
      </div>
    </article>
  );
}
