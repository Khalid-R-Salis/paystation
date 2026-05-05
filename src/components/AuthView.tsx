import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronLeft, Mail, Lock, User, Phone, Chrome, Github, CheckCircle2 } from 'lucide-react';
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
  onLogin: () => void;
  onSignupSuccess: (email: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ initialMode, onBack, onLogin, onSignupSuccess }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [showTandC, setShowTandC] = useState(false);
  const [acceptedTC, setAcceptedTC] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Update isLogin when initialMode changes (e.g. from LandingPage)
  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  // Failsafe to reset loading state after 15 seconds if something hangs
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setLoading(false);
        console.warn("Auth request timed out. Resetting loading state.");
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setLoading(false);
      toast.error(handleAuthError(error));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedResetEmail = resetEmail.trim().toLowerCase();
    if (!normalizedResetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedResetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent to your email!");
      setShowForgotPw(false);
    } catch (error: any) {
      toast.error(handleAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("AuthView: handleSubmit triggered. isLogin:", isLogin);
    
    if (loading) {
      console.log("AuthView: already loading, ignoring click.");
      return;
    }
    
    setLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    try {
      if (isLogin) {
        // LOGIN logic
        console.log("AuthView: Attempting sign-in for:", normalizedEmail);
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: normalizedEmail, 
          password 
        });
        
        if (error) {
          console.error("AuthView: sign-in error:", error);
          throw error;
        }
        
        console.log("AuthView: sign-in response:", data);
        toast.success(t('success_login') || 'Login successful!');
        onLogin();
      } else {
        // SIGNUP logic
        if (password !== confirmPassword) {
          toast.error(t('auth_pass_mismatch'));
          setLoading(false);
          return;
        }

        if (!acceptedTC) {
          toast.error("Please agree to the Terms and Conditions");
          setLoading(false);
          return;
        }

        if (!fullName.trim() || !username.trim() || !normalizedEmail || !password || !phone.trim()) {
          toast.error("Please fill all required fields correctly.");
          setLoading(false);
          return;
        }

        console.log("AuthView: Attempting signup for:", normalizedEmail);
        const { error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              username: username.trim(),
              phone: phone.trim()
            }
          }
        });

        if (error) {
          console.error("AuthView: signup error:", error);
          throw error;
        }

        toast.success(t('success_signup') || "Account created! Please check your email for the verification code.");
        onSignupSuccess(normalizedEmail);
      }
    } catch (error: any) {
      console.error("AuthView: caught error:", error);
      toast.error(handleAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      {/* Background blobs */}
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
          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800">
            <ChevronLeft size={18} />
          </div>
          {t('auth_back_home')}
        </button>

        <div className="text-center space-y-2 mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-[#084328] rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green-600/20 mb-6"
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
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_full_name')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input 
                        placeholder="John Doe" 
                        className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328] text-foreground" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_username')}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <Input 
                        placeholder="johndoe123" 
                        className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328] text-foreground" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328] text-foreground" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_phone')}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="0801 234 5678" 
                      className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328] text-foreground" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-slate-700 dark:text-slate-200 font-bold">{t('auth_password')}</Label>
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
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328] text-foreground" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-200 font-bold ml-1">{t('auth_confirm_password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-12 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-xl focus:ring-[#084328] text-foreground" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptedTC} 
                    onCheckedChange={(checked) => {
                      setAcceptedTC(checked as boolean);
                      if (checked) setShowTandC(true);
                    }} 
                  />
                  <label htmlFor="terms" className="text-sm font-medium leading-none text-slate-600 dark:text-slate-400 cursor-pointer">
                    {t('auth_agree_tc')}
                  </label>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-14 bg-[#084328] hover:bg-[#063a23] text-white text-lg font-bold rounded-2xl shadow-lg shadow-green-600/20 mt-4 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : (isLogin ? t('auth_btn_login') : t('auth_btn_signup'))}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-900 px-2 text-slate-400 font-bold tracking-widest">{t('auth_or_continue')}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleSocialLogin('google')} variant="outline" disabled={loading} className="h-12 rounded-xl border-slate-100 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">
                <Chrome className="mr-2 text-red-500" size={18} /> Google
              </Button>
              <Button onClick={() => handleSocialLogin('github')} variant="outline" disabled={loading} className="h-12 rounded-xl border-slate-100 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-bold">
                <Github className="mr-2" size={18} /> GitHub
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
          {isLogin ? t('auth_no_account') : t('auth_already_member')}{' '}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[#084328] font-black hover:underline ml-1 decoration-2"
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
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4 pt-4">
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
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-[#084328] hover:bg-[#063a23] text-white font-bold rounded-xl">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
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
                <p>Welcome to PayStation. By using our services, you agree to these terms. Please read them carefully.</p>
                
                <p className="font-bold text-slate-900 dark:text-white">2. User Account</p>
                <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                
                <p className="font-bold text-slate-900 dark:text-white">3. Payments and Transactions</p>
                <p>All VTU, data, and bill payments are processed instantly. Ensure you provide correct recipient details as transactions are generally irreversible.</p>
                
                <p className="font-bold text-slate-900 dark:text-white">4. Prohibited Activities</p>
                <p>You may not use PayStation for any illegal activity, including fraud, money laundering, or unauthorized access to other systems.</p>
                
                <p className="font-bold text-slate-900 dark:text-white">5. Limitation of Liability</p>
                <p>PayStation is not liable for indirect or consequential damages arising from the use of our services.</p>
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