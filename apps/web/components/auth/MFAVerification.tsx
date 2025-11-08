'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

interface MFAVerificationProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
  factorId: string;
}

export function MFAVerification({ 
  onVerificationComplete, 
  onCancel, 
  factorId 
}: MFAVerificationProps) {
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const supabase = createClient();

  const onVerifyClicked = async () => {
    if (!verifyCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verifyCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setError(challenge.error.message);
        return;
      }

      const challengeId = challenge.data.id;

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: verifyCode,
      });
      
      if (verify.error) {
        setAttempts(prev => prev + 1);
        setError(verify.error.message);
        return;
      }

      onVerificationComplete();
    } catch (err) {
      setAttempts(prev => prev + 1);
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerifyCode(value);
    if (error) setError('');
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-saffron-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-saffron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 mt-2">
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
          {attempts >= 3 && (
            <p className="text-xs text-red-500 mt-1">
              Multiple failed attempts. Please check your authenticator app.
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {/* Code Input */}
        <div>
          <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 mb-2">
            Authentication Code
          </label>
          <input
            id="mfa-code"
            type="text"
            value={verifyCode}
            onChange={handleCodeChange}
            placeholder="000000"
            maxLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-saffron text-center text-lg font-mono tracking-widest"
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onVerifyClicked}
            disabled={loading || verifyCode.length !== 6}
            className="flex-1"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Open your authenticator app to get the code
          </p>
        </div>
      </div>
    </div>
  );
}
