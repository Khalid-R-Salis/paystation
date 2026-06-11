import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// const NewPasswordView = ({ email, onSuccess }: { email: string; onSuccess: (userData?: any) => void }) => {
const NewPasswordView = ({
  email,
  onSuccess,
  setView,
  setAuthMode
}: {
  email: string;
  onSuccess: (userData?: any) => void;
  setView: (view: any) => void;
  setAuthMode: (mode: any) => void;
}) => {  
const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const handleDiscard = () => {
  setAuthMode('login');
  setView('auth');
};

  const handleUpdate = async () => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Password must be at least 8 characters and include letters and numbers.');
      return;
    }
    if (password !== confirm) return toast.error("Passwords do not match");

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated successfully!");

      // Attempt to sign the user in with the new password
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) throw signInError;

        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signInData.user?.id)
          .single();

        if (profileError) throw profileError;

        const userData = {
          id: profile.id,
          name: profile.full_name,
          username: profile.username,
          email: signInData.user?.email,
          phone: profile.phone,
          role: profile.role || 'user',
          walletBalance: profile.wallet_balance || 0,
          referralPoints: profile.referral_points || 0,
          referralCode: profile.referral_code || '',
        };

        onSuccess(userData);
        return;
      } catch (signInErr: any) {
        toast.error("Password updated but automatic login failed. Please sign in manually.");
        onSuccess();
        return;
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8 text-center">
      <div className="w-20 h-20 bg-[#084328]/10 rounded-3xl flex items-center justify-center mx-auto">
        <Lock className="text-[#084328]" size={40} />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">New Password</h2>
        <p className="text-slate-500 font-medium">Create a strong password for {email}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1 text-left">
          <Input 
            type="password" 
            placeholder="New Password" 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
            }}
            className={`h-14 rounded-xl ${passwordError ? 'border-red-500 border-2' : 'border-slate-200'}`}
          />
          {passwordError && (
            <p className="text-red-500 text-sm font-medium px-1">{passwordError}</p>
          )}
        </div>
        <Input 
          type="password" 
          placeholder="Confirm New Password" 
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="h-14 rounded-xl border-slate-200"
        />
        <Button 
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white text-xl font-black rounded-2xl transition-all"
        >
          {isUpdating ? "Updating..." : "Reset Password"}
          <ArrowRight className="ml-2" size={20} />
        </Button>

        <Button
  onClick={handleDiscard}
  type="button"
  className="w-full h-12 mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold rounded-2xl transition-all"
>
  Discard
</Button>
      </div>
    </div>
  );
};
export default NewPasswordView;