"use client";

import { useState } from "react";
import { analytics } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TestAnalytics() {
  const [eventCount, setEventCount] = useState(0);

  const testSearchEvent = () => {
    analytics.trackSearch("test query", { category_code: "purohit" }, 5);
    setEventCount(prev => prev + 1);
  };

  const testProviderViewEvent = () => {
    analytics.trackProviderView("test-provider-123", "Test Provider", "search_results");
    setEventCount(prev => prev + 1);
  };

  const testContactEvent = () => {
    analytics.trackContactAttempt("test-provider-123", "Test Provider", "whatsapp");
    setEventCount(prev => prev + 1);
  };

  const testCustomEvent = () => {
    analytics.track("test_custom_event", { 
      test_property: "test_value",
      timestamp: new Date().toISOString()
    });
    setEventCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-ivory py-8">
      <div className="container-custom max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Analytics Testing
          </h1>
          <p className="text-slate-600">
            Test PostHog event tracking (check PostHog dashboard for events)
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600">
              Events sent this session: <span className="font-bold text-saffron">{eventCount}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={testSearchEvent} className="w-full">
              Test Search Event
            </Button>
            <Button onClick={testProviderViewEvent} className="w-full">
              Test Provider View Event
            </Button>
            <Button onClick={testContactEvent} className="w-full">
              Test Contact Event
            </Button>
            <Button onClick={testCustomEvent} className="w-full" variant="outline">
              Test Custom Event
            </Button>
          </div>

          <div className="mt-6 p-4 bg-saffron/5 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">How to verify:</h3>
            <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
              <li>Open your PostHog dashboard</li>
              <li>Go to the "Events" tab</li>
              <li>Look for events with names like "provider_search", "provider_viewed", "provider_contact_attempt"</li>
              <li>Click the buttons above to generate test events</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
