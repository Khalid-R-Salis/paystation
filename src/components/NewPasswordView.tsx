import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const NewPasswordView = ({ email, onSuccess }: { email: string; onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Password updated successfully!");
      onSuccess(); // Takes user back to Login
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
        <Input 
          type="password" 
          placeholder="New Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-14 rounded-xl border-slate-200"
        />
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
      </div>
    </div>
  );
};
export default NewPasswordView;