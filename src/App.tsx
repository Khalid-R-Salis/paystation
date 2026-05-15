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
    await supabase.auth.signOut();
    SecureStorage.removeItem('smrt_user_session');
    setUser(null);
    setView('landing');
  }, []);

  // 3. App Initialization & Session Recovery
  useEffect(() => {
    const initApp = async () => {
      // Small delay for Splash visibility
      await new Promise(resolve => setTimeout(resolve, 2500));
      
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
      authMode={authMode} // PASS THIS
      setView={setView}   // PASS THIS
      setAuthMode={setAuthMode} // PASS THIS
              onForgotPassword={(email: string) => { setPendingEmail(email); setView('otp'); }}
      onBack={() => setView('landing')} 
      onLogin={(userData) => {
        SecureStorage.setItem('smrt_user_session', userData);
        setUser(userData);
        setView(userData.role === 'admin' ? 'admin' : 'dashboard');
      }} 
      onSignupSuccess={(email) => { 
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

        const userSession = profile
          ? {
              id: profile.id,
              name: profile.full_name,
              username: profile.username,
              email: userData.email || profile.email,
              phone: profile.phone,
              role: profile.role || 'user',
              walletBalance: profile.wallet_balance || 0,
              referralPoints: profile.referral_points || 0,
              referralCode: profile.referral_code || '',
            }
          : {
              id: userData.id,
              email: userData.email,
              role: 'user',
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