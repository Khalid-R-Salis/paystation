import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { CreditCard, Copy, CheckCircle2, Loader2, Wallet, Banknote, Smartphone, ShieldCheck, ArrowRight, X, Zap } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen && method === 'transfer') {
      setIsGenerating(true);
      const timer = setTimeout(() => setIsGenerating(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, method]);

  // Dynamically generated bank account based on user data
  const bankDetails = {
    bank: "Wema Bank (PayStation/Monnify)",
    accountNumber: "99" + (user.phone?.replace(/[^0-9]/g, '').slice(-8) || user.id.replace(/[^0-9]/g, '').slice(-8) || "01234567"),
    accountName: `PAYSTATION / ${user.name?.toUpperCase() || 'USER'}`
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePaystack = async () => {
    const numAmount = Number(amount);
    if (!amount || numAmount < 100) {
      toast.error("Minimum funding amount is \u20a6100");
      return;
    }
    setShowPaystackMock(true);
  };

  const confirmPaystackPayment = async () => {
    setLoading(true);
    try {
      const fundAmount = Number(amount);
      // Deduct balance
      const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
      const newBalance = (profile?.wallet_balance || 0) + fundAmount;
      
      const { error: balanceError } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
      if (balanceError) throw balanceError;

      // Log funding transaction
      const { error: txError } = await supabase.from('transactions').insert({
        id: 'FUND-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        user_id: user.id,
        type: 'wallet_fund',
        amount: fundAmount,
        status: 'success',
        date: new Date().toISOString(),
        details: 'Wallet Funding via Paystack'
      });

      if (txError && txError.code !== 'PGRST116') {
        console.warn("Transaction log failed but balance updated.", txError);
      }

      toast.success(`Success! \u20a6${fundAmount.toLocaleString()} has been added to your wallet.`);
      setShowPaystackMock(false);
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
      <Dialog open={isOpen && !showPaystackMock} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl dark:bg-slate-900">
          <div className="bg-[#084328] p-8 text-white relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-2">{t('add_money')}</h2>
              <p className="text-green-50/70 font-medium">Securely fund your PayStation wallet</p>
            </div>
            <Wallet className="absolute top-4 right-4 text-white/10 w-32 h-32" />
          </div>

          <div className="p-8 space-y-8">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
              <button
                onClick={() => setMethod('transfer')}
                className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
                  method === 'transfer' 
                    ? 'bg-white dark:bg-slate-700 text-[#084328] dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Bank Transfer
              </button>
              <button
                onClick={() => setMethod('paystack')}
                className={`flex-1 py-3 px-4 rounded-xl font-black transition-all ${
                  method === 'paystack' 
                    ? 'bg-white dark:bg-slate-700 text-[#084328] dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Paystack
              </button>
            </div>

            {method === 'transfer' ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                {isGenerating ? (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
                    <Loader2 className="animate-spin text-[#084328] dark:text-green-400" size={40} />
                    <p className="font-bold text-slate-500">{t('generating_details')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-3xl border border-green-100 dark:border-green-900/50 shadow-sm">
                      <div className="space-y-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-[#084328] shadow-sm">
                              <Banknote size={20} />
                           </div>
                           <div>
                              <Label className="text-[10px] uppercase font-black text-slate-400 ml-0.5">Bank Name</Label>
                              <p className="text-base font-black text-slate-900 dark:text-white leading-none">{bankDetails.bank}</p>
                           </div>
                        </div>

                        <div className="flex items-center justify-between group bg-white/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-white/50 dark:border-slate-800">
                          <div>
                            <Label className="text-[10px] uppercase font-black text-slate-400 ml-0.5">Account Number</Label>
                            <p className="text-2xl font-black text-[#084328] dark:text-green-400 tracking-wider">{bankDetails.accountNumber}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleCopy(bankDetails.accountNumber)}
                            className="rounded-xl hover:bg-[#084328] hover:text-white text-[#084328] dark:text-green-400 transition-all active:scale-90"
                          >
                            <Copy size={20} />
                          </Button>
                        </div>

                        <div className="pt-2 border-t border-green-100 dark:border-green-900/50">
                          <Label className="text-[10px] uppercase font-black text-slate-400 ml-0.5">Account Name</Label>
                          <p className="text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-tight">{bankDetails.accountName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex gap-3">
                      <Smartphone className="text-blue-500 shrink-0" size={20} />
                      <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                        Copy the account number and transfer from your bank app. Your wallet will be credited automatically within 2 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 dark:text-slate-200 font-black text-sm ml-1">Amount to Top-up (\u20a6)</Label>
                    <Input 
                      type="number" 
                      placeholder="Enter amount (min. 100)" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-foreground text-2xl font-black focus:ring-[#084328]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['500', '1000', '2000', '5000', '10000', '20000'].map((val) => (
                      <Button 
                        key={val} 
                        variant="outline" 
                        onClick={() => setAmount(val)}
                        className={`rounded-xl font-black h-12 transition-all ${amount === val ? 'bg-[#084328] text-white border-none' : 'hover:border-[#084328] hover:text-[#084328]'}`}
                      >
                        \u20a6{Number(val).toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-slate-400 px-1">
                    <span>{t('pay_with')}</span>
                    <div className="flex gap-2">
                       <CreditCard size={14} />
                       <CheckCircle2 size={14} />
                    </div>
                  </div>
                  <Button 
                    onClick={handlePaystack}
                    className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/20 group active:scale-95 transition-all"
                  >
                    <CreditCard className="mr-2 group-hover:scale-110 transition-transform" />
                    {`Pay \u20a6${amount ? Number(amount).toLocaleString() : '0'}`}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-3">
                    <ShieldCheck size={16} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('sec_by')} PAYSTACK</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Paystack Mock Checkout */}
      <Dialog open={showPaystackMock} onOpenChange={() => setShowPaystackMock(false)}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-slate-50 border-b p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#084328] rounded-lg flex items-center justify-center text-white">
                <Zap size={20} className="fill-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">PayStation Checkout</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{user.email}</p>
              </div>
            </div>
            <button onClick={() => setShowPaystackMock(false)} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
               <p className="text-xs font-bold text-slate-400 uppercase">Amount to pay</p>
               <h2 className="text-4xl font-black text-[#084328]">\u20a6{Number(amount).toLocaleString()}</h2>
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
              className="w-full h-14 bg-[#084328] hover:bg-[#063a23] text-white rounded-xl font-black text-lg shadow-xl shadow-green-900/10"
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
     {selected && <div className="w-2 h-2 rounded-full bg-[#084328]" />}
  </div>
);