// import React, { useState, useEffect, useCallback } from 'react';
// import { Toaster } from 'sonner';
// import SplashView from './components/SplashView';
// import OnboardingView from './components/OnboardingView';
// import LandingPage from './components/LandingPage';
// import AuthView from './components/AuthView';
// import Dashboard from './components/Dashboard';
// import AdminDashboard from './components/AdminDashboard';
// import OTPVerification from './components/OTPVerification';
// import { LanguageProvider } from './context/LanguageContext';
// import { ScrollToTop } from './components/ScrollToTop';
// import { User } from './types';
// import { supabase } from './lib/supabase';
// import { toast } from 'sonner';

// type ViewState = 'splash' | 'onboarding' | 'landing' | 'auth' | 'otp' | 'dashboard' | 'admin';

// export default function App() {
//   const [view, setView] = useState<ViewState>('splash');
//   const [user, setUser] = useState<User | null>(null);
//   const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
//   const [pendingEmail, setPendingEmail] = useState('');
//   const [isDarkMode, setIsDarkMode] = useState(() => {
//     const saved = localStorage.getItem('theme');
//     return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
//   });

//   // 1. Theme Management
//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [isDarkMode]);

//   const toggleTheme = () => setIsDarkMode(!isDarkMode);

//   // 2. Manual Logout Function
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     localStorage.removeItem('paystation_user');
//     setUser(null);
//     setView('landing');
//   };

//   // 3. Splash Logic & Local Storage Session Check
//   useEffect(() => {
//     if (view === 'splash') {
//       const timer = setTimeout(() => {
//         const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
//         const savedUser = localStorage.getItem('paystation_user');

//         if (savedUser) {
//           const parsedUser = JSON.parse(savedUser);
//           setUser(parsedUser);
//           setView(parsedUser.role === 'admin' ? 'admin' : 'dashboard');
//         } else {
//           setView(hasSeenOnboarding ? 'landing' : 'onboarding');
//         }
//       }, 2500);

//       return () => clearTimeout(timer);
//     }
//   }, [view]);

//   return (
//     <LanguageProvider>
//       <div className="min-h-screen bg-background font-sans antialiased selection:bg-green-100 selection:text-green-900 transition-colors duration-300">
//         <style>{`
//           :root {
//             --color-green-600: #084328;
//             --color-green-700: #063a23;
//           }
//         `}</style>
//         <Toaster position="top-center" richColors closeButton />
//         <ScrollToTop />
//         <>
//           {view === 'splash' && <SplashView key="splash" />}
//           {view === 'onboarding' && (
//             <OnboardingView 
//               key="onboarding" 
//               onFinish={() => {
//                 localStorage.setItem('hasSeenOnboarding', 'true');
//                 setView('landing');
//               }} 
//             />
//           )}
//           {view === 'landing' && (
//             <LandingPage 
//               key="landing" 
//               onLogin={() => { setAuthMode('login'); setView('auth'); }} 
//               onSignUp={() => { setAuthMode('signup'); setView('auth'); }}
//               isDarkMode={isDarkMode}
//               toggleTheme={toggleTheme}
//             />
//           )}
//           {view === 'auth' && (
//             <AuthView 
//               key="auth" 
//               initialMode={authMode} 
//               onBack={() => setView('landing')} 
//               onLogin={(userData) => {
//                 // Save to local storage manually
//                 localStorage.setItem('paystation_user', JSON.stringify(userData));
//                 setUser(userData);
//                 setView(userData.role === 'admin' ? 'admin' : 'dashboard');
//               }} 
//               onSignupSuccess={(email) => { setPendingEmail(email); setView('otp'); }}
//             />
//           )}
//           {view === 'otp' && (
//             <OTPVerification
//               key="otp"
//               email={pendingEmail}
//               onBack={() => setView('auth')}
//               onSuccess={() => setView('dashboard')} 
//             />
//           )}
//           {(view === 'dashboard' || view === 'admin') && user && (
//             <div key="app-shell" className="animate-in fade-in duration-500">
//               {view === 'admin' ? (
//                 <AdminDashboard user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
//               ) : (
//                 <Dashboard user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
//               )}
//             </div>
//           )}
//         </>
//       </div>
//     </LanguageProvider>
//   );
// }



import React, { useState, useEffect } from 'react';
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
import { SecureStorage } from './lib/security'; // Import your new utility

type ViewState = 'splash' | 'onboarding' | 'landing' | 'auth' | 'otp' | 'dashboard' | 'admin';

export default function App() {
  const [view, setView] = useState<ViewState>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [pendingEmail, setPendingEmail] = useState('');
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

  // 2. Manual Logout - Now using SecureStorage
  const handleLogout = async () => {
    await supabase.auth.signOut();
    SecureStorage.removeItem('smrt_user_session'); // Clean up encrypted data
    setUser(null);
    setView('landing');
  };

  // 3. Splash Logic & Secure Session Check
  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        
        // Use SecureStorage to decrypt the session
        const savedUser = SecureStorage.getItem('smrt_user_session');

        if (savedUser) {
          setUser(savedUser);
          setView(savedUser.role === 'admin' ? 'admin' : 'dashboard');
        } else {
          setView(hasSeenOnboarding ? 'landing' : 'onboarding');
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [view]);

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
        <>
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
              onLogin={() => { setAuthMode('login'); setView('auth'); }} 
              onSignUp={() => { setAuthMode('signup'); setView('auth'); }}
              isDarkMode={isDarkMode}
              toggleTheme={toggleTheme}
            />
          )}
          {view === 'auth' && (
            <AuthView 
              key="auth" 
              initialMode={authMode} 
              onBack={() => setView('landing')} 
              onLogin={(userData) => {
                // ENCRYPT: Save user data scrambled
                SecureStorage.setItem('smrt_user_session', userData);
                setUser(userData);
                setView(userData.role === 'admin' ? 'admin' : 'dashboard');
              }} 
              onSignupSuccess={(email) => { setPendingEmail(email); setView('otp'); }}
            />
          )}
          {view === 'otp' && (
            <OTPVerification
              key="otp"
              email={pendingEmail}
              onBack={() => setView('auth')}
              onSuccess={() => setView('dashboard')} 
            />
          )}
          {(view === 'dashboard' || view === 'admin') && user && (
            <div key="app-shell" className="animate-in fade-in duration-500">
              {view === 'admin' ? (
                <AdminDashboard user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              ) : (
                <Dashboard user={user} onLogout={handleLogout} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              )}
            </div>
          )}
        </>
      </div>
    </LanguageProvider>
  );
}