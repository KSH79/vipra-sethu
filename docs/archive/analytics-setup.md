# Analytics Setup Guide

This document outlines the comprehensive analytics implementation for Vipra Sethu, including user behavior tracking, conversion monitoring, and error tracking.

## Overview

The analytics system consists of three main components:
- **PostHog** - User behavior tracking and funnel analysis
- **Vercel Analytics** - Core Web Vitals and performance metrics
- **Sentry** - Error tracking and performance monitoring

## Environment Variables

Add the following to your `.env.local` file:

```env
# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-api-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

## PostHog Event Tracking

### Page Views
Automatic page view tracking is implemented via the `usePageView` hook, which captures:
- Current path and URL parameters
- Page title and metadata
- Timestamp and user session data

### User Behavior Events

#### Search Events
```typescript
analytics.trackSearch(query, filters, resultCount)
```
Tracks:
- Search query text
- Applied filters (category, location, language, etc.)
- Number of results returned
- Search timestamp

#### Provider Views
```typescript
analytics.trackProviderView(providerId, providerName, source)
```
Tracks:
- Provider identification
- Source of view (search results, direct link, recommendation)
- View timestamp

#### Contact Attempts
```typescript
analytics.trackContactAttempt(providerId, providerName, contactMethod)
```
Tracks:
- Provider being contacted
- Contact method (WhatsApp, phone, email)
- Contact timestamp

### Conversion Events

#### Onboarding Funnel
```typescript
analytics.trackOnboardingStep(stepName, properties)
```
Tracks completion of each onboarding step:
- `identity_contact` - Basic information step
- `role_rituals` - Service details step
- `photo_terms` - Photo upload and terms acceptance
- `completed` - Full submission

#### Form Submissions
```typescript
analytics.trackFormSubmission(formName, success, properties)
```
Tracks:
- Form submission success/failure
- Error messages if failed
- Completion time
- Form-specific properties

#### Conversion Tracking
```typescript
analytics.trackConversion(eventName, value, properties)
```
Tracks key business conversions:
- `provider_onboarding_completed` - New provider signup
- `provider_contact_attempt` - Lead generation
- `search_performed` - User engagement

## Funnel Analysis

### Primary Funnels

1. **Provider Onboarding Funnel**
   - Landing on onboarding page
   - Step 1: Identity & Contact completion
   - Step 2: Role & Rituals completion
   - Step 3: Photo & Terms completion
   - Final submission

2. **User Engagement Funnel**
   - Homepage visit
   - Search performed
   - Provider profile viewed
   - Contact attempt made

3. **Lead Generation Funnel**
   - Provider search
   - Profile view
   - Contact click
   - WhatsApp/Phone call initiated

### Key Metrics to Monitor

#### User Acquisition
- Unique visitors by source
- Landing page performance
- Geographic distribution

#### User Engagement
- Search conversion rate
- Average session duration
- Pages per session
- Provider profile views per search

#### Lead Generation
- Contact attempt rate
- Provider response rate
- Lead-to-contact conversion
- Quality of leads (by category, location)

#### Business Metrics
- Provider onboarding completion rate
- Time from onboarding to first contact
- Provider retention rate
- User satisfaction scores

## Vercel Analytics Integration

Vercel Analytics provides:
- **Core Web Vitals** - LCP, FID, CLS metrics
- **Page Views** - Traffic and engagement data
- **Performance Insights** - Loading times and optimization opportunities

### Implementation
The `<Analytics />` component is automatically included in the root layout and requires no additional configuration.

## Sentry Error Tracking

Sentry monitors:
- **JavaScript Errors** - Frontend exceptions
- **API Errors** - Backend request failures
- **Performance Issues** - Slow loading and API calls
- **User Sessions** - Replay of user interactions leading to errors

### Configuration
- Client-side errors tracked via `sentry.client.config.ts`
- Server-side errors tracked via `sentry.server.config.ts`
- Edge runtime errors tracked via `sentry.edge.config.ts`

### Error Filtering
Network errors are filtered out to reduce noise. Add custom filtering in the `beforeSend` function as needed.

## Privacy and Compliance

### Data Collection
- No personal identifiable information (PII) is collected
- Phone numbers are masked in analytics events
- User IPs are anonymized by default
- Cookie consent is respected where applicable

### Data Retention
- PostHog data retained according to your plan settings
- Sentry errors retained for 30 days (free tier) or as configured
- Vercel Analytics data retained per Vercel's policies

## Implementation Checklist

### Setup
- [ ] Create PostHog project and obtain API key
- [ ] Create Sentry organization and project
- [ ] Add environment variables to `.env.local`
- [ ] Test analytics tracking in development

### Verification
- [ ] Confirm page views are tracked
- [ ] Test search event tracking
- [ ] Verify provider view tracking
- [ ] Test contact attempt tracking
- [ ] Confirm onboarding funnel tracking
- [ ] Verify error reporting to Sentry

### Production
- [ ] Deploy with analytics enabled
- [ ] Set up PostHog dashboards and funnels
- [ ] Configure Sentry alerts for critical errors
- [ ] Set up Vercel Analytics monitoring
- [ ] Establish regular analytics review process

## Dashboard Setup

### PostHog Dashboards
1. **User Engagement Dashboard**
   - Daily active users
   - Search metrics
   - Provider views
   - Contact attempts

2. **Conversion Dashboard**
   - Onboarding funnel
   - Lead generation metrics
   - Conversion rates by category

3. **Performance Dashboard**
   - Page load times
   - Search performance
   - Error rates

### Sentry Dashboards
1. **Error Overview**
   - Error frequency and distribution
   - Impact on user experience
   - Resolution status

2. **Performance Monitoring**
   - API response times
   - Database query performance
   - Frontend rendering issues

## Best Practices

1. **Event Naming**: Use consistent, descriptive event names
2. **Property Structure**: Maintain consistent property schemas
3. **Sampling**: Use appropriate sampling rates for performance data
4. **Filtering**: Filter out noise and irrelevant events
5. **Privacy**: Never collect sensitive user information
6. **Testing**: Verify tracking works in all environments

## Troubleshooting

### Common Issues
- Events not appearing: Check environment variables and network connectivity
- Missing page views: Ensure `usePageView` hook is used in all pages
- High error volume: Review Sentry filtering rules
- Performance impact: Adjust sampling rates and event frequency

### Debug Tools
- PostHog debug mode: Set `debug: true` in PostHog config
- Sentry test events: Use Sentry test integration
- Vercel Analytics: Check Vercel dashboard for data flow

## Future Enhancements

1. **Advanced Funnels**: Multi-step conversion paths
2. **Cohort Analysis**: User behavior over time
3. **A/B Testing**: Feature rollout and optimization
4. **Custom Events**: Business-specific tracking needs
5. **Integration**: CRM and marketing automation sync
