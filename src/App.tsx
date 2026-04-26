import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
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
import { toast } from 'sonner';

type ViewState = 'splash' | 'onboarding' | 'landing' | 'auth' | 'otp' | 'dashboard' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewState>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

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

  // Auth State Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth Event Triggered:", event, session?.user?.id);
      
      if (session?.user) {
        try {
          // Fetch profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error in App.tsx:", profileError);
          }

          if (profile) {
            const mappedUser: User = {
              id: profile.id,
              name: profile.full_name || session.user.user_metadata?.full_name || 'User',
              username: profile.username || '',
              email: session.user.email || '',
              phone: profile.phone || session.user.user_metadata?.phone || '',
              role: (profile.role as 'user' | 'agent' | 'admin') || 'user',
              walletBalance: Number(profile.wallet_balance) || 0,
              referralPoints: profile.referral_points || 0,
              referralCode: profile.referral_code || '',
              joinedAt: profile.joined_at
            };
            setUser(mappedUser);
            
            // Critical: Ensure view transition happens if we are on landing or auth
            setView((currentView) => {
              if (currentView === 'landing' || currentView === 'auth' || currentView === 'onboarding') {
                console.log("Setting view to:", profile.role === 'admin' ? 'admin' : 'dashboard');
                return profile.role === 'admin' ? 'admin' : 'dashboard';
              }
              return currentView;
            });
          } else {
            // Fallback for missing profile record
            const mappedUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || 'User',
              username: '',
              email: session.user.email || '',
              phone: session.user.user_metadata?.phone || '',
              role: 'user',
              walletBalance: 0,
              referralPoints: 0,
              referralCode: '',
              joinedAt: new Date().toISOString()
            };
            setUser(mappedUser);
            
            setView((currentView) => {
              if (currentView === 'landing' || currentView === 'auth' || currentView === 'onboarding') {
                return 'dashboard';
              }
              return currentView;
            });
          }
        } catch (err) {
          console.error("Critical error in auth state change:", err);
          toast.error("An error occurred while setting up your session.");
        }
      } else {
        setUser(null);
        setView((currentView) => {
          if (currentView === 'dashboard' || currentView === 'admin' || currentView === 'otp') {
             return 'landing';
          }
          return currentView;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Real-time Profile Updates Listener
  useEffect(() => {
    if (!user?.id) return;

    const profileSubscription = supabase
      .channel(`profile-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Real-time profile update received:", payload.new);
          const profile = payload.new;
          setUser((prev) => prev ? {
            ...prev,
            name: profile.full_name || prev.name,
            username: profile.username || prev.username,
            phone: profile.phone || prev.phone,
            role: profile.role || prev.role,
            walletBalance: Number(profile.wallet_balance) || 0,
            referralPoints: profile.referral_points || 0,
            referralCode: profile.referral_code || prev.referralCode,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, [user?.id]);

  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (hasSeenOnboarding) {
          setView('landing');
        } else {
          setView('onboarding');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('landing');
  };

  const navigateToAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setView('auth');
  };

  const handleSignupSuccess = (email: string) => {
    setPendingEmail(email);
    setView('otp');
  };

  const handleLoginSuccess = (isAdmin?: boolean) => {
    setView(isAdmin ? 'admin' : 'dashboard');
  };

  const handleOTPSuccess = () => {
    setView('dashboard');
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background font-sans antialiased selection:bg-green-100 selection:text-green-900 transition-colors duration-300">
        <style>{`
          :root {
            --color-green-50: #f0fdf4;
            --color-green-100: #dcfce7;
            --color-green-200: #bbf7d0;
            --color-green-300: #86efac;
            --color-green-400: #4ade80;
            --color-green-500: #22c55e;
            --color-green-600: #084328;
            --color-green-700: #063a23;
            --color-green-800: #05301d;
            --color-green-900: #042516;
            --color-green-950: #021a0f;
          }
        `}</style>
        <Toaster position="top-center" richColors closeButton />
        <ScrollToTop />
        <AnimatePresence mode="wait">
          {view === 'splash' && <SplashView key="splash" />}
          {view === 'onboarding' && (
            <OnboardingView 
              key="onboarding" 
              onFinish={() => {
                localStorage.setItem('hasSeenOnboarding', 'true');
                setView('landing');
              }} 
            />
          )}
          {view === 'landing' && (
            <LandingPage 
              key="landing" 
              onLogin={() => navigateToAuth('login')} 
              onSignUp={() => navigateToAuth('signup')}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          )}
          {view === 'auth' && (
            <AuthView 
              key="auth" 
              initialMode={authMode} 
              onBack={() => setView('landing')} 
              onLogin={handleLoginSuccess} 
              onSignupSuccess={handleSignupSuccess}
            />
          )}
          {view === 'otp' && (
            <OTPVerification
              key="otp"
              email={pendingEmail}
              onBack={() => setView('auth')}
              onSuccess={handleOTPSuccess} 
            />
          )}
          {(view === 'dashboard' || view === 'admin') && user && (
            <div key="app-shell" className="animate-in fade-in duration-500">
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
                />
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </LanguageProvider>
  );
}