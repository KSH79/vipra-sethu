import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function POST() {
  try {
    // Test different types of server errors
    const errorTypes = [
      'Database connection failed',
      'Invalid provider data',
      'File upload exceeded size limit',
      'Supabase service unavailable'
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    // Add context to the error
    Sentry.withScope((scope) => {
      scope.setTag('api_route', 'test-sentry-error');
      scope.setTag('error_type', 'test_server_error');
      scope.setExtra('error_details', {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        environment: process.env.NODE_ENV,
      });
      
      throw new Error(`Test server error: ${randomError}`);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: 'Test error captured and sent to Sentry' },
      { status: 500 }
    );
  }
}
