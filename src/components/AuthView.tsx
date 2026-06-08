// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Zap, ChevronLeft, Mail, Lock, User, Phone, CheckCircle2, Eye, EyeOff } from 'lucide-react';
// import { Button } from './ui/button';
// import { Card, CardContent } from './ui/card';
// import { Input } from './ui/input';
// import { Label } from './ui/label';
// import { Checkbox } from './ui/checkbox';
// import { 
//   Dialog, 
//   DialogContent, 
//   DialogHeader, 
//   DialogTitle, 
//   DialogDescription,
//   DialogFooter
// } from './ui/dialog';
// import { useLanguage } from '../context/LanguageContext';
// import { supabase, handleAuthError } from '../lib/supabase';
// import { toast } from 'sonner';

// interface AuthViewProps {
//   initialMode: 'login' | 'signup';
//   onBack: () => void;
//   onLogin: (userData: any) => void;
//   onSignupSuccess: (email: string) => void;
//   onForgotPassword: (email: string) => void;
//   setView: (view: any) => void;
//   setAuthMode: (mode: any) => void; 
//   authMode: string;
// }
// const AuthView: React.FC<AuthViewProps> = ({ initialMode, onBack, onLogin, onSignupSuccess, onForgotPassword, setView, setAuthMode }) => {
//   const { t } = useLanguage();
//   const [isLogin, setIsLogin] = useState(initialMode === 'login');
//   const [loading, setLoading] = useState(false);
//   const [showTandC, setShowTandC] = useState(false);
//   const [acceptedTC, setAcceptedTC] = useState(false);
//   const [showForgotPw, setShowForgotPw] = useState(false);
//   const [resetEmail, setResetEmail] = useState('');

