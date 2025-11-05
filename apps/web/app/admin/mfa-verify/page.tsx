'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MFAVerification } from '@/components/auth/MFAVerification';
import { checkMFAStatus, getTOTPFactor } from '@/lib/auth/mfa';
import { createClient } from '@/lib/supabaseClient';
import { analytics } from '@/lib/analytics';

function MFAVerifyContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [factorId, setFactorId] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTo = searchParams.get('redirectTo') || '/admin';

  const supabase = createClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Check MFA status
        const { needsMFA, currentLevel, nextLevel } = await checkMFAStatus();
        
        if (!needsMFA) {
          // User doesn't need MFA, redirect to intended destination
          router.push(redirectTo);
          return;
        }

        // Get the TOTP factor
        const factor = await getTOTPFactor();
        
        if (!factor) {
          setError('No MFA factor found. Please set up two-factor authentication first.');
          return;
        }

        setFactorId(factor.id);
        
        // Track MFA verification attempt
        analytics.track('mfa_verification_started', {
          user_id: session.user.id,
          factor_id: factor.id,
          redirect_to: redirectTo,
        });

      } catch (err) {
        console.error('Error checking MFA status:', err);
        setError('Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [supabase, router, redirectTo]);

  const handleVerificationComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Track successful MFA verification
        analytics.track('mfa_verification_completed', {
          user_id: session.user.id,
          factor_id: factorId,
        });
      }

      // Redirect to intended destination
      router.push(redirectTo);
    } catch (err) {
      console.error('Error after MFA verification:', err);
      setError('Verification completed, but failed to redirect. Please try refreshing the page.');
    }
  };

  const handleCancel = () => {
    // Track cancelled MFA verification
    analytics.track('mfa_verification_cancelled', {
      factor_id: factorId,
    });
    
    // Redirect to login page
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full px-4 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-600 transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <MFAVerification
        onVerificationComplete={handleVerificationComplete}
        onCancel={handleCancel}
        factorId={factorId}
      />
    </div>
  );
}

export default function MFAVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
      </div>
    }>
      <MFAVerifyContent />
    </Suspense>
  );
}
