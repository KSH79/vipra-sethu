'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MFASetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
}

export function MFASetup({ onSetupComplete, onCancel }: MFASetupProps) {
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState(''); // holds the QR code image SVG
  const [secret, setSecret] = useState(''); // holds the secret as text
  const [verifyCode, setVerifyCode] = useState(''); // contains the code entered by the user
  const [error, setError] = useState(''); // holds an error message
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll');

  const supabase = createClient();

  const onEnableClicked = async () => {
    if (!verifyCode.trim()) {
      setError('Please enter the verification code');
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
        setError(verify.error.message);
        return;
      }

      onSetupComplete();
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const enrollMFA = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
        });
        
        if (error) {
          setError(error.message);
          return;
        }

        setFactorId(data.id);
        
        // Type guard to ensure we have TOTP data
        if (data.type === 'totp' && 'totp' in data) {
          setQr(data.totp.qr_code);
          setSecret(data.totp.secret);
        } else {
          setError('Expected TOTP factor but received different type');
          return;
        }
      } catch (err) {
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    enrollMFA();
  }, [supabase]);

  if (loading && step === 'enroll') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saffron"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Set Up Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 mt-2">
          Scan the QR code with your authenticator app
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {step === 'enroll' && qr ? (
        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <img 
                src={qr} 
                alt="QR Code for MFA Setup" 
                className="w-48 h-48"
              />
            </div>
          </div>

          {/* Secret Key */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Can't scan? Copy this secret key:
            </p>
            <div className="inline-flex items-center gap-2 p-2 bg-gray-50 rounded-md">
              <code className="text-xs font-mono text-gray-800 break-all max-w-xs">
                {secret}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(secret)}
                className="text-xs text-saffron hover:text-saffron-700"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>1. Open your authenticator app (Google Authenticator, 1Password, etc.)</p>
            <p>2. Scan the QR code or enter the secret key manually</p>
            <p>3. Enter the 6-digit code below</p>
          </div>

          {/* Verification Code Input */}
          <div>
            <label htmlFor="verify-code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              id="verify-code"
              type="text"
              maxLength={6}
              pattern="[0-9]{6}"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saffron focus:border-saffron text-center text-lg font-mono"
            />
          </div>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <Button
          onClick={onEnableClicked}
          disabled={loading || verifyCode.length !== 6}
          className="flex-1"
        >
          {loading ? 'Verifying...' : 'Enable MFA'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>

      {/* Security Notice */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Security Note:</strong> Save backup codes in a secure location. 
          You'll need them if you lose access to your authenticator app.
        </p>
      </div>
    </div>
  );
}