//   // Form states
//   const [fullName, setFullName] = useState('');
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
  
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   useEffect(() => {
//     setIsLogin(initialMode === 'login');
//   }, [initialMode]);

// const handleForgotPassword = async (email: string) => {
//   if (!email) {
//     toast.error("Please enter your email address");
//     return;
//   }

//   setLoading(true); // Changed from setIsLoading to setLoading
//   try {
//     const { error } = await supabase.auth.resetPasswordForEmail(email, {
//       redirectTo: window.location.origin,
//     });

//     if (error) throw error;

//     // Lift pending email to parent and switch to reset OTP mode
//     setAuthMode('reset-otp');
//     // Notify parent to store pending email and navigate to otp view
//     // `onForgotPassword` is provided by the parent App component
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     onForgotPassword(email);
//     toast.success("Reset code sent to your email!");
//   } catch (error: any) {
//     toast.error(handleAuthError(error));
//   } finally {
//     setLoading(false); // Changed from setIsLoading to setLoading
//   }
// };
  
//   const handleSocialLogin = async (provider: 'google' | 'github') => {
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signInWithOAuth({
//         provider,
//         options: { redirectTo: window.location.origin }
//       });
//       if (error) throw error;
//     } catch (error: any) {
//       setLoading(false);
//       toast.error(handleAuthError(error));
//     }
//   };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (loading) return;
  
//   setLoading(true);
//   const normalizedEmail = email.trim().toLowerCase();

//   try {
//     if (isLogin) {
//       // --- RECTIFIED LOGIN LOGIC ---
//       const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
//         email: normalizedEmail, 
//         password 
//       });
      
//       if (authError) throw authError;

//       // Fetch profile data
//       const { data: profile, error: profileError } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', authData.user.id)
//         .single();

//       if (profileError) throw profileError;

//       const userData = {
//         id: profile.id,
//         name: profile.full_name,
//         username: profile.username,
//         email: authData.user.email,
//         phone: profile.phone,
//         role: profile.role || 'user',
//         walletBalance: profile.wallet_balance || 0,
//         referralPoints: profile.referral_points || 0,
//         referralCode: profile.referral_code || '',
//       };
      
//       toast.success(t('success_login') || 'Welcome back!');
//       onLogin(userData);

//     } else {
//       // --- RECTIFIED SIGNUP LOGIC ---
//       if (password !== confirmPassword) {
//         toast.error(t('auth_pass_mismatch') || "Passwords do not match");
//         setLoading(false);
//         return;
//       }

//       // Password complexity check (Supabase default requirement)
//       const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
//       if (!passwordRegex.test(password)) {
//         toast.error("Password must be at least 8 characters long and include both letters and numbers.");
//         setLoading(false);
//         return;
//       }

//       if (!acceptedTC) {
//         toast.error("Please agree to the Terms and Conditions");
//         setLoading(false);
//         return;
//       }

//       const { data, error } = await supabase.auth.signUp({
//         email: normalizedEmail,
//         password,
//         options: {
//           data: {
//             full_name: fullName.trim(),
//             username: username.trim(),
//             phone: phone.trim()
//           },
//           emailRedirectTo: window.location.origin 
//         }
//       });

//       if (error) throw error;

//       if (data?.user) {
//         toast.success(t('success_signup') || "Verification code sent to your email!");
//         setAuthMode('signup');
//         onSignupSuccess(normalizedEmail);
//       }
//     }
//   } catch (error: any) {
//     toast.error(handleAuthError(error));
//     // Reset loading so user can try again
//     setLoading(false); 
//   } finally {
//     // Only keep loading true if we are successfully transitioning pages
//     // Otherwise, reset it so the UI isn't stuck.
//     const isNavigating = !isLogin && email && !loading; 
//     if (!isNavigating) setLoading(false);
//   }
// };
  
//   return (
//     <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
//       <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
//       <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -ml-48 -mb-48" />

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md relative z-10"
//       >
//         <button 
//           onClick={onBack}
//           className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 font-medium transition-colors group"
//         >
//           <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
//             <ChevronLeft size={18} />
//           </div>
//           {t('auth_back_home')}
//         </button>

//         <div className="text-center space-y-2 mb-8">
//           <motion.div 
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             className="w-16 h-16 bg-[#084328] rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6"
//           >
//             <Zap className="text-white fill-white" size={32} />
//           </motion.div>
//           <h2 className="text-3xl font-black text-slate-900 dark:text-white">
//             {isLogin ? t('auth_welcome_back') : t('auth_get_started')}
//           </h2>
//           <p className="text-slate-500 dark:text-slate-400 font-medium">
//             {isLogin ? t('auth_login_desc') : t('auth_signup_desc')}
//           </p>
//         </div>

//         <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/5">
//           <CardContent className="pt-8 space-y-6">
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {!isLogin && (
//                 <>
//                   <div className="space-y-2">
//                     <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_full_name')}</Label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                       <Input 
//                         placeholder="John Doe" 
//                         className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         required={!isLogin}
//                       />
//                     </div>
//                   </div>
//                   <div className="space-y-2">
//                     <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_username')}</Label>
//                     <div className="relative">
//                       <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                       <Input 
//                         placeholder="johndoe123" 
//                         className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         required={!isLogin}
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}
              
//               <div className="space-y-2">
//                 <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_email')}</Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                   <Input 
//                     type="email" 
//                     placeholder="name@example.com" 
//                     className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     required 
//                   />
//                 </div>
//               </div>

//               {!isLogin && (
//                 <div className="space-y-2">
//                   <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_phone')}</Label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <Input 
//                       placeholder="0801 234 5678" 
//                       className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//                       value={phone}
//                       onChange={(e) => setPhone(e.target.value)}
//                       required={!isLogin}
//                     />
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-2">
//                 <div className="flex justify-between items-center ml-1">
//                   <Label className="text-slate-700 dark:text-slate-200 font-bold">{t('auth_password')}</Label>
//                   {isLogin && (
//                     <button 
//                       type="button" 
//                       onClick={() => setShowForgotPw(true)}
//                       className="text-xs text-[#084328] font-bold hover:underline"
//                     >
//                       {t('auth_forgot')}
//                     </button>
//                   )}
//                 </div>
//                 {/* <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                   <Input 
//                     type="password" 
//                     placeholder="•••••••1" 
//                     className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     required 
//                   />
//                 </div> */}
              
//               <div className="relative">
//   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//   <Input 
//     type={showPassword ? "text" : "password"} 
//     placeholder="••••••••" 
//     className="pl-10 pr-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//     value={password}
//     onChange={(e) => setPassword(e.target.value)}
//     required 
//   />
//   {password.length > 0 && (
//     <button
//       type="button"
//       onClick={() => setShowPassword(!showPassword)}
//       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//     >
//       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//     </button>
//   )}
// </div>
//               </div>

//               {!isLogin && (
//                 <div className="space-y-2">
//                   <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_confirm_password')}</Label>
//                   {/* <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                     <Input 
//                       type="password" 
//                       placeholder="••••••••" 
//                       className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       required={!isLogin}
//                     />
//                   </div> */}
               
//                <div className="relative">
//   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//   <Input 
//     type={showConfirmPassword ? "text" : "password"} 
//     placeholder="••••••••" 
//     className="pl-10 pr-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328]" 
//     value={confirmPassword}
//     onChange={(e) => setConfirmPassword(e.target.value)}
//     required={!isLogin}
//   />
//   {confirmPassword.length > 0 && (
//     <button
//       type="button"
//       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
//     >
//       {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//     </button>
//   )}
// </div>
               
//                 </div>
//               )}

//               {!isLogin && (
//                 <div className="flex items-center space-x-2 pt-2">
//                   <Checkbox 
//                     id="terms" 
//                     checked={acceptedTC} 
//                     onCheckedChange={(checked) => {
//                       setAcceptedTC(checked as boolean);
//                       if (checked) setShowTandC(true);
//                     }} 
//                   />
//                   <label htmlFor="terms" className="text-sm font-medium leading-none text-slate-600 dark:text-slate-400 cursor-pointer">
//                     {t('auth_agree_tc')}
//                   </label>
//                 </div>
//               )}

//               <Button 
//                 type="submit" 
//                 disabled={loading} 
//                 className="w-full h-14 bg-[#084328] hover:bg-[#063a23] text-white text-lg font-bold rounded-2xl shadow-lg mt-4 transition-all active:scale-95 disabled:opacity-70"
//               >
//                 {loading ? "Processing..." : (isLogin ? t('auth_btn_login') : t('auth_btn_signup'))}
//               </Button>
//             </form>

//           </CardContent>
//         </Card>

//         <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
//           {isLogin ? t('auth_no_account') : t('auth_already_member')}{' '}
//           <button 
//             type="button"
//             onClick={() => {
//               setIsLogin(!isLogin);
//               setAuthMode(isLogin ? 'signup' : 'login');
//             }} 
//             className="text-[#084328] font-black hover:underline ml-1"
//           >
//             {isLogin ? t('auth_sign_up') : t('auth_log_in')}
//           </button>
//         </p>
//       </motion.div>

//       {/* Forgot Password Modal */}
//       <Dialog open={showForgotPw} onOpenChange={setShowForgotPw}>
//         <DialogContent className="max-w-md rounded-3xl dark:bg-slate-900">
//           <DialogHeader>
//             <DialogTitle className="text-2xl font-black">Reset Password</DialogTitle>
//             <DialogDescription>
//               Enter your email and we'll send you a recovery link.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 pt-4">
//             <div className="space-y-2">
//               <Label className="font-bold ml-1">Email Address</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//                 <Input 
//                   type="email" 
//                   placeholder="name@example.com" 
//                   className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl"
//                   value={resetEmail}
//                   onChange={(e) => setResetEmail(e.target.value)}
//                 />
//               </div>
//             </div>
//             <Button 
//   onClick={() => handleForgotPassword(resetEmail)} 
//   className="w-full h-12 bg-[#084328] hover:bg-[#063a23] text-white font-bold rounded-xl"
// >
//   {loading ? "Sending..." : "Send Reset Link"}
// </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* T&C Modal */}
//       <Dialog open={showTandC} onOpenChange={setShowTandC}>
//         <DialogContent className="max-w-2xl rounded-3xl dark:bg-slate-900">
//           <DialogHeader>
//             <DialogTitle className="text-2xl font-black">{t('auth_tc_modal_title')}</DialogTitle>
//             <div className="pt-4 text-slate-600 dark:text-slate-400">
//               <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 text-sm">
//                 <p className="font-bold text-slate-900 dark:text-white">1. Introduction</p>
//                 <p>Welcome to SMRT WALLET. By using our services, you agree to these terms.</p>
//                 <p className="font-bold text-slate-900 dark:text-white">2. Financial Responsibility</p>
//                 <p>You are responsible for all transactions initiated through your account.</p>
//               </div>
//             </div>
//           </DialogHeader>
//           <DialogFooter className="pt-4">
//             <Button onClick={() => setShowTandC(false)} className="bg-[#084328] hover:bg-[#063a23] text-white font-bold rounded-xl w-full h-12">
//               <CheckCircle2 className="mr-2" size={18} /> I Understand and Agree
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default AuthView;




import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronLeft, Mail, Lock, User, Phone, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import { useLanguage } from '../context/LanguageContext';
import { supabase, handleAuthError } from '../lib/supabase';
import { toast } from 'sonner';

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  onBack: () => void;
  onLogin: (userData: any) => void;
  onSignupSuccess: (email: string) => void;
  onForgotPassword: (email: string) => void;
  setView: (view: any) => void;
  setAuthMode: (mode: any) => void; 
  authMode: string;
}

const AuthView: React.FC<AuthViewProps> = ({ initialMode, onBack, onLogin, onSignupSuccess, onForgotPassword, setView, setAuthMode }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [showTandC, setShowTandC] = useState(false);
  const [acceptedTC, setAcceptedTC] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Inline error states
  const [fullNameError, setFullNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [tcError, setTcError] = useState('');

  // Touched states — controls when real-time errors show
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Valid states — controls sequential field unlocking
  const [fullNameValid, setFullNameValid] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // ── Real-time blur validators ──────────────────────────────────────

  const validateFullName = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length < 2 || parts.some(p => p.length <= 1)) {
      setFullNameError('Enter your first name and at least one other name (each more than 1 character).');
      setFullNameValid(false);
    } else {
      setFullNameError('');
      setFullNameValid(true);
    }
  };

  const validateUsername = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setUsernameError('Username is required.');
      setUsernameValid(false);
      return;
    }
    if (/\s/.test(trimmed)) {
      setUsernameError('Username must be a single word with no spaces.');
      setUsernameValid(false);
      return;
    }
    // Uniqueness check on blur
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', trimmed);
    if (!error && data && data.length > 0) {
      setUsernameError('This username is already taken. Please choose another.');
      setUsernameValid(false);
    } else {
      setUsernameError('');
      setUsernameValid(true);
    }
  };

  const validateEmail = (value: string) => {
    // Basic format check only — duplicate check still happens on submit (original behaviour)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      setEmailError('Please enter a valid email address.');
      setEmailValid(false);
    } else {
      setEmailError('');
      setEmailValid(true);
    }
  };

  const validatePhone = (value: string) => {
    if (!/^0\d{10}$/.test(value.trim())) {
      setPhoneError('Phone number must be exactly 11 digits and start with 0.');
      setPhoneValid(false);
    } else {
      setPhoneError('');
      setPhoneValid(true);
    }
  };

  const validatePassword = (value: string) => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(value)) {
      setPasswordError('Password must be at least 8 characters long and include both letters and numbers.');
      setPasswordValid(false);
    } else {
      setPasswordError('');
      setPasswordValid(true);
    }
  };

  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  // ── Handle email error display — UNCHANGED from original ───────────

  const handleEmailError = (errorMsg: string) => {
    const msg = errorMsg.toLowerCase();
    if (msg.includes('user already registered') || 
        msg.includes('duplicate') || 
        msg.includes('already exists') ||
        msg.includes('email already in use') ||
        msg.includes('user with this email')) {
      setEmailError('This email is already registered. Please log in or use another email.');
      return true;
    }
    return false;
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setAuthMode('reset-otp');
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onForgotPassword(email);
      toast.success("Reset code sent to your email!");
    } catch (error: any) {
      toast.error(handleAuthError(error));
    } finally {
      setLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    } catch (error: any) {
      setLoading(false);
      toast.error(handleAuthError(error));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    setEmailError('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC — UNCHANGED ---
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
          email: normalizedEmail, 
          password 
        });
        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        if (profileError) throw profileError;

        const userData = {
          id: profile.id,
          name: profile.full_name,
          username: profile.username,
          email: authData.user.email,
          phone: profile.phone,
          role: profile.role || 'user',
          walletBalance: profile.wallet_balance || 0,
          referralPoints: profile.referral_points || 0,
          referralCode: profile.referral_code || '',
        };
        
        toast.success(t('success_login') || 'Welcome back!');
        onLogin(userData);

      } else {
        // --- SIGNUP — final guard in case user bypasses blur ---
        let hasError = false;

        const nameParts = fullName.trim().split(/\s+/);
        if (nameParts.length < 2 || nameParts.some(p => p.length <= 1)) {
          setFullNameError('Enter your first name and at least one other name (each more than 1 character).');
          hasError = true;
        }
        const trimmedUsername = username.trim();
        if (!trimmedUsername || /\s/.test(trimmedUsername)) {
          setUsernameError(!trimmedUsername ? 'Username is required.' : 'Username must be a single word with no spaces.');
          hasError = true;
        }
        const trimmedPhone = phone.trim();
        if (!/^0\d{10}$/.test(trimmedPhone)) {
          setPhoneError('Phone number must be exactly 11 digits and start with 0.');
          hasError = true;
        }
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
          setPasswordError('Password must be at least 8 characters long and include both letters and numbers.');
          hasError = true;
        }
        if (password !== confirmPassword) {
          setConfirmPasswordError('Passwords do not match.');
          hasError = true;
        }
        if (!acceptedTC) {
          setTcError('Please agree to the Terms and Conditions.');
          hasError = true;
        }
        if (hasError) {
          setLoading(false);
          return;
        }

  //       // EMAIL DUPLICATE CHECK — EXACTLY AS IN ORIGINAL
  //       const { data: existingUsers, error: checkError } = await supabase
  //         .from('profiles')
  //         .select('email')
  //         .eq('email', normalizedEmail);

  //       console.log("Checking email:", normalizedEmail);
  //       console.log("Existing users:", existingUsers);

  //       if (checkError) {
  //         throw checkError;
  //       }
  //       if (existingUsers && existingUsers.length > 0) {
  //         setEmailError('This email is already registered. Please login instead.');
  //         setLoading(false);
  //         return;
  //       }

  //       // Username uniqueness final check
  //       const { data: existingUsernames, error: usernameCheckError } = await supabase
  //         .from('profiles')
  //         .select('username')
  //         .eq('username', trimmedUsername);
  //       if (usernameCheckError) throw usernameCheckError;
  //       if (existingUsernames && existingUsernames.length > 0) {
  //         setUsernameError('This username is already taken. Please choose another.');
  //         setLoading(false);
  //         return;
  //       }

  //       // Continue signup — UNCHANGED from original
  //       const { data, error } = await supabase.auth.signUp({
  //         email: normalizedEmail,
  //         password,
  //         options: {
  //           data: {
  //             full_name: fullName.trim(),
  //             username: trimmedUsername,
  //             phone: trimmedPhone,
  //             email: normalizedEmail
  //           },
  //           emailRedirectTo: window.location.origin
  //         }
  //       });

  //       if (error) {
  //         if (handleEmailError(error.message || '')) {
  //           setEmailError('This email is already registered. Please log in or use another email.');
  //           setLoading(false);
  //           return;
  //         }
  //         throw error;
  //       }

  //       if (data?.user) {
  //         toast.success(t('success_signup') || "Verification code sent to your email!");
  //         setAuthMode('signup');
  //         onSignupSuccess(normalizedEmail);
  //       }
  //     }
  //   } catch (error: any) {
  //     toast.error(
  //       handleEmailError(error.message || '')
  //         ? 'Email already exists'
  //         : handleAuthError(error)
  //     );
  //     setLoading(false); 
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // EMAIL DUPLICATE CHECK — profiles table
        const { data: existingUsers, error: checkError } = await supabase
          .from('profiles')
          .select('email')
          .eq('email', normalizedEmail);

        console.log("Checking email:", normalizedEmail);
        console.log("Existing users:", existingUsers);

        if (checkError) {
          throw checkError;
        }
        if (existingUsers && existingUsers.length > 0) {
          setEmailError('This email is already registered. Please login instead.');
          setLoading(false);
          return;
        }

        // Username uniqueness final check
        const { data: existingUsernames, error: usernameCheckError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', trimmedUsername);
        if (usernameCheckError) throw usernameCheckError;
        if (existingUsernames && existingUsernames.length > 0) {
          setUsernameError('This username is already taken. Please choose another.');
          setLoading(false);
          return;
        }

        // Continue signup
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              username: trimmedUsername,
              phone: trimmedPhone,
              email: normalizedEmail
            },
            emailRedirectTo: window.location.origin
          }
        });

        if (error) {
          if (handleEmailError(error.message || '')) {
            setEmailError('This email is already registered. Please log in or use another email.');
            setLoading(false);
            return;
          }
          throw error;
        }

        // Catch unconfirmed accounts — Supabase returns empty identities array
        // instead of an error when email already exists in auth but is unconfirmed
        if (data?.user && data.user.identities?.length === 0) {
          setEmailError('This email is already registered. Please login instead.');
          setLoading(false);
          return;
        }

        if (data?.user) {
          toast.success(t('success_signup') || "Verification code sent to your email!");
          setAuthMode('signup');
          onSignupSuccess(normalizedEmail);
        }
      }
    } catch (error: any) {
      toast.error(
        handleEmailError(error.message || '')
          ? 'Email already exists'
          : handleAuthError(error)
      );
      setLoading(false); 
    } finally {
      setLoading(false);
    }
  };

  // Shared input class builder
  const inputClass = (hasError: boolean, disabled = false) =>
    `pl-10 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl focus:ring-[#084328] transition-colors ${
      hasError
        ? 'border-red-500 dark:border-red-500 border-2 focus:border-red-500'
        : 'border-slate-100 dark:border-slate-700'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/5 rounded-full blur-3xl -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -ml-48 -mb-48" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 font-medium transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-800">
            <ChevronLeft size={18} />
          </div>
          {t('auth_back_home')}
        </button>

        <div className="text-center space-y-2 mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-[#084328] rounded-2xl flex items-center justify-center mx-auto shadow-xl mb-6"
          >
            <Zap className="text-white fill-white" size={32} />
          </motion.div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {isLogin ? t('auth_welcome_back') : t('auth_get_started')}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? t('auth_login_desc') : t('auth_signup_desc')}
          </p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/5">
          <CardContent className="pt-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  {/* Full Name — always enabled first */}
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_full_name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input
                        placeholder="John Doe"
                        className={inputClass(!!fullNameError)}
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fullNameError) setFullNameError('');
                          setFullNameValid(false);
                        }}
                        onBlur={() => {
                          setFullNameTouched(true);
                          validateFullName(fullName);
                        }}
                        required={!isLogin}
                      />
                    </div>
                    {fullNameError && <p className="text-red-500 text-sm font-medium mt-1">{fullNameError}</p>}
                  </div>

                  {/* Username — enabled only when full name is valid */}
                  <div className="space-y-2">
                    <Label className={`font-bold ml-1 ${!fullNameValid ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {t('auth_username')}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input
  placeholder="Khalid123"
  className={inputClass(!!usernameError, !fullNameValid)}
  value={username}
  disabled={!fullNameValid}
  onChange={(e) => {
    setUsername(e.target.value.toLowerCase());
    if (usernameError) setUsernameError('');
    setUsernameValid(false);
  }}
  onBlur={() => {
    setUsernameTouched(true);
    validateUsername(username);
  }}
  required={!isLogin}
/>
                    </div>
                    {usernameError && <p className="text-red-500 text-sm font-medium mt-1">{usernameError}</p>}
                  </div>
                </>
              )}

              {/* Email — in signup, enabled only when username is valid */}
              <div className="space-y-2">
                <Label className={`font-bold ml-1 ${!isLogin && !usernameValid ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                  {t('auth_email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className={inputClass(!!emailError, !isLogin && !usernameValid)}
                    disabled={!isLogin && !usernameValid}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      setEmailValid(false);
                    }}
                    onBlur={() => {
                      setEmailTouched(true);
                      if (!isLogin) validateEmail(email);
                    }}
                    required
                  />
                </div>
                {emailError && !isLogin && (
                  <p className="text-red-500 text-sm font-medium mt-1">{emailError}</p>
                )}
              </div>

              {/* Phone — enabled only when email is valid */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label className={`font-bold ml-1 ${!emailValid ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {t('auth_phone')}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      placeholder="08012345678"
                      className={inputClass(!!phoneError, !emailValid)}
                      disabled={!emailValid}
                      value={phone}
                      inputMode="numeric"
                      onChange={(e) => {
                        // Strip non-digits and cap at 11 characters
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setPhone(digits);
                        if (phoneError) setPhoneError('');
                        setPhoneValid(false);
                      }}
                      onBlur={() => {
                        setPhoneTouched(true);
                        validatePhone(phone);
                      }}
                      required={!isLogin}
                    />
                  </div>
                  {phoneError && <p className="text-red-500 text-sm font-medium mt-1">{phoneError}</p>}
                </div>
              )}

              {/* Password — in signup, enabled only when phone is valid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className={`font-bold ${!isLogin && !phoneValid ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {t('auth_password')}
                  </Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPw(true)}
                      className="text-xs text-[#084328] font-bold hover:underline"
                    >
                      {t('auth_forgot')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputClass(!!passwordError, !isLogin && !phoneValid)} pr-10`}
                    disabled={!isLogin && !phoneValid}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      setPasswordValid(false);
                    }}
                    onBlur={() => {
                      setPasswordTouched(true);
                      if (!isLogin) validatePassword(password);
                    }}
                    required
                  />
                  {password.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
                {passwordError && !isLogin && (
                  <p className="text-red-500 text-sm font-medium mt-1">{passwordError}</p>
                )}
              </div>

              {/* Confirm Password — enabled only when password is valid */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label className={`font-bold ml-1 ${!passwordValid ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200'}`}>
                    {t('auth_confirm_password')}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputClass(!!confirmPasswordError, !passwordValid)} pr-10`}
                      disabled={!passwordValid}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (confirmPasswordError) setConfirmPasswordError('');
                      }}
                      onBlur={() => {
                        setConfirmPasswordTouched(true);
                        validateConfirmPassword(confirmPassword);
                      }}
                      required={!isLogin}
                    />
                    {confirmPassword.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                  </div>
                  {confirmPasswordError && (
                    <p className="text-red-500 text-sm font-medium mt-1">{confirmPasswordError}</p>
                  )}
                </div>
              )}

              {/* Terms & Conditions */}
              {!isLogin && (
                <div className="space-y-1 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTC}
                      onCheckedChange={(checked) => {
                        setAcceptedTC(checked as boolean);
                        if (checked) {
                          setShowTandC(true);
                          setTcError('');
                        }
                      }}
                    />
                    <label htmlFor="terms" className="text-sm font-medium leading-none text-slate-600 dark:text-slate-400 cursor-pointer">
                      {t('auth_agree_tc')}
                    </label>
                  </div>
                  {tcError && <p className="text-red-500 text-sm font-medium mt-1">{tcError}</p>}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#084328] hover:bg-[#063a23] text-white text-lg font-bold rounded-2xl shadow-lg mt-4 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? "Processing..." : (isLogin ? t('auth_btn_login') : t('auth_btn_signup'))}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
          {isLogin ? t('auth_no_account') : t('auth_already_member')}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthMode(isLogin ? 'signup' : 'login');
            }}
            className="text-[#084328] font-black hover:underline ml-1"
          >
            {isLogin ? t('auth_sign_up') : t('auth_log_in')}
          </button>
        </p>
      </motion.div>

      {/* Forgot Password Modal */}
      <Dialog open={showForgotPw} onOpenChange={setShowForgotPw}>
        <DialogContent className="max-w-md rounded-3xl dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and we'll send you a recovery link.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={() => handleForgotPassword(resetEmail)}
              className="w-full h-12 bg-[#084328] hover:bg-[#063a23] text-white font-bold rounded-xl"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* T&C Modal */}
      <Dialog open={showTandC} onOpenChange={setShowTandC}>
        <DialogContent className="max-w-2xl rounded-3xl dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{t('auth_tc_modal_title')}</DialogTitle>
            <div className="pt-4 text-slate-600 dark:text-slate-400">
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 text-sm">
                <p className="font-bold text-slate-900 dark:text-white">1. Introduction</p>
                <p>Welcome to SMRT WALLET. By using our services, you agree to these terms.</p>
                <p className="font-bold text-slate-900 dark:text-white">2. Financial Responsibility</p>
                <p>You are responsible for all transactions initiated through your account.</p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button onClick={() => setShowTandC(false)} className="bg-[#084328] hover:bg-[#063a23] text-white font-bold rounded-xl w-full h-12">
              <CheckCircle2 className="mr-2" size={18} /> I Understand and Agree
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthView;