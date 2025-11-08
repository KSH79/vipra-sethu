"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import * as Sentry from "@sentry/nextjs";

export default function TestSentry() {
  const [testCount, setTestCount] = useState(0);

  const throwClientError = () => {
    try {
      throw new Error("Test client error from Sentry test page");
    } catch (error) {
      Sentry.captureException(error);
      setTestCount(prev => prev + 1);
    }
  };

  const throwServerError = async () => {
    try {
      const response = await fetch('/api/test-sentry-error', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Server error test failed');
      }
      
      setTestCount(prev => prev + 1);
    } catch (error) {
      Sentry.captureException(error);
      setTestCount(prev => prev + 1);
    }
  };

  const captureMessage = () => {
    Sentry.captureMessage("Test message from Sentry test page", "info");
    setTestCount(prev => prev + 1);
  };

  const captureUserFeedback = () => {
    Sentry.setUser({ id: "test-user-123", email: "test@example.com" });
    Sentry.captureException(new Error("Test error with user context"));
    Sentry.setUser(null); // Clear user context
    setTestCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-ivory py-8">
      <div className="container-custom max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Sentry Error Testing
          </h1>
          <p className="text-slate-600">
            Test Sentry error capture (check Sentry dashboard for events)
          </p>
        </div>

        <Card className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-600">
              Errors sent this session: <span className="font-bold text-red-600">{testCount}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={throwClientError} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Throw Client Error
            </Button>
            <Button onClick={throwServerError} className="w-full bg-red-600 hover:bg-red-700 text-white">
              Throw Server Error
            </Button>
            <Button onClick={captureMessage} className="w-full" variant="outline">
              Capture Message
            </Button>
            <Button onClick={captureUserFeedback} className="w-full" variant="outline">
              Capture with User Context
            </Button>
          </div>

          <div className="mt-6 p-4 bg-red-5 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">How to verify:</h3>
            <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
              <li>Open your Sentry dashboard</li>
              <li>Go to the "Issues" tab</li>
              <li>Look for errors with titles like "Test client error"</li>
              <li>Click the buttons above to generate test errors</li>
              <li>Check that error details include stack traces and context</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-amber-5 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">Environment Setup:</h3>
            <p className="text-sm text-slate-700">
              Make sure <code className="bg-slate-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SENTRY_DSN</code> is set in your environment variables.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
