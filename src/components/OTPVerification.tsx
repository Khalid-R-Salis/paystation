import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, ShieldCheck, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from './ui/input-otp';
import { SecureStorage } from '@/lib/security';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { supabase, handleAuthError } from '../lib/supabase';

interface OTPVerificationProps {
  email: string;
  onSuccess: () => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({ email, onSuccess, onBack }) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Failsafe to reset verifying state
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifying) {
      timer = setTimeout(() => {
        setIsVerifying(false);
      }, 15000);
    }
    return () => clearTimeout(timer);
  }, [isVerifying]);

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setResendTimer(60);
      toast.success("Verification code resent!");
    } catch (error: any) {
      toast.error(handleAuthError(error));
    }
  };

  
const handleVerify = async () => {
  if (otp.length !== 6) {
    toast.error("Please enter the complete 6-digit code");
    return;
  }

  setIsVerifying(true);
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup'
    });

    if (error) throw error;

    if (data.session) {
      // 1. Fetch the full profile from your 'profiles' table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (profileError) throw profileError;

      // 2. Construct the full user object
      const fullUserData = {
        id: profile.id,
        name: profile.full_name || profile.name,
        username: profile.username,
        email: data.session.user.email,
        phone: profile.phone,
        role: profile.role || 'user',
        referralCode: profile.referral_code,
        walletBalance: profile.wallet_balance || 0,
      };

      // 3. Save to storage and notify App.tsx
      SecureStorage.setItem('smrt_user_session', fullUserData);
      toast.success("Account verified successfully!");
      onSuccess(fullUserData); 
    }
  } catch (error: any) {
    toast.error(handleAuthError(error));
  } finally {
    setIsVerifying(false);
  }
};
return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-white/5 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-[#084328]/10 rounded-3xl flex items-center justify-center mx-auto">
          <ShieldCheck className="text-[#084328]" size={40} />
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">{t('otp_title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {t('otp_desc')}
          </p>
          <p className="text-[#084328] font-bold">{email}</p>
        </div>

        <div className="flex justify-center py-6">
          <InputOTP 
            maxLength={6} 
            value={otp} 
            onChange={(val) => setOtp(val)}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot 
                index={0}
                className="w-10 h-14 text-xl font-black border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-[#084328]"
              />
              <InputOTPSlot 
                index={1}
                className="w-10 h-14 text-xl font-black border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-[#084328]"
              />
              <InputOTPSlot 
                index={2}
                className="w-10 h-14 text-xl font-black border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-[#084328]"
              />
              <InputOTPSlot 
                index={3}
                className="w-10 h-14 text-xl font-black border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-[#084328]"
              />
              <InputOTPSlot 
                index={4}
                className="w-10 h-14 text-xl font-black border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-[#084328]"
              />
              <InputOTPSlot 
                index={5}
                className="w-10 h-14 text-xl font-black border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl focus:ring-2 focus:ring-[#084328]"
              />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying || otp.length < 6} 
            className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white text-xl font-black rounded-2xl shadow-xl shadow-green-900/10 transition-all active:scale-95"
          >
            {isVerifying ? "Verifying..." : t('otp_verify_btn')}
            {!isVerifying && <ArrowRight className="ml-2" size={20} strokeWidth={3} />}
          </Button>

          <button 
            onClick={handleResend}
            disabled={resendTimer > 0} 
            className={`flex items-center justify-center gap-2 mx-auto font-bold transition-colors ${resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#084328] hover:underline'}`}
          >
            <RefreshCcw size={16} />
            {t('otp_resend')} {resendTimer > 0 && `(${resendTimer}s)`}
          </button>
        </div>

        <button 
          onClick={onBack} 
          className="text-slate-500 dark:text-slate-400 font-bold hover:text-slate-900 dark:hover:text-white pt-4"
        >
          Change Email Address
        </button>
      </motion.div>
    </div>
  );
};

export default OTPVerification;