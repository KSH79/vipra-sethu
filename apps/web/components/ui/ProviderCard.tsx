import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { getWhatsAppLink, getTelLink } from "@/lib/utils";
import { MessageCircle, Phone, Eye } from "lucide-react";

export interface Provider {
  id: string;
  name: string;
  category: string;
  languages: string[];
  sampradaya?: string;
  verified?: boolean;
  yearsExperience?: number;
  distance?: number;
  phone?: string;
  avatar?: string;
  responseTime?: string;
}

export interface ProviderCardProps {
  provider: Provider;
  className?: string;
}

/**
 * Provider card component for search results
 */
export function ProviderCard({ provider, className }: ProviderCardProps) {
  const router = useRouter();
  const {
    id,
    name,
    category,
    languages,
    sampradaya,
    verified,
    yearsExperience,
    distance,
    phone,
    avatar,
    responseTime
  } = provider;

  return (
    <article
      onClick={() => router.push(`/providers/${id}`)}
      className={cn(
      "group bg-white rounded-2xl shadow-soft border border-gray-100 p-5 flex flex-col gap-4 min-h-[240px]",
      "hover:shadow-xl hover:-translate-y-1 hover:border-saffron-200",
      "transition-all duration-300 cursor-pointer",
      className
    )}
      role="button"
      tabIndex={0}
      aria-label={`View profile for ${name}`}
    >
      {/* Header with avatar and info */}
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl object-cover bg-ivory flex items-center justify-center overflow-hidden
                        group-hover:scale-105 transition-transform duration-300 shadow-sm">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-saffron-100 to-saffron-50 flex items-center justify-center">
              <span className="text-saffron-600 font-bold text-xl">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate text-base group-hover:text-saffron-700 
                         transition-colors duration-200">{name}</h3>
          <p className="text-sm text-slate-600 font-medium">
            {category}
            {yearsExperience && ` • ${yearsExperience} yrs`}
          </p>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-2">
        {verified && (
          <Badge variant="verified" className="text-xs font-medium">Verified</Badge>
        )}
        {sampradaya && (
          <Badge variant="saffron" className="text-xs font-medium">{sampradaya}</Badge>
        )}
      </div>

      {/* Languages + Distance row (consistent layout) */}
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {languages.length > 0 && (
            <span className="block truncate text-sm text-slate-600 font-medium px-2 py-1 bg-gray-50 rounded-lg">
              {languages.slice(0, 3).join(" · ")}
              {languages.length > 3 && ` +${languages.length - 3}`}
            </span>
          )}
        </div>
        {typeof distance === 'number' && (
          <span className="shrink-0 text-sm text-slate-500 font-medium bg-gray-50 px-2 py-1 rounded-lg">
            {distance.toFixed(1)} km
          </span>
        )}
      </div>

      {/* Response time */}
      {responseTime && (
        <div className="flex items-center gap-1 text-sm text-slate-600 bg-green-50 px-3 py-2 rounded-lg w-fit">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          Responds in ~{responseTime}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-2 mt-auto">
        {phone && (
          <a
            href={getWhatsAppLink(phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-saffron text-white text-sm font-medium
                     hover:bg-saffron-600 hover:shadow-lg hover:-translate-y-0.5
                     transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        )}
        {phone && (
          <a
            href={getTelLink(phone)}
            onClick={(e) => e.stopPropagation()}
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
