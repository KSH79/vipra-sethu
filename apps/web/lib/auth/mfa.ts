import { createClient } from '@/lib/supabaseClient';
import { AuthMFAEnrollResponse, AuthMFAChallengeResponse, AuthMFAVerifyResponse } from '@supabase/supabase-js';

const supabase = createClient();

/**
 * Check if user has MFA enrolled and needs verification
 */
export async function checkMFAStatus() {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (error) {
      console.error('Error checking MFA status:', error);
      return { needsMFA: false, error };
    }

    const needsMFA = data.currentLevel === 'aal1' && data.nextLevel === 'aal2';
    return { needsMFA, currentLevel: data.currentLevel, nextLevel: data.nextLevel };
  } catch (err) {
    console.error('Unexpected error checking MFA status:', err);
    return { needsMFA: false, error: err };
  }
}

/**
 * Enroll a new TOTP factor for MFA
 */
export async function enrollMFA(): Promise<{ factorId: string; qr: string; secret: string }> {
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (error) {
    throw new Error(`Failed to enroll MFA: ${error.message}`);
  }

  // Type guard to ensure we have TOTP data
  if (data.type !== 'totp' || !('totp' in data)) {
    throw new Error('Expected TOTP factor but received different type');
  }

  return {
    factorId: data.id,
    qr: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

/**
 * Challenge an MFA factor
 */
export async function challengeMFA(factorId: string): Promise<string> {
  const { data, error } = await supabase.auth.mfa.challenge({ factorId });

  if (error) {
    throw new Error(`Failed to challenge MFA: ${error.message}`);
  }

  return data.id;
}

/**
 * Verify an MFA challenge
 */
export async function verifyMFA(factorId: string, challengeId: string, code: string): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  });

  if (error) {
    throw new Error(`Failed to verify MFA: ${error.message}`);
  }

  return true;
}

/**
 * List all MFA factors for the current user
 */
export async function listMFATactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    throw new Error(`Failed to list MFA factors: ${error.message}`);
  }

  return data.all;
}

/**
 * Unenroll (remove) an MFA factor
 */
export async function unenrollMFA(factorId: string): Promise<boolean> {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });

  if (error) {
    throw new Error(`Failed to unenroll MFA: ${error.message}`);
  }

  return true;
}

/**
 * Get the primary TOTP factor for a user
 */
export async function getTOTPFactor() {
  const factors = await listMFATactors();
  return factors.find(factor => factor.factor_type === 'totp');
}

/**
 * Check if current user is an admin and should have MFA
 */
export async function shouldRequireMFA(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    // Check if user is in admins table
    const { data: adminData, error } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (error || !adminData) {
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return false;
  }
}
