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
  onUpdate: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    phone: user.phone || '',
    password: '',
    confirmPassword: '',
  });

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error("Full name cannot be empty.");
      return;
    }

    if (formData.password) {
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    if (formData.phone && !/^\d{11}$/.test(formData.phone)) {
      toast.error("Please enter a valid 11-digit phone number.");
      return;
    }
    
    setLoading(true);
    try {
      // Update password if provided
      if (formData.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.password
        });
        if (authError) throw authError;
      }

      // Update profile info
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.name,
          username: formData.username,
          phone: formData.phone,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      onUpdate();
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
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              {t('auth_full_name')}
            </Label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
               <Input 
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-foreground focus:ring-2 focus:ring-[#084328] shadow-sm" 
               />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              {t('auth_username')}
            </Label>
            <div className="relative group">
               <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
               <Input 
                 value={formData.username}
                 onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                 className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-foreground focus:ring-2 focus:ring-[#084328] shadow-sm" 
               />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400 ml-1">
              {t('auth_phone')}
            </Label>
            <div className="relative group">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
               <Input 
                 value={formData.phone}
                 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                 className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-foreground focus:ring-2 focus:ring-[#084328] shadow-sm" 
               />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
            <p className="text-xs font-black uppercase text-slate-400 ml-1">Security - Update Password</p>
            <div className="space-y-4">
              <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
                 <Input 
                   type="password"
                   placeholder="New Password (leave empty to skip)"
                   value={formData.password}
                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                   className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-foreground focus:ring-2 focus:ring-[#084328] shadow-sm" 
                 />
              </div>
              <div className="relative group">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#084328] transition-colors" size={20} />
                 <Input 
                   type="password"
                   placeholder="Confirm New Password"
                   value={formData.confirmPassword}
                   onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                   className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-foreground focus:ring-2 focus:ring-[#084328] shadow-sm" 
                 />
              </div>
            </div>
          </div>

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
            disabled={loading}
            className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/20 active:scale-95 transition-all"
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