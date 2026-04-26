import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Configure the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'paystation-auth-token',
  }
});

/**
 * Handles common Supabase Auth errors like rate limiting
 * @param error The error object from Supabase
 * @returns A user-friendly error message
 */
export const handleAuthError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const status = error.status;
  const message = error.message?.toLowerCase() || '';

  console.log("Supabase Auth Error:", status, message);

  if (status === 429) {
    if (message.includes('email')) {
      return 'Email rate limit exceeded. Please wait a while before trying again.';
    }
    return 'Too many requests. Please wait a few minutes before trying again.';
  }

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please check your details and try again.';
  }

  if (message.includes('email not confirmed')) {
    return 'Your email has not been verified yet. Please check your inbox for the verification link.';
  }

  if (message.includes('user not found')) {
    return 'No account found with this email. Please sign up first.';
  }

  if (message.includes('lock') && message.includes('released')) {
    return 'A synchronization error occurred. Please click the button again to retry.';
  }

  if (message.includes('network error') || message.includes('failed to fetch')) {
    return 'Network connection error. Please check your internet connection.';
  }

  return error.message || 'An error occurred during authentication. Please try again.';
};

export type Profile = {
  id: string;
  full_name: string;
  username: string;
  phone: string;
  role: 'user' | 'agent' | 'admin';
  wallet_balance: number;
  referral_points: number;
  referral_code: string;
  joined_at: string;
};