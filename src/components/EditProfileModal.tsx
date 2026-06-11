import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Phone, Loader2, Save, BadgeCheck, AlertCircle, Lock, AtSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (updatedData: any) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    password: '',
    confirmPassword: '',
  });

  // Inline error states
  const [fullNameError, setFullNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // ── Derived: is the form free of errors and has required fields filled? ──
  const formIsValid =
    !fullNameError &&
    !phoneError &&
    !passwordError &&
    !confirmPasswordError &&
    formData.name.trim().length > 0;

  // ── Validators ────────────────────────────────────────────────────

  const validateFullName = (value: string) => {
    const parts = value.trim().split(/\s+/);
    if (parts.length < 2 || parts.some(p => p.length <= 1)) {
      setFullNameError(t('Enter your first name and at least one other name (each more than 1 character)'));
      return false;
    }
    setFullNameError('');
    return true;
  };

  const validatePhone = (value: string) => {
    if (value && !/^0\d{10}$/.test(value.trim())) {
      setPhoneError(t(' Password must be at least 8 characters long and include both letters and numbers '));
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('');
      return true;
    }
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(value)) {
      setPasswordError(t('Password must be at least 8 characters long and include both letters and numbers.'));
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (formData.password && value !== formData.password) {
      setConfirmPasswordError(t('Passwords do not match.'));
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  // Shared input error class builder
  const inputClass = (hasError: boolean, disabled = false) =>
    `h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border font-bold text-foreground focus:ring-2 focus:ring-[#084328] shadow-sm transition-colors ${
      hasError
        ? 'border-red-500 dark:border-red-500 border-2'
        : 'border-none'
    } ${disabled ? 'bg-slate-100 dark:bg-slate-900 text-foreground/50 cursor-not-allowed' : ''}`;

  const handleUpdate = async () => {
    // Final guard
    const nameOk = validateFullName(formData.name);
    const phoneOk = validatePhone(formData.phone);
    const passwordOk = validatePassword(formData.password);
    const confirmOk = validateConfirmPassword(formData.confirmPassword);

    if (!nameOk || !phoneOk || !passwordOk || !confirmOk) return;

    setLoading(true);
    try {
      // Update password if provided
      if (formData.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (authError) throw authError;
      }

      // Update profile in DB
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name.trim(),
          phone: formData.phone.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Pass updated data back to parent immediately — no logout needed
      onUpdate({
        ...user,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error.message || "An error occurred while updating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none shadow-2xl dark:bg-slate-900 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="bg-[#084328] p-8 text-white relative">
           <div className="relative z-10">
              <h2 className="text-3xl font-black mb-1">Edit Profile</h2>
              <div className="flex items-center gap-2 opacity-80">
                 <BadgeCheck size={16} />
                 <p className="text-sm font-medium">Manage your account identity</p>
              </div>
           </div>
           <User className="absolute top-4 right-4 text-white/10 w-32 h-32" />
        </div>

        <div className="p-8 space-y-6">

          {/* Full Name — auto uppercase */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              {t('auth_full_name')}
            </Label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
               <Input 
                 value={formData.name}
                 onChange={(e) => {
                   const upper = e.target.value.toUpperCase();
                   setFormData({ ...formData, name: upper });
                   if (fullNameError) setFullNameError('');
                 }}
                 onBlur={() => validateFullName(formData.name)}
                 className={inputClass(!!fullNameError)}
               />
            </div>
            {fullNameError && <p className="text-red-500 text-sm font-medium mt-1">{fullNameError}</p>}
          </div>

          {/* Username — disabled, cannot be changed */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              {t('auth_username')}
            </Label>
            <div className="relative">
               <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/50" size={20} />
               <Input 
                 value={user.username || ''}
                 disabled
                 className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none font-bold text-foreground/50 cursor-not-allowed"
               />
            </div>
            <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase ml-1">
              <AlertCircle size={10} /> Username cannot be changed
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              {t('auth_phone')}
            </Label>
            <div className="relative group">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
               <Input 
                 value={formData.phone}
                 inputMode="numeric"
                 onChange={(e) => {
                   const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                   setFormData({ ...formData, phone: digits });
                   if (phoneError) setPhoneError('');
                 }}
                 onBlur={() => validatePhone(formData.phone)}
                 className={inputClass(!!phoneError)}
               />
            </div>
            {phoneError && <p className="text-red-500 text-sm font-medium mt-1">{phoneError}</p>}
          </div>

          {/* Password */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <div className="flex flex-col ml-1">
              <p className="text-xs font-black uppercase text-slate-400">
                Security - Update Password
              </p>
              <p className="text-[15px] text-slate-500 font-medium">
                Leave empty to skip
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
                   <Input 
                     type="password"
                     placeholder="New Password (leave empty to skip)"
                     value={formData.password}
                     onChange={(e) => {
                       setFormData({ ...formData, password: e.target.value });
                       if (passwordError) setPasswordError('');
                     }}
                     onBlur={() => validatePassword(formData.password)}
                     className={inputClass(!!passwordError)}
                   />
                </div>
                {passwordError && <p className="text-red-500 text-sm font-medium mt-1">{passwordError}</p>}
              </div>
              <div className="space-y-2">
                <div className="relative group">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
                   <Input 
                     type="password"
                     placeholder="Confirm New Password"
                     value={formData.confirmPassword}
                     onChange={(e) => {
                       setFormData({ ...formData, confirmPassword: e.target.value });
                       if (confirmPasswordError) setConfirmPasswordError('');
                     }}
                     onBlur={() => validateConfirmPassword(formData.confirmPassword)}
                     className={inputClass(!!confirmPasswordError)}
                   />
                </div>
                {confirmPasswordError && <p className="text-red-500 text-sm font-medium mt-1">{confirmPasswordError}</p>}
              </div>
            </div>
          </div>

          {/* Email — always locked */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              Email Address (Secure)
            </Label>
            <div className="relative">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/50" size={20} />
               <Input 
                 value={user.email}
                 disabled
                 className="h-14 pl-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border-none font-bold text-foreground/50 cursor-not-allowed" 
               />
            </div>
            <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase ml-1">
              <AlertCircle size={10} /> Contact support to change email
            </p>
          </div>
        </div>

        <DialogFooter className="px-8 pb-10 sm:flex-col gap-3">
          <Button 
            onClick={handleUpdate}
            disabled={loading || !formIsValid}
            className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
            {loading ? "Updating..." : "Save Changes"}
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-xl text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};