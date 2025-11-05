'use client'

import React from 'react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

export function PostHogAnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: false, // We'll manually capture pageviews
      capture_pageleave: true,
      debug: process.env.NODE_ENV === 'development',
    })
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

// Analytics event functions
export const analytics = {
  // Track page views
  pageview: (path: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture('$pageview', {
        $current_url: window.location.href,
        path,
        ...properties,
      })
    }
  },

  // Track user actions
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.capture(event, properties)
    }
  },

  // Track user identification
  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && posthog.__loaded) {
      posthog.identify(userId, properties)
    }
  },

  // Track search events
  trackSearch: (query: string, filters: Record<string, any>, resultCount: number) => {
    analytics.track('provider_search', {
      query,
      filters,
      result_count: resultCount,
      search_timestamp: new Date().toISOString(),
    })
  },

  // Track provider profile views
  trackProviderView: (providerId: string, providerName: string, source: string) => {
    analytics.track('provider_viewed', {
      provider_id: providerId,
      provider_name: providerName,
      source, // 'search_results', 'direct_link', 'recommendation'
      view_timestamp: new Date().toISOString(),
    })
  },

  // Track contact attempts
  trackContactAttempt: (providerId: string, providerName: string, contactMethod: string) => {
    analytics.track('provider_contact_attempt', {
      provider_id: providerId,
      provider_name: providerName,
      contact_method: contactMethod, // 'whatsapp', 'phone', 'email'
      contact_timestamp: new Date().toISOString(),
    })
  },

  // Track form submissions
  trackFormSubmission: (formName: string, success: boolean, properties?: Record<string, any>) => {
    analytics.track('form_submitted', {
      form_name: formName,
      success,
      submission_timestamp: new Date().toISOString(),
      ...properties,
    })
  },

  // Track conversion events
  trackConversion: (event: string, value?: number, properties?: Record<string, any>) => {
    analytics.track(event, {
      value,
      conversion_timestamp: new Date().toISOString(),
      ...properties,
    })
  },

  // Track specific conversion events
  trackOnboardingCompleted: (providerId: string, providerName: string, category: string) => {
    analytics.track('onboarding_completed', {
      provider_id: providerId,
      provider_name: providerName,
      category,
      conversion_timestamp: new Date().toISOString(),
    })
  },

  trackContactCTA: (providerId: string, providerName: string, contactMethod: 'whatsapp' | 'phone') => {
    analytics.track('contact_cta', {
      provider_id: providerId,
      provider_name: providerName,
      contact_method: contactMethod,
      conversion_timestamp: new Date().toISOString(),
    })
  },

  // Enhanced contact tracking with context
  trackContactClick: (
    providerId: string, 
    providerName: string, 
    contactMethod: 'whatsapp' | 'phone',
    context: 'search_results' | 'provider_detail' | 'provider_card' = 'provider_detail',
    messageContext?: 'general' | 'ritual' | 'consultation'
  ) => {
    analytics.track('contact_clicked', {
      provider_id: providerId,
      provider_name: providerName,
      contact_method: contactMethod,
      contact_context: context,
      message_context: messageContext,
      contact_timestamp: new Date().toISOString(),
    })
  },

  // Track successful contact (when WhatsApp/chat opens)
  trackContactSuccess: (
    providerId: string, 
    providerName: string, 
    contactMethod: 'whatsapp' | 'phone'
  ) => {
    analytics.track('contact_successful', {
      provider_id: providerId,
      provider_name: providerName,
      contact_method: contactMethod,
      success_timestamp: new Date().toISOString(),
    })
  },

  // Track contact conversion (user reports successful connection)
  trackContactConversion: (
    providerId: string, 
    providerName: string, 
    contactMethod: 'whatsapp' | 'phone',
    conversionValue?: number
  ) => {
    analytics.track('contact_conversion', {
      provider_id: providerId,
      provider_name: providerName,
      contact_method: contactMethod,
      conversion_value: conversionValue,
      conversion_timestamp: new Date().toISOString(),
    })
  },

  trackAdminApproval: (providerId: string, providerName: string, adminEmail: string) => {
    analytics.track('admin_approval', {
      provider_id: providerId,
      provider_name: providerName,
      admin_email: adminEmail,
      conversion_timestamp: new Date().toISOString(),
    })
  },

  trackAdminRejection: (providerId: string, providerName: string, adminEmail: string, reason: string) => {
    analytics.track('admin_rejection', {
      provider_id: providerId,
      provider_name: providerName,
      admin_email: adminEmail,
      rejection_reason: reason,
      conversion_timestamp: new Date().toISOString(),
    })
  },

  // Track onboarding funnel steps
  trackOnboardingStep: (step: string, properties?: Record<string, any>) => {
    analytics.track('onboarding_step', {
      step,
      step_timestamp: new Date().toISOString(),
      ...properties,
    })
  },

  // Track MFA events
  trackMFASetupStarted: (userId: string) => {
    analytics.track('mfa_setup_started', {
      user_id: userId,
      timestamp: new Date().toISOString(),
    })
  },

  trackMFASetupCompleted: (userId: string) => {
    analytics.track('mfa_setup_completed', {
      user_id: userId,
      timestamp: new Date().toISOString(),
    })
  },

  trackMFAVerificationStarted: (userId: string, factorId: string) => {
    analytics.track('mfa_verification_started', {
      user_id: userId,
      factor_id: factorId,
      timestamp: new Date().toISOString(),
    })
  },

  trackMFAVerificationCompleted: (userId: string, factorId: string) => {
    analytics.track('mfa_verification_completed', {
      user_id: userId,
      factor_id: factorId,
      timestamp: new Date().toISOString(),
    })
  },

  trackMFAVerificationFailed: (userId: string, factorId: string, error: string) => {
    analytics.track('mfa_verification_failed', {
      user_id: userId,
      factor_id: factorId,
      error,
      timestamp: new Date().toISOString(),
    })
  },

  // Track admin events
  trackAdminLogin: (userId: string, email: string) => {
    analytics.track('admin_login', {
      user_id: userId,
      email,
      timestamp: new Date().toISOString(),
    })
  },

  trackAdminAction: (userId: string, action: string, properties?: Record<string, any>) => {
    analytics.track('admin_action', {
      user_id: userId,
      action,
      timestamp: new Date().toISOString(),
      ...properties,
    })
  },

  // Track search performance
  trackSearchPerformance: (query: string, resultCount: number, searchTime: number) => {
    analytics.track('search_performance', {
      query,
      result_count: resultCount,
      search_time_ms: searchTime,
      timestamp: new Date().toISOString(),
    })
  },

  // Track user engagement
  trackUserEngagement: (userId: string, action: string, properties?: Record<string, any>) => {
    analytics.track('user_engagement', {
      user_id: userId,
      action,
      timestamp: new Date().toISOString(),
      ...properties,
    })
  },

  // Track feature usage
  trackFeatureUsed: (feature: string, properties?: Record<string, any>) => {
    analytics.track('feature_used', {
      feature,
      timestamp: new Date().toISOString(),
      ...properties,
    })
  },
}
