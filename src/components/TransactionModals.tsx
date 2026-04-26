import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { 
  Loader2, Smartphone, Wifi, BookOpen, Tv, CreditCard, 
  MessageSquare, Send, Search, CheckCircle2, ChevronRight,
  ArrowRight, ShieldCheck, Zap, Plane, Calendar, MapPin, AlertCircle
} from 'lucide-react';

const NETWORKS = [
  { id: 'mtn', name: 'MTN', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/mtn-logo-new-8f041ca2-1776680499445.webp' },
  { id: 'airtel', name: 'Airtel', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/airtel-logo-new-b8b1d852-1776680498793.webp' },
  { id: 'glo', name: 'GLO', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/glo-logo-new-f9404ab2-1776680499878.webp' },
  { id: '9mobile', name: '9Mobile', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/9mobile-logo-new-51dafa7b-1776680501776.webp' },
];

const DATA_PLANS: Record<string, any[]> = {
  mtn: [
    { id: 'm1', name: '1.5GB Monthly', price: 1000, validity: '30 Days' },
    { id: 'm2', name: '2GB Monthly', price: 1200, validity: '30 Days' },
    { id: 'm3', name: '5GB Monthly', price: 2500, validity: '30 Days' },
  ],
  airtel: [
    { id: 'a1', name: '1.5GB Monthly', price: 1000, validity: '30 Days' },
    { id: 'a2', name: '2GB Monthly', price: 1200, validity: '30 Days' },
  ],
  glo: [
    { id: 'g1', name: '1.5GB Monthly', price: 900, validity: '30 Days' },
    { id: 'g2', name: '2.5GB Monthly', price: 1350, validity: '30 Days' },
  ],
  '9mobile': [
    { id: '9-1', name: '1.5GB Monthly', price: 1000, validity: '30 Days' },
  ]
};

const EXAM_PROVIDERS = [
  { id: 'waec', name: 'WAEC Result Checker', price: 3800 },
  { id: 'neco', name: 'NECO Token', price: 1200 },
  { id: 'nabteb', name: 'NABTEB Pin', price: 1100 },
];

const BILL_PROVIDERS = {
  electricity: [
    { id: 'ikedc', name: 'Ikeja Electric (IKEDC)' },
    { id: 'ekedc', name: 'Eko Electric (EKEDC)' },
    { id: 'kaedco', name: 'Kaduna Electric (KAEDCO)' },
    { id: 'jed', name: 'Jos Electric (JED)' },
    { id: 'phed', name: 'Port Harcourt Electric (PHED)' },
  ],
  cable: [
    { id: 'dstv', name: 'DSTV', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/dstv-logo-new-d1e409f1-1776680500095.webp' },
    { id: 'gotv', name: 'GOTV', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/gotv-logo-new-5488dcb3-1776680499005.webp' },
    { id: 'startimes', name: 'StarTimes', logo: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/startimes-logo-new-c3be90ee-1776680500028.webp' },
    { id: 'tstv', name: 'TSTV', logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TSTV' },
  ]
};

const CABLE_PACKAGES: Record<string, any[]> = {
  startimes: [
    { id: 's1', name: 'Nova Weekly', price: 600 },
    { id: 's2', name: 'Basic Monthly', price: 2100 },
    { id: 's3', name: 'Classic Monthly', price: 3100 },
  ],
  dstv: [
    { id: 'd1', name: 'DStv Padi', price: 2950 },
    { id: 'd2', name: 'DStv Yanga', price: 4200 },
  ],
  gotv: [
    { id: 'g1', name: 'GOtv Jinja', price: 2250 },
    { id: 'g2', name: 'GOtv Jolli', price: 3300 },
  ]
};

interface TransactionModalProps {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ type, isOpen, onClose, user }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({});
      setSearchQuery('');
    }
  }, [isOpen]);

  const validateFields = () => {
    if (type === 'airtime' && (!formData.network || !formData.phone || !formData.amount)) return false;
    if (type === 'data' && (!formData.network || !formData.phone || !formData.plan)) return false;
    if (type === 'exam' && (!formData.provider || !formData.quantity)) return false;
    if (type === 'bills' || type === 'electricity') {
      if (!formData.provider || !formData.meterType || !formData.meterNumber || !formData.amount) return false;
    }
    if (type === 'cable' && (!formData.cableProvider || !formData.card || !formData.pkg)) return false;
    if (type === 'cash' && (!formData.network || !formData.amount || !formData.senderPhone)) return false;
    if (type === 'sms' && (!formData.senderId || !formData.recipients || !formData.message)) return false;
    if (type === 'flight' && (!formData.from || !formData.to || !formData.date || !formData.passengers)) return false;
    return true;
  };

  const handleNext = () => {
    if (!validateFields()) {
       toast.error("Please fill all required fields correctly.");
       return;
    }
    setStep(2);
  };

  const handleProcess = async () => {
    if (Number(formData.amount) > user.walletBalance && !['cash', 'flight'].includes(type)) {
      toast.error("Insufficient wallet balance. Please fund your wallet.");
      return;
    }

    setLoading(true);
    try {
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success("Transaction Successful! Details have been sent to your email.");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderConfirmation = () => (
    <div className="space-y-6 animate-in zoom-in-95 duration-300">
       <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-3xl border border-green-100 dark:border-green-900/50 shadow-sm">
          <h4 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Transaction Summary</h4>
          <div className="space-y-3">
             {Object.entries(formData).map(([key, val]: [string, any]) => {
                if (key === 'plan' && type === 'data') {
                   const plan = DATA_PLANS[formData.network]?.find(p => p.id === val);
                   return <SummaryItem key={key} label="Plan" value={plan?.name} />;
                }
                if (key === 'provider' && type === 'exam') {
                   const p = EXAM_PROVIDERS.find(x => x.id === val);
                   return <SummaryItem key={key} label="Body" value={p?.name} />;
                }
                if (key === 'cableProvider') {
                   const p = BILL_PROVIDERS.cable.find(x => x.id === val);
                   return <SummaryItem key={key} label="Cable" value={p?.name} />;
                }
                if (['network', 'phone', 'amount', 'meterNumber', 'card', 'senderId', 'senderPhone', 'from', 'to', 'date', 'passengers'].includes(key)) {
                   const displayValue = key === 'network' ? val.toUpperCase() : val;
                   return <SummaryItem key={key} label={key.replace(/([A-Z])/g, ' $1').toUpperCase()} value={displayValue} />;
                }
                return null;
             })}
             <div className="pt-3 mt-3 border-t border-green-100 dark:border-green-900/50">
                <SummaryItem label="TOTAL PAYABLE" value={`\u20a6${Number(formData.amount || 0).toLocaleString()}`} highlight />
             </div>
          </div>
       </div>
       <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl">
          <ShieldCheck className="text-blue-500" size={20} />
          <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase leading-relaxed">
            Secure Payment via PayStation Wallet. Transaction encrypted with 256-bit SSL.
          </p>
       </div>
    </div>
  );

  const renderContent = () => {
    if (step === 2) return renderConfirmation();

    switch (type) {
      case 'airtime':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {NETWORKS.map((net) => (
                <button
                  key={net.id}
                  onClick={() => setFormData({ ...formData, network: net.id })}
                  className={`p-1.5 rounded-2xl border-2 transition-all active:scale-95 ${ 
                    formData.network === net.id ? 'border-[#084328] bg-[#084328]/5 dark:bg-green-900/20 shadow-inner' : 'border-slate-100 dark:border-slate-800' 
                  }`}
                >
                  <img src={net.logo} alt={net.name} className="w-full aspect-square object-contain rounded-xl shadow-sm" />
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Recipient Phone Number</Label>
                <Input 
                  placeholder="e.g. 08123456789" 
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus:ring-2 focus:ring-[#084328] shadow-sm" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Amount (\u20a6)</Label>
                <Input 
                  type="number" 
                  placeholder="Enter amount" 
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus:ring-2 focus:ring-[#084328] shadow-sm" 
                />
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {NETWORKS.map((net) => (
                <button
                  key={net.id}
                  onClick={() => setFormData({ ...formData, network: net.id, plan: '' })}
                  className={`p-1.5 rounded-2xl border-2 transition-all active:scale-95 ${ 
                    formData.network === net.id ? 'border-[#084328] bg-[#084328]/5 dark:bg-green-900/20 shadow-inner' : 'border-slate-100 dark:border-slate-800' 
                  }`}
                >
                  <img src={net.logo} alt={net.name} className="w-full aspect-square object-contain rounded-xl shadow-sm" />
                </button>
              ))}
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Data Plan Selection</Label>
                <Select 
                  value={formData.plan} 
                  onValueChange={(val) => {
                    const plan = DATA_PLANS[formData.network]?.find(p => p.id === val);
                    setFormData({ ...formData, plan: val, amount: plan?.price });
                  }}
                  disabled={!formData.network}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm">
                    <SelectValue placeholder="Select Data Plan" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {formData.network && DATA_PLANS[formData.network]?.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id} className="rounded-xl font-bold p-3">{plan.name} - \u20a6{plan.price} ({plan.validity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Recipient Phone Number</Label>
                <Input 
                  placeholder="e.g. 08123456789" 
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-lg focus:ring-2 focus:ring-[#084328] shadow-sm" 
                />
              </div>
            </div>
          </div>
        );
      case 'bills':
      case 'electricity':
        return (
          <div className="space-y-5 animate-in slide-in-from-bottom-2">
             <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Electricity Disco</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, provider: val })}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm">
                    <SelectValue placeholder="Select Disco Provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {BILL_PROVIDERS.electricity.map((p) => <SelectItem key={p.id} value={p.id} className="rounded-xl font-bold p-3">{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setFormData({ ...formData, meterType: 'prepaid' })}
                  className={`h-14 rounded-2xl border-2 font-black transition-all ${formData.meterType === 'prepaid' ? 'border-[#084328] bg-[#084328]/5' : 'border-slate-100 dark:border-slate-800'}`}
                >
                  PREPAID
                </button>
                <button 
                  onClick={() => setFormData({ ...formData, meterType: 'postpaid' })}
                  className={`h-14 rounded-2xl border-2 font-black transition-all ${formData.meterType === 'postpaid' ? 'border-[#084328] bg-[#084328]/5' : 'border-slate-100 dark:border-slate-800'}`}
                >
                  POSTPAID
                </button>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Meter Number</Label>
                <Input 
                  placeholder="Enter your meter number" 
                  onChange={(e) => setFormData({ ...formData, meterNumber: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Payment Amount (\u20a6)</Label>
                <Input 
                  type="number" 
                  placeholder="Min. 1000" 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm" 
                />
              </div>
          </div>
        );
      case 'cable':
        if (!formData.cableProvider) {
          return (
            <div className="space-y-5 animate-in slide-in-from-right-2">
               <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <Input 
                    placeholder="Search cable provider..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm"
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {BILL_PROVIDERS.cable.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setFormData({ ...formData, cableProvider: p.id })}
                      className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all active:scale-95 shadow-sm"
                    >
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
                         <img src={p.logo} alt={p.name} className="w-12 h-12 object-contain rounded-lg" />
                      </div>
                      <span className="font-black text-xs uppercase tracking-tight">{p.name}</span>
                    </button>
                  ))}
               </div>
            </div>
          );
        }
        return (
          <div className="space-y-5 animate-in slide-in-from-right-2">
             <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl mb-2 shadow-sm">
                <img src={BILL_PROVIDERS.cable.find(x => x.id === formData.cableProvider)?.logo} className="w-12 h-12 object-contain rounded-lg" alt="logo" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Provider</p>
                   <p className="text-lg font-black">{BILL_PROVIDERS.cable.find(x => x.id === formData.cableProvider)?.name}</p>
                </div>
                <Button variant="ghost" size="sm" className="ml-auto text-[#084328] font-bold" onClick={() => setFormData({ ...formData, cableProvider: null })}>Change</Button>
             </div>
             <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">SmartCard / IUC Number</Label>
                <Input 
                  placeholder="Enter your card number" 
                  onChange={(e) => setFormData({ ...formData, card: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm"
                />
             </div>
             <div className="space-y-3">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Subscription Package</Label>
                <div className="grid gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                   {(CABLE_PACKAGES[formData.cableProvider] || []).map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setFormData({ ...formData, pkg: pkg.id, amount: pkg.price })}
                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${formData.pkg === pkg.id ? 'border-[#084328] bg-[#084328]/5 shadow-sm' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                         <div className="text-left">
                            <p className="font-black text-slate-900 dark:text-white text-sm">{pkg.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Subscription Plan</p>
                         </div>
                         <p className="font-black text-[#084328]">\u20a6{pkg.price.toLocaleString()}</p>
                      </button>
                   ))}
                </div>
             </div>
          </div>
        );
      case 'exam':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Exam Body</Label>
                <Select onValueChange={(val) => {
                  const p = EXAM_PROVIDERS.find(x => x.id === val);
                  setFormData({ ...formData, provider: val, unitPrice: p?.price });
                }}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {EXAM_PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id} className="rounded-xl font-bold p-3">{p.name} - \u20a6{p.price}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Quantity (Pins)</Label>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="How many pins?" 
                  value={formData.quantity || ''}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setFormData({ ...formData, quantity: qty, amount: (formData.unitPrice || 0) * qty });
                  }}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm" 
                />
              </div>
              {formData.amount > 0 && (
                <div className="bg-[#084328]/5 p-5 rounded-2xl flex justify-between items-center border border-[#084328]/10 shadow-sm">
                   <span className="font-bold text-slate-600 dark:text-slate-400">Total Cost:</span>
                   <span className="text-2xl font-black text-[#084328] dark:text-green-400">\u20a6{formData.amount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'cash':
        return (
          <div className="space-y-6 animate-in slide-in-from-left-2">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-3xl border border-orange-100 dark:border-orange-900/30 flex gap-4 shadow-sm">
               <Zap className="text-orange-500 shrink-0" size={24} />
               <p className="text-[10px] font-black text-orange-800 dark:text-orange-300 uppercase leading-relaxed">
                 Airtime to Cash fee is 20%. Receive \u20a6800 for every \u20a61,000 sent. Funds settled instantly to wallet.
               </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Airtime Network</Label>
                <Select onValueChange={(val) => setFormData({ ...formData, network: val })}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm">
                    <SelectValue placeholder="Select Network" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {NETWORKS.map((n) => <SelectItem key={n.id} value={n.id} className="rounded-xl font-bold p-3">{n.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="font-black text-xs uppercase text-slate-400 ml-1">Airtime Amount (\u20a6)</Label>
                    <Input 
                      type="number" 
                      placeholder="Min. 500" 
                      onChange={(e) => {
                        const amt = Number(e.target.value);
                        setFormData({ ...formData, amount: amt, receive: amt * 0.8 });
                      }}
                      className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm" 
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="font-black text-xs uppercase text-slate-400 ml-1">Wallet Payout</Label>
                    <div className="h-14 rounded-2xl bg-green-50 dark:bg-green-950/20 flex items-center px-4 font-black text-[#084328] dark:text-green-400 border border-green-100/50 dark:border-green-900/50">
                       \u20a6{formData.receive?.toLocaleString() || 0}
                    </div>
                 </div>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Sender Phone Number</Label>
                <Input 
                  placeholder="Phone you're sending from" 
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm" 
                />
              </div>
            </div>
          </div>
        );
      case 'sms':
        return (
          <div className="space-y-5 animate-in slide-in-from-bottom-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Sender ID (Max 11 chars)</Label>
                <Input 
                  placeholder="e.g. PAYSTATION" 
                  maxLength={11} 
                  onChange={(e) => setFormData({ ...formData, senderId: e.target.value.toUpperCase() })}
                  className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold uppercase shadow-sm" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Recipients (Separated by comma)</Label>
                <textarea 
                  className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm focus:ring-2 focus:ring-[#084328] shadow-sm"
                  placeholder="08123456789, 09012345678"
                  onChange={(e) => {
                    const rec = e.target.value.split(',').filter(x => x.trim());
                    setFormData({ ...formData, recipients: e.target.value, count: rec.length });
                  }}
                ></textarea>
                {formData.count > 0 && <p className="text-[10px] font-black uppercase text-slate-400 mt-1 ml-1">{formData.count} Recipient(s) detected</p>}
              </div>
              <div className="space-y-2">
                <Label className="font-black text-xs uppercase text-slate-400 ml-1">Message Content</Label>
                <textarea 
                  className="w-full min-h-[120px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-sm focus:ring-2 focus:ring-[#084328] shadow-sm"
                  placeholder="Type your message here..."
                  onChange={(e) => {
                    const len = e.target.value.length;
                    const pages = Math.ceil(len / 160) || 1;
                    const cost = (formData.count || 0) * (pages * 4);
                    setFormData({ ...formData, message: e.target.value, chars: len, amount: cost, pages });
                  }}
                ></textarea>
                <div className="flex justify-between mt-1 px-1">
                   <span className="text-[10px] font-black uppercase text-slate-400">{formData.chars || 0} Characters ({formData.pages || 1} page)</span>
                   <span className="text-xs font-black text-[#084328] dark:text-green-400">Estimated Cost: \u20a6{formData.amount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'flight':
        return (
          <div className="space-y-5 animate-in slide-in-from-bottom-2">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase text-slate-400 ml-1">Departure City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="From (e.g. Lagos)" 
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase text-slate-400 ml-1">Destination City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="To (e.g. Abuja)" 
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase text-slate-400 ml-1">Travel Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      type="date"
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-black text-xs uppercase text-slate-400 ml-1">Passengers</Label>
                  <Input 
                    type="number"
                    min="1"
                    placeholder="1"
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold shadow-sm"
                  />
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                <AlertCircle className="text-blue-500 shrink-0" size={20} />
                <p className="text-[10px] font-bold text-blue-800 dark:text-blue-300">
                  Flight bookings require manual confirmation by our travel agents. You will be contacted with pricing details after submission.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'airtime': return 'Buy Airtime';
      case 'data': return 'Buy Data';
      case 'exam': return 'Exam Result Pins';
      case 'bills':
      case 'electricity': return 'Electricity Bill';
      case 'cable': return 'Cable TV Sub';
      case 'cash': return 'Airtime to Cash';
      case 'sms': return 'Bulk SMS';
      case 'flight': return 'Flight Booking';
      default: return 'Service';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'airtime': return <Smartphone className="text-blue-500" />;
      case 'data': return <Wifi className="text-[#084328]" />;
      case 'exam': return <BookOpen className="text-orange-500" />;
      case 'bills':
      case 'electricity': return <Zap className="text-yellow-500" />;
      case 'cable': return <Tv className="text-purple-500" />;
      case 'cash': return <CreditCard className="text-teal-500" />;
      case 'sms': return <MessageSquare className="text-red-500" />;
      case 'flight': return <Plane className="text-sky-600" />;
      default: return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none shadow-2xl dark:bg-slate-900 overflow-hidden">
        <div className="bg-slate-50 dark:bg-slate-800/30 p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-slate-900 dark:text-white">
              {getIcon()}
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-black dark:text-white leading-tight">{getTitle()}</DialogTitle>
              <div className="flex items-center gap-2">
                 <Badge className="bg-[#084328]/10 text-[#084328] border-none font-black text-[10px] uppercase tracking-wider">
                   Step {step} of 2
                 </Badge>
                 <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">VTU Engine v2.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 pb-10">
          {renderContent()}
        </div>

        <DialogFooter className="px-8 pb-8 sm:flex-col gap-3">
          {step === 1 ? (
            <Button 
              onClick={handleNext}
              className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/20 active:scale-95 transition-all"
            >
              {type === 'flight' ? 'Request Quote' : 'Continue to Payment'} <ArrowRight className="ml-2" size={20} strokeWidth={3} />
            </Button>
          ) : (
            <Button 
              onClick={handleProcess}
              disabled={loading}
              className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl font-black text-xl shadow-xl shadow-green-900/20 active:scale-95 transition-all"
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
              {loading ? "Securing Transaction..." : (type === 'flight' ? "Submit Request" : "Confirm & Fund Wallet")}
            </Button>
          )}
          <Button variant="ghost" onClick={step === 2 ? () => setStep(1) : onClose} className="w-full h-12 rounded-xl text-slate-500 font-black hover:bg-slate-100 dark:hover:bg-slate-800">
            {step === 2 ? "Go Back" : "Discard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SummaryItem = ({ label, value, highlight }: { label: string, value: any, highlight?: boolean }) => (
  <div className="flex justify-between items-center">
     <span className={`text-[10px] font-black uppercase tracking-wider ${highlight ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{label}</span>
     <span className={`font-black uppercase tracking-tight ${highlight ? 'text-2xl text-[#084328] dark:text-green-400' : 'text-sm text-slate-700 dark:text-slate-200'}`}>{value || '---'}</span>
  </div>
);