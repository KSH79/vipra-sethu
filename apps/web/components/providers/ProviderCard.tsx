"use client";

import Link from "next/link";
import { CheckCircle2, MapPin, MessageCircle, Star, BadgeCheck } from "lucide-react";
import { getAvailabilityColor, formatExperience, getInitials, truncateText } from "@/lib/providers/utils";

export type ProviderCardProps = {
  id: string;
  name: string;
  about?: string | null;
  photo_thumbnail_url?: string | null;
  photo_url?: string | null;
  category_name?: string | null;
  service_type?: "purohit" | "cook" | "both";
  languages?: string[];
  experience_years?: number | null;
  location?: string | null;
  is_approved?: boolean;
  availability_status?: "available" | "busy" | "unavailable" | null;
  rating?: number | null;
  review_count?: number | null;
  href?: string; // override link
};

export function ProviderCard(props: ProviderCardProps) {
  const {
    id,
    name,
    about,
    photo_thumbnail_url,
    photo_url,
    category_name,
    service_type,
    languages = [],
    experience_years,
    location,
    is_approved,
    availability_status,
    rating,
    review_count,
    href,
  } = props;

  const link = href || `/providers/${id}`;
  const availabilityClass = getAvailabilityColor(availability_status || undefined);
  const serviceLabel = category_name || service_type || "Service";

  // Photo selection algorithm (aligned with Drawer)
  const displayPhoto = photo_thumbnail_url || photo_url || null;

  return (
    <Link
      href={link}
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-saffron-500"
      aria-label={`View details for ${name}`}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-gray-200">
          {displayPhoto ? (
            <img src={displayPhoto} alt={name} className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-700 text-lg font-semibold">
              {getInitials(name)}
            </div>
          )}
          {is_approved && (
            <div className="absolute -right-1 -top-1 rounded-full bg-green-600 p-1 text-white shadow">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="max-w-full truncate text-base font-semibold text-slate-900 group-hover:text-saffron-700">{name}</h3>
            {typeof rating === "number" && (
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                {rating.toFixed(1)}{typeof review_count === "number" && <span className="text-[10px] text-amber-700/80">({review_count})</span>}
              </div>
            )}
          </div>

          {/* Service type */}
          <div className="mt-0.5">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 ring-1 ring-slate-200">
              {serviceLabel}
            </span>
          </div>

          {/* About */}
          {about && (
            <p className="mt-2 line-clamp-2 text-sm leading-snug text-slate-600">{truncateText(about, 140)}</p>
          )}

          {/* Meta row (always render with placeholders for visual consistency) */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" aria-hidden="true" />
              {location || <span className="text-slate-400">—</span>}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" aria-hidden="true" />
              {languages?.length ? (
                <>{languages.slice(0,3).join(", ")}{languages.length>3?"…":""}</>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              {typeof experience_years === "number" ? (
                formatExperience(experience_years)
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </span>
          </div>

          {/* Footer row */}
          <div className="mt-4 flex items-center justify-between">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${availabilityClass}`}>
              {availability_status ? availability_status : "availability"}
            </span>
            <span className="text-lg font-medium text-saffron-700 group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
            <span className="sr-only">View details</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProviderCard;
