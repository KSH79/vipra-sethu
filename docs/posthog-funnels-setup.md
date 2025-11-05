# PostHog Funnels Setup Guide

This document explains how to set up conversion funnels in PostHog to track the provider onboarding journey.

## Available Events

Our application tracks the following events for funnel analysis:

### Onboarding Funnel Events

1. **`onboarding_step`** - Tracks each step of the onboarding process

   - Properties: `step`, `stepNumber`, `totalSteps`
   - Step values: `started`, `identity_contact`, `role_rituals`, `photo_terms`, `completed`

2. **`onboarding_completed`** - Final conversion event

   - Properties: `provider_id`, `provider_name`, `category`, `conversion_timestamp`

3. **`admin_approval`** - Admin approval conversion

   - Properties: `provider_id`, `provider_name`, `admin_email`, `conversion_timestamp`

## Creating the Onboarding Funnel

### Step 1: Navigate to Funnels

1. Go to your PostHog dashboard
2. Click on "Funnels" in the left sidebar
3. Click "Create new funnel"

### Step 2: Configure Funnel Steps

**Step 1: Landing Page Visit**

- Event: `$pageview`
- Property: `path` equals `/onboard`
- Time window: 1 hour

**Step 2: Onboarding Started**

- Event: `onboarding_step`
- Property: `step` equals `started`
- Time window: 1 hour

**Step 3: Basic Info Completed**

- Event: `onboarding_step`
- Property: `step` equals `identity_contact`
- Time window: 1 hour

**Step 4: Role & Rituals Completed**

- Event: `onboarding_step`
- Property: `step` equals `role_rituals`
- Time window: 1 hour

**Step 5: Photo & Terms Completed**

- Event: `onboarding_step`
- Property: `step` equals `photo_terms`
- Time window: 1 hour

**Step 6: Submission Completed**

- Event: `onboarding_completed`
- Time window: 1 hour

**Step 7: Admin Approved**

- Event: `admin_approval`
- Time window: 7 days (to account for admin review time)

### Step 3: Funnel Settings

**Basic Settings:**

- Funnel name: "Provider Onboarding Funnel"
- Time to convert: "7 days"
- Funnel type: "Ordered" (steps must be completed in order)

**Advanced Settings:**

- Enter after: `onboarding_step` with step `started`
- Exit after: `admin_approval` or `admin_rejection`

## Additional Funnels to Create

### Contact Conversion Funnel

1. `$pageview` where path contains `/providers/`
2. `provider_viewed`
3. `contact_cta`

### Admin Review Funnel

1. `onboarding_completed`
2. `admin_approval` or `admin_rejection`

## Analyzing Funnel Data

### Key Metrics to Monitor

**Conversion Rates:**

- Step-to-step conversion rates
- Overall funnel conversion rate
- Time between steps

**Drop-off Analysis:**

- Where users abandon the onboarding process
- Common drop-off points
- Impact of required fields vs optional fields

**Segmentation:**

- By category (purohit vs cook vs other)
- By language preferences
- By device type (mobile vs desktop)

### Dashboard Recommendations

Create dashboards with:

1. **Funnel Conversion Chart** - Visual representation of drop-off
2. **Conversion Rate Trend** - Over time analysis
3. **Step Duration Analysis** - Time spent in each step
4. **Category Performance** - Conversion by provider category

## Troubleshooting

### Common Issues

**Events not appearing:**

- Check that PostHog is properly initialized
- Verify environment variables are set
- Check browser console for errors

**Incorrect funnel steps:**

- Ensure event properties match exactly
- Check time windows are appropriate
- Verify event ordering

**Missing data:**

- Check that all tracking calls are implemented
- Verify no JavaScript errors are blocking events
- Check network connectivity

## Best Practices

1. **Test Events**: Use the `/test-analytics` page to verify events are firing
2. **Monitor Regularly**: Check funnel performance weekly
3. **Optimize Based on Data**: Use drop-off insights to improve UX
4. **Document Changes**: Keep this guide updated with new events

## Next Steps

After setting up the basic funnel:

1. Create additional funnels for different user journeys
2. Set up alerts for significant conversion rate changes
3. A/B test onboarding improvements based on funnel data
4. Create custom properties for advanced segmentation
