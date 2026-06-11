import React, { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'sonner';
import SplashView from './components/SplashView';
import OnboardingView from './components/OnboardingView';
import LandingPage from './components/LandingPage';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import OTPVerification from './components/OTPVerification';
import { LanguageProvider } from './context/LanguageContext';
import { ScrollToTop } from './components/ScrollToTop';
import { User } from './types';
import { supabase } from './lib/supabase';
import { SecureStorage } from './lib/security';
import NewPasswordView from './components/NewPasswordView';
import { useInactivityLogout } from './hooks/useInactivityLogout';
import { listenForSessionInvalidation, invalidateCurrentSession, clearSessionId } from './lib/sessionManager';
import { clearDeviceId } from './lib/deviceManager';
import { toast } from 'sonner';

type ViewState = 'splash' | 'onboarding' | 'landing' | 'auth' | 'otp' | 'dashboard' | 'admin' | 'reset-password';

export default function App() {
  const [view, setView] = useState<ViewState>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset-otp'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // 1. Theme Management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // 2. Optimized Logout
  const handleLogout = useCallback(async () => {
    if (user?.id) {
      // Invalidate session in database
      await invalidateCurrentSession(user.id);
    }
    
    await supabase.auth.signOut();
    SecureStorage.removeItem('smrt_user_session');
    clearSessionId();
    setUser(null);
    setView('landing');
  }, [user?.id]);

  // 3. Auto Logout on Inactivity (15 minutes of no activity)
  useInactivityLogout({
    timeoutMinutes: 15,
    onLogout: handleLogout,
    enabled: !!user && (view === 'dashboard' || view === 'admin')  // Only active when user is logged in
  });

  // 4. Session Invalidation Listener - Force logout if logged in elsewhere
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = listenForSessionInvalidation(
      user.id,
      () => {
        // User was logged in on another device - force logout
        toast.error('Your account was accessed from another device. You have been logged out.');
        handleLogout();
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, handleLogout]);

  // 5. App Initialization & Session Recovery
  useEffect(() => {
    const initApp = async () => {
      // Check if this is the first visit ever (splash has never been shown)
      const hasSeenSplash = localStorage.getItem('hasSeenSplash');
      const shouldShowSplash = !hasSeenSplash && view === 'splash';
      
      // Show splash only on first visit
      if (shouldShowSplash) {
        await new Promise(resolve => setTimeout(resolve, 2500));
        localStorage.setItem('hasSeenSplash', 'true');
      }
      
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      const savedUser = SecureStorage.getItem('smrt_user_session');

      if (savedUser) {
        setUser(savedUser);
        setView(savedUser.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        setView(hasSeenOnboarding ? 'landing' : 'onboarding');
      }
      setIsInitializing(false);
    };

    initApp();
  }, []);

  // 6. Supabase Realtime — sync profile changes across tabs/devices
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const p = payload.new as any;
          const updated = {
            ...user,
            name: p.full_name,
            phone: p.phone,
            walletBalance: p.wallet_balance ?? user.walletBalance,
            referralPoints: p.referral_points ?? user.referralPoints,
            referralCode: p.referral_code ?? user.referralCode,
          };
          setUser(updated);
          SecureStorage.setItem('smrt_user_session', updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Prevent "Flash of Content" or Black Screens during initialization
  if (view === 'splash' && isInitializing) {
    return <SplashView />;
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background font-sans antialiased selection:bg-green-100 selection:text-green-900 transition-colors duration-300">
        <style>{`
          :root {
            --color-green-600: #084328;
            --color-green-700: #063a23;
          }
        `}</style>
        
        <Toaster position="top-center" richColors closeButton />
        <ScrollToTop />
        
        {(() => {
          switch (view) {
case 'reset-password':
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      
      <NewPasswordView 
  email={pendingEmail} 
  setView={setView}
  setAuthMode={setAuthMode}
  onSuccess={(userData?: any) => {
    if (userData) {
      SecureStorage.setItem('smrt_user_session', userData);
      setUser(userData);
      setView(userData.role === 'admin' ? 'admin' : 'dashboard');
    } else {
      setView('auth');
    }
  }}
/>
    </div>
  );
            case 'onboarding':
              return (
                <OnboardingView 
                  key="onboarding" 
                  onFinish={() => {
                    localStorage.setItem('hasSeenOnboarding', 'true');
                    setView('landing');
                  }} 
                />
              );

            case 'landing':
              return (
                <LandingPage 
                  key="landing" 
                  onLogin={() => { setAuthMode('login'); setView('auth'); }} 
                  onSignUp={() => { setAuthMode('signup'); setView('auth'); }}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                />
              );

          case 'auth':
  return (
    <AuthView 
      key="auth" 
      initialMode={authMode === 'reset-otp' ? 'login' : authMode} // Fallback logic
      authMode={authMode} 
      setView={setView}   
      setAuthMode={setAuthMode} 
              onForgotPassword={(email: string) => { setPendingEmail(email); setView('otp'); }}
      onBack={() => setView('landing')} 
      onLogin={(userData) => {
        SecureStorage.setItem('smrt_user_session', userData);
        setUser(userData);
        setView(userData.role === 'admin' ? 'admin' : 'dashboard');
      }} 
      onSignupSuccess={(email) => { 
        setAuthMode('signup');
        setPendingEmail(email); 
        setView('otp'); 
      }}
    />
  );

case 'otp':
  return (
    <OTPVerification
      key="otp"
      email={pendingEmail}
      authMode={authMode} 
      setView={setView}   
      onBack={() => setView('auth')}
      onSuccess={async (userData) => {
        // 1. If we are resetting a password, go to the New Password screen
        if (authMode === 'reset-otp') {
          setView('reset-password');
          return;
        }

        // 2. Otherwise, handle standard signup/login session
        if (!userData) {
          setView('auth');
          return;
        }

        // Attempt to fetch the user's profile (some systems create profile rows asynchronously).
        let profile = null;
        for (let i = 0; i < 5; i++) {
          const { data: p, error: pErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userData.id)
            .single();
          if (!pErr && p) {
            profile = p;
            break;
          }
          // wait 500ms before retrying
          await new Promise((res) => setTimeout(res, 500));
        }

        const metadata = (userData as any)?.user_metadata || {};
        const userSession = profile
          ? {
              id: profile.id,
              name: profile.full_name,
              username: profile.username,
              email: userData.email || profile.email || metadata.email || '',
              phone: profile.phone,
              role: profile.role || (metadata.role as string) || 'user',
              walletBalance: profile.wallet_balance || 0,
              referralPoints: profile.referral_points || 0,
              referralCode: profile.referral_code || '',
              joinedAt: profile.joined_at || new Date().toISOString(),
            }
          : {
              id: userData.id,
              name: metadata.full_name || metadata.fullName || metadata.name || '',
              username: metadata.username || '',
              email: userData.email || metadata.email || '',
              phone: metadata.phone || '',
              role: (metadata.role as string) || 'user',
              walletBalance: 0,
              referralPoints: 0,
              referralCode: '',
              joinedAt: new Date().toISOString(),
            };

        SecureStorage.setItem('smrt_user_session', userSession);
        setUser(userSession);
        setView(userSession.role === 'admin' ? 'admin' : 'dashboard');
      }}
    />
  );
            case 'dashboard':
            case 'admin':
              // Safety fallback: Redirect if user session is lost
              if (!user) {
                setTimeout(() => setView('landing'), 0);
                return null;
              }
              return (
                <div key="app-shell" className="animate-in fade-in duration-700">
                  {view === 'admin' ? (
                    <AdminDashboard 
                      user={user} 
                      onLogout={handleLogout} 
                      isDarkMode={isDarkMode} 
                      toggleTheme={toggleTheme} 
                    />
                  ) : (
                   
                      <Dashboard 
                      user={user} 
                      onLogout={handleLogout} 
                      isDarkMode={isDarkMode} 
                      toggleTheme={toggleTheme}
                      onUpdateUser={(updatedData: any) => {
                        const merged = { ...user, ...updatedData };
                        setUser(merged);
                        SecureStorage.setItem('smrt_user_session', merged);
                      }}
                    />
                  )}
                </div>
              );

            default:
              return <LandingPage onLogin={() => setView('auth')} onSignUp={() => setView('auth')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
          }
        })()}
      </div>
    </LanguageProvider>
  );
}