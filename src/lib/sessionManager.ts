/**
 * Session Manager - Track and validate user sessions for single-device login
 * Handles session creation, validation, and detection of concurrent logins
 */

import { supabase } from './supabase';
import { getDeviceInfo, getDisplayDeviceName } from './deviceManager';
import { SecureStorage } from './security';

export interface SessionRecord {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  browserName: string;
  isActive: boolean;
  createdAt: string;
  lastActivityAt: string;
  ipAddress?: string;
}

const SESSION_ID_KEY = 'paystation_session_id';

/**
 * Creates a new session in the database when user logs in
 * Invalidates all previous sessions for this user
 */
export async function createSessionRecord(userId: string): Promise<string> {
  try {
    const deviceInfo = getDeviceInfo();
    const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Insert new session record
    const { error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        id: sessionId,
        user_id: userId,
        device_id: deviceInfo.id,
        device_name: deviceInfo.platform,
        browser_name: getDisplayDeviceName(),
        is_active: true,
        created_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating session record:', insertError);
      // Session table might not exist yet - this is not a critical error
      return sessionId;
    }

    // Invalidate all other sessions for this user (single-device login enforcement)
    await invalidatePreviousSessions(userId, deviceInfo.id);

    // Store session ID locally
    localStorage.setItem(SESSION_ID_KEY, sessionId);

    return sessionId;
  } catch (error) {
    console.error('Error in createSessionRecord:', error);
    // Fallback: at least create a local session ID
    const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    return sessionId;
  }
}

/**
 * Invalidates all previous sessions for a user (except current device)
 * This enforces single-device login
 */
export async function invalidatePreviousSessions(userId: string, currentDeviceId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .neq('device_id', currentDeviceId)
      .eq('is_active', true);

    if (error) {
      console.error('Error invalidating previous sessions:', error);
    }
  } catch (error) {
    console.error('Error in invalidatePreviousSessions:', error);
  }
}

/**
 * Validates if the current session is still active
 * Returns false if session was invalidated on another device
 */
export async function validateCurrentSession(userId: string): Promise<boolean> {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    const deviceInfo = getDeviceInfo();

    if (!sessionId) {
      return false;
    }

    const { data, error } = await supabase
      .from('user_sessions')
      .select('is_active, created_at')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .eq('device_id', deviceInfo.id)
      .single();

    if (error || !data) {
      return false;
    }

    return data.is_active === true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Updates the last activity timestamp for the current session
 */
export async function updateSessionActivity(userId: string): Promise<void> {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      return;
    }

    await supabase
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Gets all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionRecord[]> {
  try {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity_at', { ascending: false });

    if (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }

    return (data || []).map((session: any) => ({
      id: session.id,
      userId: session.user_id,
      deviceId: session.device_id,
      deviceName: session.device_name,
      browserName: session.browser_name,
      isActive: session.is_active,
      createdAt: session.created_at,
      lastActivityAt: session.last_activity_at,
    }));
  } catch (error) {
    console.error('Error in getUserSessions:', error);
    return [];
  }
}

/**
 * Sets up a listener for session invalidation
 * Calls the callback if this device's session is invalidated
 */
export function listenForSessionInvalidation(
  userId: string,
  onInvalidated: () => void
): (() => void) | null {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) return null;

    const channel = supabase
      .channel(`session-invalidation:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const session = payload.new as any;
          // If the session is now inactive, the user was logged out from another device
          if (session.is_active === false) {
            console.warn('Session invalidated: User logged in on another device');
            onInvalidated();
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error setting up session invalidation listener:', error);
    return null;
  }
}

/**
 * Invalidates the current session (used for logout)
 */
export async function invalidateCurrentSession(userId: string): Promise<void> {
  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY);

    if (!sessionId) {
      return;
    }

    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('id', sessionId)
      .eq('user_id', userId);

    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.error('Error invalidating session:', error);
  }
}

/**
 * Gets the current session ID
 */
export function getCurrentSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

/**
 * Clears the session ID from local storage (used on logout)
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}
