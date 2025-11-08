import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format phone number for display
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

/**
 * Generate WhatsApp deep link with international support
 */
export function getWhatsAppLink(phone: string | undefined, message?: string): string {
  if (!phone) return '#';
  
  // Clean phone number and handle international format
  const cleaned = phone.replace(/\D/g, "");
  
  // If number starts with country code, use it as-is
  // If it's 10 digits (Indian), add +91
  // If it starts with 0, remove the 0 and add country code
  let internationalNumber: string;
  
  if (cleaned.length > 10) {
    // Already has country code or is international
    internationalNumber = cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
  } else if (cleaned.length === 10) {
    // Indian number without country code
    internationalNumber = `91${cleaned}`;
  } else {
    // Fallback to original
    internationalNumber = cleaned;
  }
  
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${internationalNumber}${encodedMessage}`;
}

/**
 * Generate tel link with international format
 */
export function getTelLink(phone: string | undefined): string {
  if (!phone) return '#';
  
  const cleaned = phone.replace(/\D/g, "");
  
  // Handle international format
  if (cleaned.length > 10) {
    // Already has country code
    return `tel:+${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}`;
  } else if (cleaned.length === 10) {
    // Indian number
    return `tel:+91${cleaned}`;
  }
  
  // Fallback
  return `tel:+${cleaned}`;
}

/**
 * Generate message templates for different contact scenarios
 */
export function generateWhatsAppMessage(
  providerName: string,
  context: 'general' | 'ritual' | 'consultation' = 'general',
  userLocation?: string
): string {
  const baseUrl = 'Hello! I found your profile on Vipra Sethu.';
  
  switch (context) {
    case 'ritual':
      return `${baseUrl} I would like to inquire about your services for an upcoming ritual. Could you please share more details about your availability and process?${
        userLocation ? ` I am located in ${userLocation}.` : ''
      }`;
    
    case 'consultation':
      return `${baseUrl} I would like to schedule a consultation with you. When would be a good time to connect?${
        userLocation ? ` I am located in ${userLocation}.` : ''
      }`;
    
    default:
      return `${baseUrl} I am interested in your services. Could you please provide more information?${
        userLocation ? ` I am located in ${userLocation}.` : ''
      }`;
  }
}

/**
 * Generate context-aware WhatsApp link
 */
export function getWhatsAppContextLink(
  phone: string | undefined,
  providerName: string,
  context: 'general' | 'ritual' | 'consultation' = 'general',
  userLocation?: string
): string {
  const message = generateWhatsAppMessage(providerName, context, userLocation);
  return getWhatsAppLink(phone, message);
}
