import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from './ui/dialog';
import { SecureStorage } from '../lib/security';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { 
  CreditCard, Copy, CheckCircle2, Loader2, Wallet, 
  Banknote, Smartphone, ShieldCheck, Zap, X 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const FundingModal: React.FC<FundingModalProps> = ({ isOpen, onClose, user }) => {
  const { t } = useLanguage();
  const [method, setMethod] = useState<'transfer' | 'paystack'>('transfer');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPaystackMock, setShowPaystackMock] = useState(false);

  // Reset internal state when modal closes to maintain a fresh UI
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setMethod('transfer');
      setShowPaystackMock(false);
    }
  }, [isOpen]);

  // Simulate provider sync for Bank Transfer
  useEffect(() => {
    if (isOpen && method === 'transfer') {
      setIsGenerating(true);
      const timer = setTimeout(() => setIsGenerating(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, method]);

  // Dynamic bank account generation based on user profile
  const bankDetails = {
    bank: "Wema Bank (SMRT WALLET/Monnify)",
    accountNumber: "99" + (user.phone?.replace(/\D/g, '').slice(-8) || "00000000"),
    accountName: `SMRT WALLET / ${user.name?.toUpperCase() || 'CLIENT'}`
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePaystackInitiate = () => {
    const numAmount = Number(amount);
    if (!amount || numAmount < 100) {
      toast.error("Minimum funding amount is ₦100");
      return;
    }
    setShowPaystackMock(true);
  };

  // const confirmPaystackPayment = async () => {
  //   if (loading) return;
  //   setLoading(true);

  //   try {
  //     const fundAmount = Number(amount);
  //     const txRef = 'FUND-' + Math.random().toString(36).substr(2, 9).toUpperCase();

  //     // Atomic operation via Supabase RPC to handle balance + transaction log
  //     const { data, error } = await supabase.rpc('fund_wallet_optimized', {
  //       p_user_id: user.id,
  //       p_amount: fundAmount,
  //       p_method: 'Paystack',
  //       p_tx_ref: txRef
  //     });

  //     if (error) throw error;

  //     toast.success(`Success! ₦${fundAmount.toLocaleString()} added to your wallet.`);
  //     onClose();
  //   } catch (err: any) {
  //     console.error("Funding error:", err);
  //     toast.error("Payment failed. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ... inside your component
const confirmPaystackPayment = async () => {
  if (loading) return;
  setLoading(true);

  try {
    const fundAmount = Number(amount);
    const txRef = 'FUND-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // 1. Atomic operation via Supabase RPC
    const { data, error } = await supabase.rpc('fund_wallet_optimized', {
      p_user_id: user.id,
      p_amount: fundAmount,
      p_method: 'Paystack',
      p_tx_ref: txRef
    });

    if (error) throw error;

    // 2. CRITICAL: Update the encrypted Local Storage
    // We create a copy of the user object with the NEW balance returned from the DB
    const updatedUser = { 
      ...user, 
      walletBalance: data.new_balance // Assuming your RPC returns the new balance
    };
    
    SecureStorage.setItem('smrt_user_session', updatedUser);

    // 3. UI Feedback
    toast.success(`Success! ₦${fundAmount.toLocaleString()} added to your wallet.`);
    
    // Note: You should also call a state-update function here if your parent 
    // component (Dashboard) needs to re-render immediately.
    // e.g., props.onBalanceUpdate(data.new_balance);

    onClose();
  } catch (err: any) {
    console.error("Funding error:", err);
    toast.error("Payment failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
  
  return (
    <>
      {/* Main Funding Selection Modal */}
      <Dialog open={isOpen && !showPaystackMock} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl dark:bg-slate-900">
          <div className="bg-[#084328] p-8 text-white relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-2">{t('add_money')}</h2>
              <p className="text-green-50/70 font-medium tracking-tight">Securely fund your SMRT WALLET</p>
            </div>
            <Wallet className="absolute top-4 right-4 text-white/10 w-32 h-32" />
          </div>

          <div className="p-8 space-y-8">
            {/* Method Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                onClick={() => setMethod('transfer')}
                className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
                  method === 'transfer' 
                    ? 'bg-white dark:bg-slate-700 text-[#084328] dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Bank Transfer
              </button>
              <button
                onClick={() => setMethod('paystack')}
                className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
                  method === 'paystack' 
                    ? 'bg-white dark:bg-slate-700 text-[#084328] dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Paystack
              </button>
            </div>

            {method === 'transfer' ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                {isGenerating ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="animate-spin text-[#084328]" size={40} />
                    <p className="font-bold text-slate-500 italic">Assigning virtual account...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-3xl border border-green-100 dark:border-green-900/50 shadow-sm">
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#084328]">
                              <Banknote size={20} />
                           </div>
                           <div>
                              <Label className="text-[10px] uppercase font-black text-slate-400">Bank Name</Label>
                              <p className="text-base font-black text-slate-900 dark:text-white">{bankDetails.bank}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between group bg-white/80 dark:bg-slate-800 p-4 rounded-2xl border border-green-100 dark:border-slate-700">
                          <div>
                            <Label className="text-[10px] uppercase font-black text-slate-400">Account Number</Label>
                            <p className="text-2xl font-black text-[#084328] dark:text-green-400 tabular-nums">{bankDetails.accountNumber}</p>
                          </div>
                          <Button 
                            variant="ghost" size="icon" 
                            onClick={() => handleCopy(bankDetails.accountNumber)}
                            className="rounded-xl hover:bg-[#084328] hover:text-white transition-all active:scale-90"
                          >
                            <Copy size={20} />
                          </Button>
                        </div>

                        <div className="pt-2 border-t border-green-100 dark:border-green-900/50">
                          <Label className="text-[10px] uppercase font-black text-slate-400">Account Name</Label>
                          <p className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase italic tracking-tight">{bankDetails.accountName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3 border border-blue-100/50">
                      <Smartphone className="text-blue-500 shrink-0" size={20} />
                      <p className="text-[11px] text-blue-800 dark:text-blue-300 font-bold leading-relaxed">
                        Transfer to this account from any bank app. Your SMRT WALLET balance will update automatically within 2 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-black text-sm ml-1">Amount to Top-up (₦)</Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-2xl font-black focus:ring-[#084328] pl-10"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₦</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['1000', '2000', '5000', '10000', '20000', '50000'].map((val) => (
                      <Button 
                        key={val} 
                        variant="outline" 
                        onClick={() => setAmount(val)}
                        className={`rounded-xl font-black h-12 transition-all ${amount === val ? 'bg-[#084328] text-white border-none' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        {Number(val).toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <Button 
                    onClick={handlePaystackInitiate}
                    className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/10 group active:scale-95 transition-all"
                  >
                    <CreditCard className="mr-2 group-hover:scale-110 transition-transform" />
                    Pay ₦{amount ? Number(amount).toLocaleString() : '0'}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-3">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Secured by PAYSTACK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Paystack Checkout Flow Modal */}
      <Dialog open={showPaystackMock} onOpenChange={() => setShowPaystackMock(false)}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#084328] rounded-lg flex items-center justify-center text-white">
                <Zap size={20} className="fill-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">SMRT WALLET Checkout</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{user.email}</p>
              </div>
            </div>
            <button onClick={() => setShowPaystackMock(false)} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
               <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Amount to pay</p>
               <h2 className="text-4xl font-black text-[#084328]">₦{Number(amount).toLocaleString()}</h2>
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase ml-1">Select payment method</p>
               <div className="grid gap-3">
                  <PaymentMethodItem icon={<CreditCard size={20} />} label="Pay with Card" selected />
                  <PaymentMethodItem icon={<Banknote size={20} />} label="Pay with Bank Transfer" />
                  <PaymentMethodItem icon={<Smartphone size={20} />} label="Pay with USSD" />
               </div>
            </div>

            <Button 
              onClick={confirmPaystackPayment}
              disabled={loading}
              className="w-full h-14 bg-[#084328] hover:bg-[#063a23] text-white rounded-xl font-black text-lg shadow-xl shadow-green-900/10 active:scale-95 transition-all"
            >
               {loading ? <Loader2 className="animate-spin mr-2" /> : "Complete Payment"}
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2">
               <ShieldCheck size={14} className="text-slate-400" />
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secured by Paystack Gateway</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PaymentMethodItem = ({ icon, label, selected }: { icon: any, label: string, selected?: boolean }) => (
  <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${selected ? 'border-[#084328] bg-[#084328]/5' : 'border-slate-100 hover:border-slate-200'}`}>
     <div className="flex items-center gap-4">
        <div className={selected ? 'text-[#084328]' : 'text-slate-400'}>
           {icon}
        </div>
        <span className={`font-black text-sm ${selected ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
     </div>
     {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#084328]" />}
  </div>
);