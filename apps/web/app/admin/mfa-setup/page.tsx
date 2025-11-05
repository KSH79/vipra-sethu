'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { MFASetup } from '@/components/auth/MFASetup';
import { checkMFAStatus, shouldRequireMFA } from '@/lib/auth/mfa';
import { createClient } from '@/lib/supabaseClient';
import { analytics } from '@/lib/analytics';

function MFASetupContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [canSetup, setCanSetup] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login');
          return;
        }

        // Check if user should have MFA (admin user)
        const shouldHaveMFA = await shouldRequireMFA();
        
        if (!shouldHaveMFA) {
          setError('You are not authorized to set up MFA');
          return;
        }

        // Check current MFA status
        const { needsMFA, currentLevel, nextLevel } = await checkMFAStatus();
        
        if (currentLevel === 'aal2' && nextLevel === 'aal2') {
          // User already has MFA set up and verified
          router.push('/admin');
          return;
        }

        setCanSetup(true);
        
        // Track MFA setup start
        analytics.track('mfa_setup_started', {
          user_id: session.user.id,
          current_level: currentLevel,
          next_level: nextLevel,
        });

      } catch (err) {
        console.error('Error checking MFA eligibility:', err);
        setError('Failed to check eligibility for MFA setup');
      } finally {
        setLoading(false);
      }
    };

    checkEligibility();
  }, [supabase, router]);

  const handleSetupComplete = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Track successful MFA setup
        analytics.track('mfa_setup_completed', {
          user_id: session.user.id,
        });
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Error after MFA setup:', err);
      setError('MFA setup completed, but failed to redirect. Please try refreshing the page.');
    }
  };

  const handleCancel = () => {
    // Track cancelled MFA setup
    analytics.track('mfa_setup_cancelled');
    
    // Redirect to admin dashboard (MFA is optional for now)
    router.push('/admin');
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Setup Error</h2>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/admin')}
              className="w-full px-4 py-2 bg-saffron text-white rounded-lg hover:bg-saffron-600 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!canSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg border border-gray-200">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">MFA Setup</h2>
            <p className="text-sm text-gray-600 mb-4">
              Checking eligibility for MFA setup...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <MFASetup
        onSetupComplete={handleSetupComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function MFASetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
      </div>
    }>
      <MFASetupContent />
    </Suspense>
  );
}
