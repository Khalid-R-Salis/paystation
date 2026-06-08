import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityLogoutProps {
  timeoutMinutes?: number;  // Default 15 minutes
  onLogout: () => void;
  enabled?: boolean;  // Allow disabling this feature
}

/**
 * Custom hook that automatically logs out user after a period of inactivity.
 * Tracks keyboard, mouse, touch, and scroll events.
 * 
 * @param timeoutMinutes - Minutes of inactivity before logout (default: 15)
 * @param onLogout - Callback function to execute on logout
 * @param enabled - Whether to enable this feature (default: true)
 */
export const useInactivityLogout = ({ 
  timeoutMinutes = 15, 
  onLogout,
  enabled = true 
}: UseInactivityLogoutProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWarningShownRef = useRef(false);

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset warning flag
    isWarningShownRef.current = false;

    if (!enabled) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Set timeout for logout (show warning 1 minute before)
    const warningMs = (timeoutMinutes - 1) * 60 * 1000;

    // Warning timeout (1 minute before logout)
    warningTimeoutRef.current = setTimeout(() => {
      if (!isWarningShownRef.current) {
        isWarningShownRef.current = true;
        console.warn(`User will be logged out in 1 minute due to inactivity`);
        // You can dispatch a toast notification here if needed
      }
    }, warningMs);

    // Logout timeout
    timeoutRef.current = setTimeout(() => {
      console.log(`Logging out due to ${timeoutMinutes} minutes of inactivity`);
      onLogout();
    }, timeoutMs);
  }, [timeoutMinutes, onLogout, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // List of events that indicate user activity
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'contextmenu',
      'focus',
      'wheel'
    ];

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initialize the timer on mount
    resetInactivityTimer();

    // Cleanup function
    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });

      // Clear timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [enabled, resetInactivityTimer]);
};
