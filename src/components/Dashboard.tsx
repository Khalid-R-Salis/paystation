import React, { useState } from 'react';
import { 
  Zap, Smartphone, Wifi, BookOpen, MessageSquare, 
  CreditCard, Users, History, User, Home, Bell, LogOut, Plus, 
  Search, ChevronRight, Moon, Sun, Settings, Lightbulb, Tv, Languages, Plane, Copy, Check, Menu
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from './ui/dialog';
import { toast } from 'sonner';
import { User as UserType } from '../types';
import { useLanguage, Language, languages } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { TransactionModal } from './TransactionModals';
import { FundingModal } from './FundingModal';
import { EditProfileModal } from './EditProfileModal';
import { AgentUpgradeModal } from './AgentUpgradeModal';

const SERVICES = (t: any) => [
  { id: 'data', name: t('serv_data'), icon: Wifi, color: 'bg-[#084328]' },
  { id: 'airtime', name: t('serv_airtime'), icon: Smartphone, color: 'bg-blue-500' },
  { id: 'cable', name: t('serv_cable'), icon: Tv, color: 'bg-purple-500' },
  { id: 'electricity', name: t('serv_electricity'), icon: Zap, color: 'bg-yellow-500' },
  { id: 'exam', name: t('serv_exam_pins'), icon: BookOpen, color: 'bg-orange-500' },
  { id: 'cash', name: t('serv_airtime_cash'), icon: CreditCard, color: 'bg-teal-500' },
  { id: 'sms', name: t('serv_bulk_sms'), icon: MessageSquare, color: 'bg-red-500' },
  { id: 'flight', name: t('serv_flight'), icon: Plane, color: 'bg-sky-600' },
];

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, isDarkMode, toggleTheme }) => {
  const { t, setLanguage, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [activeService, setActiveService] = useState<string | null>(null);
  const [showFunding, setShowFunding] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAgentUpgrade, setShowAgentUpgrade] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 md:pb-0 md:pl-64 transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 z-40">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-[#084328] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/10">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('app_name')}</h1>
        </div>

        <div className="space-y-2 flex-1">
          <SidebarLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label={t('home')} />
          <SidebarLink active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={History} label={t('dashboard_transactions')} />
          <SidebarLink active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label={t('dashboard_profile')} />
        </div>

        <div className="mb-6 px-2 space-y-3">
           <LanguageSelector variant="outline" className="w-full justify-start" showLabel />
           <Button 
             variant="outline" 
             className="w-full justify-start gap-3 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-foreground"
             onClick={toggleTheme}
           >
             {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-blue-500" />}
             {isDarkMode ? t('light_mode') : t('dark_mode')}
           </Button>
        </div>

        <button onClick={onLogout} className="flex items-center gap-3 px-6 py-4 text-slate-500 hover:text-red-600 font-black text-lg transition-colors">
          <LogOut size={20} /> {t('dashboard_logout')}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-6 md:pt-10">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight mb-1">Hi {user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t('ready_trans')}</p>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <Button variant="outline" size="icon" className="hidden md:inline-flex rounded-2xl w-12 h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm relative shrink-0">
              <Bell size={22} className="text-slate-600 dark:text-slate-400" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
            </Button>
            <Avatar className="hidden md:flex w-12 h-12 border-2 border-[#084328] shadow-lg shrink-0 cursor-pointer hover:scale-105 transition-transform" onClick={() => setActiveTab('profile')}>
              <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                <User size={24} className="text-[#084328]" />
              </AvatarFallback>
            </Avatar>
            <div className="flex md:hidden items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm text-slate-600 dark:text-slate-400 focus:outline-none">
                    <Menu size={22} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-2 border-none shadow-2xl dark:bg-slate-900">
                  <DropdownMenuLabel className="px-4 py-2 text-xs font-black uppercase text-slate-400">Menu</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={toggleTheme}
                    className="rounded-xl p-3 font-bold flex items-center gap-3 focus:bg-[#084328]/10 focus:text-[#084328]"
                  >
                    {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-500" />}
                    <span>{isDarkMode ? t('light_mode') : t('dark_mode')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2 border-slate-200 dark:border-slate-800" />
                  <DropdownMenuLabel className="px-4 py-2 text-xs font-black uppercase text-slate-400">Language</DropdownMenuLabel>
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <DropdownMenuItem 
                      key={lang} 
                      onClick={() => {
                        setLanguage(lang);
                        toast.success(`Language changed to ${languages[lang].name}`);
                      }}
                      className={`rounded-xl p-3 font-bold flex items-center gap-3 focus:bg-[#084328]/10 focus:text-[#084328] ${language === lang ? 'bg-[#084328]/10 text-[#084328]' : ''}`}
                    >
                      <span>{languages[lang].flag}</span>
                      <span>{languages[lang].name}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="my-2 border-slate-200 dark:border-slate-800" />
                  <DropdownMenuItem 
                    onClick={() => {}}
                    className="rounded-xl p-3 font-bold flex items-center gap-3 focus:bg-[#084328]/10 focus:text-[#084328]"
                  >
                    <Bell size={18} />
                    <span>{t('notifications')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setActiveTab('profile')}
                    className="rounded-xl p-3 font-bold flex items-center gap-3 focus:bg-[#084328]/10 focus:text-[#084328]"
                  >
                    <User size={18} />
                    <span>{t('dashboard_profile')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {activeTab === 'home' && (
          <HomeView 
            user={user} 
            onOpenService={setActiveService} 
            onOpenFunding={() => setShowFunding(true)} 
            onViewAllServices={() => setShowServicesModal(true)}
            onViewAllTransactions={() => setActiveTab('transactions')}
          />
        )}
        {activeTab === 'transactions' && <TransactionsView />}
        {activeTab === 'profile' && <ProfileView user={user} onEditProfile={() => setShowEditProfile(true)} onUpgradeAgent={() => setShowAgentUpgrade(true)} />}
      </main>

      {/* Modals */}
      <TransactionModal 
        type={activeService || ''} 
        isOpen={activeService !== null} 
        onClose={() => setActiveService(null)} 
        user={user}
      />
      <FundingModal 
        isOpen={showFunding} 
        onClose={() => setShowFunding(false)} 
        user={user} 
      />
      <EditProfileModal 
        isOpen={showEditProfile} 
        onClose={() => setShowEditProfile(false)} 
        user={user} 
        onUpdate={() => {}}
      />
      <AgentUpgradeModal 
        isOpen={showAgentUpgrade} 
        onClose={() => setShowAgentUpgrade(false)} 
        user={user} 
      />

      {/* Services Overlay Modal */}
      <Dialog open={showServicesModal} onOpenChange={setShowServicesModal}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-8 border-none shadow-2xl dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">{t('all_services')}</DialogTitle>
            <DialogDescription className="font-medium">Access all our instant digital services</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {SERVICES(t).map((service) => (
              <ServiceCard 
                key={service.id} 
                service={service} 
                onClick={() => {
                  setShowServicesModal(false);
                  setActiveService(service.id);
                }} 
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 bg-slate-900/95 dark:bg-slate-900/90 backdrop-blur-lg rounded-[2.5rem] px-8 py-4 flex justify-between items-center z-50 shadow-2xl border border-white/5">
        <MobileNavLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} />
        <MobileNavLink active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} icon={History} />
        <div className="relative -top-10">
          <Button 
            onClick={() => setShowServicesModal(true)} 
            className="w-16 h-16 rounded-full bg-[#084328] shadow-2xl shadow-green-600/40 hover:bg-[#063a23] flex items-center justify-center p-0 border-4 border-slate-50 dark:border-slate-950 active:scale-90 transition-transform"
          >
            <Plus className="text-white" size={32} />
          </Button>
        </div>
        <MobileNavLink active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} />
        <button onClick={onLogout} className="p-3 text-red-400 active:scale-90 transition-transform">
          <LogOut size={26} />
        </button>
      </nav>
    </div>
  );
};

const HomeView = ({ 
  user, onOpenService, onOpenFunding, onViewAllServices, onViewAllTransactions 
}: { 
  user: UserType, onOpenService: (id: string) => void, onOpenFunding: () => void, onViewAllServices: () => void, onViewAllTransactions: () => void 
}) => {
  const { t } = useLanguage();
  const services = SERVICES(t);
  
  // Initial quick services: DATA, AIRTIME, CABLE, ELECTRICITY
  const quickServices = services.filter(s => ['data', 'airtime', 'cable', 'electricity'].includes(s.id));

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
     

<Card className="bg-[#084328] border-none text-white shadow-2xl shadow-green-600/20 overflow-hidden relative rounded-[2.5rem]">
  <div className="absolute top-0 right-0 p-8 opacity-10">
    <Zap size={180} className="fill-white" />
  </div>
  <CardContent className="p-8 md:p-10 relative z-10">
    <div className="flex justify-between items-start mb-10">
      <div>
        <p className="text-green-50/80 text-base md:text-lg font-bold mb-2">{t('wallet_balance')}</p>
        {/* Using direct ₦ and tabular-nums to prevent "jitter" when numbers update */}
        <h3 className="text-4xl md:text-5xl font-black tracking-tight tabular-nums">
          ₦{(user.walletBalance || 0).toLocaleString()}
        </h3>
      </div>
      <Badge className="bg-white/20 backdrop-blur-md text-white border-none py-1.5 px-4 rounded-full font-bold">
        {(user.role || 'user').toUpperCase()}
      </Badge>
    </div>
    
    <div className="flex gap-4">
      <Button 
        onClick={onOpenFunding} 
        className="bg-white text-[#084328] hover:bg-slate-100 flex-1 h-14 md:h-16 rounded-2xl font-black text-lg md:text-xl shadow-xl shadow-green-900/10 border-none transition-all active:scale-[0.98]"
      >
        <Plus className="mr-2" size={20} strokeWidth={3} /> {t('add_money')}
      </Button>
    </div>
  </CardContent>
</Card>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-black text-slate-900 dark:text-white text-xl md:text-2xl">{t('quick_services')}</h4>
          <Button variant="link" onClick={onViewAllServices} className="text-[#084328] font-black p-0 text-base md:text-lg">{t('view_all')}</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {quickServices.map((service) => (
            <ServiceCard key={service.id} service={service} onClick={() => onOpenService(service.id)} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pb-10">
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-black text-slate-900 dark:text-white text-xl md:text-2xl">{t('recent_activity')}</h4>
              <Button variant="link" onClick={onViewAllTransactions} className="text-[#084328] font-black p-0 text-base md:text-lg">{t('see_all')}</Button>
            </div>
            <Card className="border-none shadow-sm dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 p-2 border border-slate-100 dark:border-slate-800">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-2xl group cursor-pointer">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center ${i % 2 === 0 ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-[#084328]/10 text-[#084328]'}`}>
                      {i % 2 === 0 ? <Wifi size={24} /> : <Smartphone size={24} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-base md:text-lg">{i % 2 === 0 ? t('serv_data') : t('serv_airtime')} {t('purchase')}</p>
                      <p className="text-slate-400 font-medium text-xs md:text-sm">Oct {20+i}, 2023 \u2022 12:3{i} PM</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-white text-base md:text-lg">6{(500 * i).toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase text-[#084328] bg-[#084328]/10 px-2 py-0.5 rounded-full inline-block">{t('success')}</p>
                  </div>
                </div>
              ))}
            </Card>
         </div>
         
         <div className="space-y-6">
            <h4 className="font-black text-slate-900 dark:text-white text-xl md:text-2xl">{t('promotions')}</h4>
            <Card className="bg-slate-900 dark:bg-slate-900 border border-white/5 text-white p-8 relative overflow-hidden rounded-[2rem] h-full min-h-[250px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#084328]/30 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="relative z-10 space-y-4">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Users className="text-green-400" size={28} />
                 </div>
                 <h4 className="font-black text-2xl leading-tight">{t('promo_title')}</h4>
                 <p className="text-slate-400 font-medium text-sm">{t('promo_desc')}</p>
                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                    <span className="font-black text-[#084328] bg-white px-3 py-1 rounded-lg text-sm tracking-widest">{user.referralCode}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        navigator.clipboard.writeText(user.referralCode || '');
                        toast.success(t('copied'));
                      }}
                      className="text-white hover:bg-white/10"
                    >
                      <Copy size={16} />
                    </Button>
                 </div>
              </div>
              <Button 
                onClick={() => {
                   navigator.clipboard.writeText(user.referralCode || '');
                   toast.success(t('copied'));
                }}
                className="w-full bg-[#084328] hover:bg-[#063a23] h-14 rounded-2xl font-black text-lg relative z-10 shadow-xl shadow-green-600/40 text-white border-none mt-4"
              >
                {t('get_link')}
              </Button>
            </Card>
         </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onClick }: { service: any, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-3 md:gap-4 p-5 md:p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-50 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-green-900/5 transition-all group relative overflow-hidden"
    >
      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${service.color} text-white shadow-lg shadow-current/20`}>
        <service.icon size={28} />
      </div>
      <span className="text-slate-900 dark:text-white font-black text-sm md:text-base">{service.name}</span>
    </button>
  );
};

const TransactionsView = () => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const mockTransactions = [
    { id: 'PAY-78219', type: 'data', amount: 1200, date: 'Oct 20, 2023', status: 'success' },
    { id: 'PAY-78220', type: 'cable', amount: 2400, date: 'Oct 19, 2023', status: 'success' },
    { id: 'PAY-78221', type: 'electricity', amount: 3600, date: 'Oct 18, 2023', status: 'success' },
    { id: 'PAY-78222', type: 'airtime', amount: 500, date: 'Oct 17, 2023', status: 'success' },
    { id: 'PAY-78223', type: 'sms', amount: 100, date: 'Oct 16, 2023', status: 'success' },
  ];

  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch = tx.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{t('dashboard_transactions')}</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input 
              className="pl-12 h-14 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm text-foreground"
              placeholder={t('search_trans')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-14 w-full sm:w-44 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-foreground">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              <SelectItem value="all" className="font-bold">All Types</SelectItem>
              <SelectItem value="airtime" className="font-bold">Airtime</SelectItem>
              <SelectItem value="data" className="font-bold">Data</SelectItem>
              <SelectItem value="cable" className="font-bold">Cable TV</SelectItem>
              <SelectItem value="electricity" className="font-bold">Electricity</SelectItem>
              <SelectItem value="sms" className="font-bold">Bulk SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card className="border-none shadow-sm dark:shadow-none rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 p-4">
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {filteredTransactions.map((tx, i) => (
            <div key={i} className="p-4 md:p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer rounded-2xl group">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-green-600/10 group-hover:text-green-600 transition-colors">
                  {tx.type === 'cable' ? <Tv size={24} /> : tx.type === 'data' ? <Wifi size={24} /> : tx.type === 'airtime' ? <Smartphone size={24} /> : <Zap size={24} />}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-base md:text-lg leading-tight uppercase">{tx.type}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-xs md:text-sm">TXID: {tx.id} \u2022 {tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-900 dark:text-white text-base md:text-lg">6{tx.amount.toLocaleString()}</p>
                <Badge variant="outline" className="border-green-600/20 text-green-600 font-black px-3 py-1 bg-green-600/5 uppercase">{t('success')}</Badge>
              </div>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-bold">
              No transactions found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const ProfileView = ({ user, onEditProfile, onUpgradeAgent }: { user: UserType, onEditProfile: () => void, onUpgradeAgent: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-3xl mx-auto pb-20">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-8 border-white dark:border-slate-900 shadow-2xl">
             <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                <User size={64} className="text-[#084328]" />
             </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-2 right-2 bg-[#084328] text-white p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform" onClick={onEditProfile}>
             <Settings size={24} strokeWidth={3} />
          </button>
        </div>
        <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-1">{user.name}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium">{user.email}</p>
        <Badge className="mt-4 bg-[#084328]/10 text-[#084328] border-none px-6 py-1.5 rounded-full text-sm font-black uppercase tracking-wider">{user.role || 'user'}</Badge>
      </div>

      <div className="grid gap-3 md:gap-4">
        <ProfileItem label={t('prof_full_name')} value={user.name || 'Not set'} />
        <ProfileItem label={t('auth_username')} value={user.username || 'Not set'} />
        <ProfileItem label={t('prof_phone')} value={user.phone || 'Not set'} />
        <ProfileItem label={t('prof_ref')} value={user.referralCode || 'None'} />
        <ProfileItem label={t('prof_earnings')} value={`6${((user.walletBalance || 0) * 0.2).toLocaleString()}`} />
      </div>

      <div className="pt-6 space-y-4">
        <Button 
          onClick={onEditProfile}
          className="w-full h-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-black text-lg rounded-2xl shadow-sm border-none"
        >
           {t('edit_settings')}
        </Button>
        {user.role === 'user' && (
          <Button 
            onClick={onUpgradeAgent}
            className="w-full h-16 bg-[#084328] text-white hover:bg-[#063a23] font-black text-lg rounded-2xl shadow-xl border-none"
          >
             {t('upgrade_agent')}
          </Button>
        )}
      </div>
    </div>
  );
};

const ProfileItem = ({ label, value }: { label: string, value: string | number }) => (
  <Card className="border-none shadow-sm dark:shadow-none rounded-2xl bg-white dark:bg-slate-900 group hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800">
    <CardContent className="p-5 md:p-6 flex justify-between items-center">
      <span className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg">{label}</span>
      <span className="text-slate-900 dark:text-white font-black text-base md:text-lg">{value}</span>
    </CardContent>
  </Card>
);

const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-lg transition-all ${
      active 
        ? 'bg-[#084328]/10 text-[#084328]'
        : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 3 : 2} className={active ? 'text-[#084328]' : 'text-slate-400'} />
    {label}
  </button>
);

const MobileNavLink = ({ icon: Icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
      active ? 'text-[#084328] scale-125' : 'text-slate-500'
    }`}
  >
    <Icon size={26} strokeWidth={active ? 3 : 2} />
  </button>
);

const Select = ({ children, value, onValueChange }: any) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-14 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-foreground">
          {value === 'all' ? 'All Types' : value.toUpperCase()} <ChevronRight className="ml-2 rotate-90" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-2xl">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SelectTrigger = ({ children, className }: any) => <div className={className}>{children}</div>;
const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>;
const SelectContent = ({ children, className }: any) => <div className={className}>{children}</div>;
const SelectItem = ({ children, value, onClick, className }: any) => (
  <DropdownMenuItem onClick={() => onClick?.(value)} className={className}>{children}</DropdownMenuItem>
);

export default Dashboard;