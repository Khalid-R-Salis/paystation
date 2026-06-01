import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Smartphone, Lightbulb, ShieldCheck, Menu, X, 
  ArrowRight, Sparkles, CheckCircle2, Quote, Plus, 
  Minus, Moon, Sun, MapPin, Phone, Mail, Settings, Languages
} from 'lucide-react';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useLanguage, languages, Language } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { toast } from 'sonner';

// img imports
import heroImg from '../../img/hero-img.png';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
  onShowOnboarding?: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const pricingData = {
  MTN: [
    { plan: '500MB', price: '\u20a6125.0', validity: '30 days' },
    { plan: '1.0GB', price: '\u20a6235.0', validity: '30 days' },
    { plan: '2.0GB', price: '\u20a6470.0', validity: '30 days' },
    { plan: '3.0GB', price: '\u20a6705.0', validity: '30 days' },
    { plan: '5.0GB', price: '\u20a61175.0', validity: '30 days' },
    { plan: '10GB', price: '\u20a62350.0', validity: '30 days' },
  ],
  AIRTEL: [
    { plan: '500MB', price: '\u20a6120.0', validity: '30 days' },
    { plan: '1.0GB', price: '\u20a6230.0', validity: '30 days' },
    { plan: '2.0GB', price: '\u20a6460.0', validity: '30 days' },
    { plan: '5.0GB', price: '\u20a61150.0', validity: '30 days' },
    { plan: '10GB', price: '\u20a62300.0', validity: '30 days' },
  ],
  GLO: [
    { plan: '500MB', price: '\u20a6115.0', validity: '30 days' },
    { plan: '1.0GB', price: '\u20a6225.0', validity: '30 days' },
    { plan: '2.0GB', price: '\u20a6450.0', validity: '30 days' },
    { plan: '5.0GB', price: '\u20a61125.0', validity: '30 days' },
    { plan: '10GB', price: '\u20a62250.0', validity: '30 days' },
  ],
  '9 MOBILE': [
    { plan: '500MB', price: '\u20a6130.0', validity: '30 days' },
    { plan: '1.0GB', price: '\u20a6240.0', validity: '30 days' },
    { plan: '2.0GB', price: '\u20a6480.0', validity: '30 days' },
    { plan: '5.0GB', price: '\u20a61200.0', validity: '30 days' },
    { plan: '10GB', price: '\u20a62400.0', validity: '30 days' },
  ]
};

const networkLogos = {
  MTN: "img/mtnLogo.png",
  AIRTEL: "img/airtelLogo.png",
  GLO: "img/gloLogo.png",
  "9 MOBILE": "img/ninemobileLogo.png"
};
const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignUp, isDarkMode, toggleTheme }) => {
  const { t, setLanguage, language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  type Network = keyof typeof pricingData;
const [selectedNetwork, setSelectedNetwork] = useState<Network>('MTN');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const features = [
    {
      title: t('feat_mobile_title', 'Mobile Top-up'),
      description: t('feat_mobile_desc', 'Instant airtime and data for MTN, Airtel, Glo, and 9mobile at discounted rates.'),
      icon: Smartphone,
      color: 'bg-[#084328]',
      image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/hero-image-payflow-app-7e515208-1776532585256.webp'
    },
    {
      title: t('feat_bills_title', 'Bill Payments'),
      description: t('feat_bills_desc', 'Pay electricity bills and cable TV subscriptions (DSTV, GOTV, Startimes) with zero stress.'),
      icon: Lightbulb,
      color: 'bg-[#084328]',
      image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/utility-bill-payments-illustration-7f070af1-1776532588403.webp'
    },
    {
      title: t('feat_exam_title', 'Exam Result Pins'),
      description: t('feat_exam_desc', 'Get instant WAEC, NECO, and JAMB result checker pins delivered to your dashboard.'),
      icon: Sparkles,
      color: 'bg-[#084328]',
      image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/user-experience-payflow-af3cb580-1776532586194.webp'
    },
    {
      title: t('feat_secure_title', 'Secure Wallet'),
      description: t('feat_secure_desc', 'Fund your wallet via multiple channels and manage your finances securely.'),
      icon: ShieldCheck,
      color: 'bg-[#084328]',
      image: 'https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/secure-digital-wallet-illustration-240271bb-1776532585147.webp'
    }
  ];

  const faqs = [
    {
      question: t('faq_q1', 'How To Buy Data?'),
      answer: (
        <ol className="list-decimal ml-5 space-y-2 text-slate-500 dark:text-slate-400 font-medium">
          <li>{t('faq_a1_s1', 'Log in to your account')}</li>
          <li>{t('faq_a1_s2', 'If you have not registered, please click \u201cregister\u201d above to register now')}</li>
          <li>{t('faq_a1_s3', 'After login, click Fund Wallet and use any of the suitable means to fund your wallet')}</li>
          <li>{t('faq_a1_s4', 'Click on \u201cbuy data\u201d and select the desired network, data type, data size and input phone number')}</li>
          <li>{t('faq_a1_s5', 'Click \u201csend\u201d and input your transaction PIN and send')}</li>
          <li>{t('faq_a1_s6', 'The receiver will receive a notification instantly of the data recharged')}</li>
        </ol>
      )
    },
    {
      question: t('faq_q2', 'What Are The Codes For Checking Data Balance?'),
      answer: (
        <div className="space-y-1 text-slate-500 dark:text-slate-400 font-medium">
          <p>MTN[SME] \u2192 *461*4#</p>
          <p>MTN[CG] \u2192 *460*260#</p>
          <p>MTN[SME2] \u2192 *460*260#</p>
          <p>MTN[Coupon] \u2192 *323*4#</p>
          <p>9mobile[CG] \u2192 *323#</p>
          <p>Airtel[CG] \u2192 *323#</p>
          <p>Glo[CG] \u2192 *127*0#</p>
        </div>
      )
    },
    {
      question: t('faq_q3', 'How Do I Fund My Wallet?'),
      answer: (
        <div className="space-y-2 text-slate-500 dark:text-slate-400 font-medium">
          <p>{t('faq_a3_desc', 'You can fund your wallet using any of our Four payment means:')}</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>{t('faq_a3_opt1', 'Bank payment.')}</li>
            <li>{t('faq_a3_opt2', 'Online Payment with your ATM card details via Monnify ATM funding.')}</li>
            <li>{t('faq_a3_opt3', 'Manual funding by chatting up our customer service line via WhatsApp.')}</li>
          </ul>
        </div>
      )
    },
    {
      question: t('faq_q4', 'Can I upgrade to a more powerful hosting plan later?'),
      answer: (
        <div className="space-y-2 text-slate-500 dark:text-slate-400 font-medium">
          <p><span className="font-black text-slate-900 dark:text-white">{t('step', 'STEP')} 1:</span> {t('faq_a4_s1', 'Fund your wallet.')}</p>
          <p><span className="font-black text-slate-900 dark:text-white">{t('step', 'STEP')} 2:</span> {t('faq_a4_s2', 'Fill the data order form.')}</p>
          <p><span className="font-black text-slate-900 dark:text-white">{t('step', 'STEP')} 3:</span> {t('faq_a4_s3', 'Wait for 1-15 minutes, the recipient will receive notification(s) of data recharge.')}</p>
        </div>
      )
    }
  ];

  const handleBuyNow = () => {
    onLogin();
  };

  // const scrollToSection = (id: string) => {
  //   setIsMenuOpen(false);
  //   setTimeout(() => {
  //     const element = document.getElementById(id);
  //     if (element) {
  //       element.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, 100);
  // };
  const scrollToSection = (id: string) => {
  setIsMenuOpen(false);
  setTimeout(() => {
    const element = document.getElementById(id);
    if (element) {
      // 1. Get the element's position relative to the entire page
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      
      // 2. Subtract the height of your fixed navbar (adjust 90 to match your header height)
      const offsetPosition = elementPosition - 90;

      // 3. Smoothly scroll to the calculated position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, 100);
};

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleWhatsAppChat = () => {
    window.open('https://wa.me/2348085499803', '_blank');
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-[#084328] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/10">
                <Zap className="text-white fill-white" size={20} />
              </div>
              <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('app_name')}</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 dark:text-slate-400 hover:text-[#084328] font-bold transition-colors">{t('nav_features')}</button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-600 dark:text-slate-400 hover:text-[#084328] font-bold transition-colors">{t('nav_pricing')}</button>
              <button onClick={() => scrollToSection('faq')} className="text-slate-600 dark:text-slate-400 hover:text-[#084328] font-bold transition-colors">{t('nav_faq')}</button>
              <button onClick={() => scrollToSection('about')} className="text-slate-600 dark:text-slate-400 hover:text-[#084328] font-bold transition-colors">{t('nav_about')}</button>
              
              <div className="flex items-center gap-3 ml-4">
                <LanguageSelector />
                <button 
                  onClick={toggleTheme} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <Button variant="ghost" className="font-black text-slate-700 dark:text-slate-200 h-12 px-5 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onLogin}>
                  {t('nav_login')}
                </Button>
                <Button className="bg-[#084328] hover:bg-[#063a23] text-white font-black h-12 px-6 rounded-2xl shadow-lg shadow-green-900/10" onClick={onSignUp}>
                  {t('nav_get_started')}
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button - Consolidated */}
            <div className="md:hidden flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    <Settings size={20} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl dark:bg-slate-900">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase text-slate-400">Settings</DropdownMenuLabel>
                  <DropdownMenuItem onClick={toggleTheme} className="rounded-xl p-3 font-bold flex items-center gap-3">
                    {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-blue-500" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase text-slate-400">Language</DropdownMenuLabel>
                  {(Object.keys(languages) as Language[]).map((lang) => (
                    <DropdownMenuItem 
                      key={lang} 
                      onClick={() => setLanguage(lang)}
                      className={`rounded-xl p-3 font-bold flex items-center gap-3 ${language === lang ? 'bg-[#084328]/10 text-[#084328]' : ''}`}
                    >
                      <span>{languages[lang].flag}</span>
                      <span>{languages[lang].name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400" aria-expanded={isMenuOpen}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background border-b border-border overflow-hidden relative z-[60]"
            >
              <div className="px-6 py-8 space-y-6">
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); scrollToSection('features'); }} 
                  className="block text-xl font-black text-foreground w-full text-left py-2 hover:text-[#084328] transition-colors cursor-pointer relative z-[70]"
                >{t('nav_features')}</button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); scrollToSection('pricing'); }} 
                  className="block text-xl font-black text-foreground w-full text-left py-2 hover:text-[#084328] transition-colors cursor-pointer relative z-[70]"
                >{t('nav_pricing')}</button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); scrollToSection('faq'); }} 
                  className="block text-xl font-black text-foreground w-full text-left py-2 hover:text-[#084328] transition-colors cursor-pointer relative z-[70]"
                >{t('nav_faq')}</button>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); scrollToSection('about'); }} 
                  className="block text-xl font-black text-foreground w-full text-left py-2 hover:text-[#084328] transition-colors cursor-pointer relative z-[70]"
                >{t('nav_about')}</button>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-black border-border bg-transparent" onClick={() => { setIsMenuOpen(false); onLogin(); }}>{t('nav_login')}</Button>
                  <Button className="w-full h-14 bg-[#084328] hover:bg-[#063a23] rounded-2xl font-black text-white" onClick={() => { setIsMenuOpen(false); onSignUp(); }}>{t('nav_get_started')}</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[90px] pb-10 lg:pt-[134px] lg:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"> */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-[2px]">
            <div className="lg:w-1/2 space-y-10 text-center lg:text-left min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#084328]/10 text-[#084328] rounded-full text-sm font-black uppercase tracking-widest"
              >
                <Sparkles size={16} />
                {t('hero_badge')}
              </motion.div>
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  // className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.9] break-words"
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.05] sm:leading-[1] break-normal"
                >
                  {t('hero_welcome')} <br />
                  <span className="text-[#084328] uppercase">{t('app_name')}</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl lg:text-4xl text-slate-600 dark:text-slate-300 font-bold leading-tight max-w-2xl mx-auto lg:mx-0"
                >
                  {t('hero_subtitle')}
                </motion.p>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                {t('hero_description')}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Button className="w-full sm:w-auto h-16 px-10 text-lg font-black bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl shadow-2xl shadow-green-900/10 transition-transform active:scale-95" onClick={onSignUp}>
                  {t('btn_create_account')}
                  <ArrowRight className="ml-2" size={20} strokeWidth={3} />
                </Button>
                <Button variant="outline" className="w-full sm:w-auto h-16 px-10 text-lg font-black border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 bg-transparent" onClick={() => scrollToSection('pricing')}>
                  {t('btn_view_prices')}
                </Button>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:w-1/2 relative shrink-0"
            >
              <div className="absolute inset-0 bg-[#084328]/5 rounded-full blur-[120px]" />
              <img 
                src={heroImg}
                alt="PayStation App" 
               className="relative w-full max-w-[500px] lg:max-w-[520px] xl:max-w-[580px] mx-auto rounded-[2.5rem] shadow-2xl border-8 border-white dark:border-slate-900 transform lg:rotate-2 hover:rotate-0 transition-all duration-700"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-12 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-6">
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{t('why_choose')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto">{t('why_desc')}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800 group cursor-default"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{feature.description}</p>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <img src={feature.image} alt={feature.title} className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700" />
                </div>
              </motion.div>
            ))} */}
            {features.map((feature, idx) => (
  <motion.div
    key={idx}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: idx * 0.1 }}
    className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800 group cursor-default"
  >
    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
      <feature.icon size={32} />
    </div>
    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{feature.title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{feature.description}</p>
    
    {/* Removed global 'grayscale' from this wrapper div */}
    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden transition-all duration-500">
      <img 
        src={feature.image} 
        alt={feature.title} 
        // Handles zoom on all devices when the card is active/hovered, but ONLY turns gray on desktop mouse-hover (lg:)
        className="object-cover w-full h-full transform group-hover:scale-110 lg:group-hover:grayscale transition-all duration-700" 
      />
    </div>
  </motion.div>
))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 bg-background border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-4">
            <Badge variant="outline" className="px-4 py-1 text-[#084328] border-[#084328]/20 bg-[#084328]/5 font-black text-xs uppercase tracking-widest">{t('nav_pricing')}</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{t('data_rates')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto">{t('data_rates_desc')}</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Network Toggles */}
            <div className="flex flex-wrap justify-center gap-3 mb-5">
              {(Object.keys(pricingData) as (keyof typeof pricingData)[]).map((network) => (
                <button
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm transition-all duration-300 border-2 active:scale-95
  ${selectedNetwork === network
    ? 'bg-[#084328] text-white border-[#084328]'
    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
  }
`}
                >
                   {/* Correct dynamic class application inside JSX is better handled here */}
                   <div className={`flex items-center gap-3 ${selectedNetwork === network ? 'text-white' : ''}`}>
                      <img 
                        src={networkLogos[network as keyof typeof networkLogos]} 
                        alt={network} 
                        className="w-6 h-6 rounded-md object-cover border border-slate-200/50"
                      />
                      {/* <img
  src={networkLogos[network]}
  alt={network}
  className="w-8 h-8 object-contain"
onError={(e) => {
  (e.target as HTMLImageElement).src = "/img/default.png";
}}
/> */}
                      {network}
                   </div>
                </button>
              ))}
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                  <TableRow className="hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="w-[150px] font-black text-slate-900 dark:text-white h-16 px-8 text-base">{t('data_plan', 'Data Plan')}</TableHead>
                    <TableHead className="font-black text-slate-900 dark:text-white h-16 text-base">{t('price', 'Price')}</TableHead>
                    <TableHead className="font-black text-slate-900 dark:text-white h-16 text-base">{t('validity', 'Validity')}</TableHead>
                    <TableHead className="text-right font-black text-slate-900 dark:text-white h-16 px-8 text-base">{t('action', 'Action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="wait">
                    {pricingData[selectedNetwork].map((plan, idx) => (
                      <motion.tr
                        key={`${selectedNetwork}-${plan.plan}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-50 dark:border-slate-800"
                      >
                        <TableCell className="font-bold text-slate-900 dark:text-white py-6 px-8 text-lg">{plan.plan}</TableCell>
                        <TableCell className="font-black text-[#084328] text-lg">{plan.price}</TableCell>
                        <TableCell className="font-medium text-slate-500 dark:text-slate-400">{plan.validity}</TableCell>
                        <TableCell className="text-right py-6 px-8">
                          <Button 
                            className="bg-[#084328] hover:bg-[#063a23] text-white font-black rounded-xl h-11 px-6 shadow-lg shadow-green-900/10 transition-transform active:scale-95 group-hover:scale-105"
                            onClick={handleBuyNow}
                          >
                            {t('buy_now', 'BUY NOW')}
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            <div className="mt-5 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-start gap-4 border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-[#084328]/10 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-[#084328]" size={20} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-sm leading-relaxed">
                {t('agent_promo', 'Prices shown are for standard users. Register as an Agent to enjoy even lower wholesale prices and earn more from every transaction.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 bg-slate-50/30 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-4">
            <Badge variant="outline" className="px-4 py-1 text-[#084328] border-[#084328]/20 bg-[#084328]/5 font-black text-xs uppercase tracking-widest">{t('testimonials', 'Testimonials')}</Badge>
            <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">{t('testimonials_title')}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto">{t('testimonials_desc')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group"
              >
                <div className="absolute top-8 right-8 text-slate-100 dark:text-slate-800 group-hover:text-[#084328]/10 transition-colors">
                  <Quote size={48} />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-14 h-14 border-2 border-[#084328]/10">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-[#084328] font-bold">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed italic">
                  \\"{testimonial.quote}\\"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="space-y-6 text-center">
            <div className="space-y-2">
              <Badge variant="outline" className="px-4 py-1 text-[#084328] border-[#084328]/20 bg-[#084328]/5 font-black text-xs uppercase tracking-widest">{t('support', 'Support')}</Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {t('nav_faq')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-2xl mx-auto">
                {t('faq_subtitle')}
              </p>
            </div>

            <div className="space-y-4 text-left">
              {faqs.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-3xl border-2 transition-all duration-300 ${
                    openFaqIndex === index 
                      ? 'border-[#084328] bg-[#084328]/5' 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-green-200 dark:hover:border-green-600/30'
                  }`}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-8 py-6 flex items-center justify-between gap-4 text-left"
                  >
                    <span className={`text-lg lg:text-xl font-black transition-colors ${
                      openFaqIndex === index ? 'text-[#084328]' : 'text-slate-900 dark:text-white'
                    }`}>
                      {faq.question}
                    </span>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      openFaqIndex === index ? 'bg-[#084328] text-white rotate-0' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 rotate-0'
                    }`}>
                      {openFaqIndex === index ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 text-slate-600 dark:text-slate-400">
                          <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-6" />
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            <div className="pt-6">
              <Button 
                variant="outline" 
                className="h-14 px-8 rounded-2xl font-black border-slate-200 dark:border-slate-800 bg-transparent dark:text-white group hover:border-[#084328] hover:text-[#084328]"
                onClick={handleWhatsAppChat}
              >
                {t('chat_with_us')}
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-6 lg:p-12 text-center space-y-5 relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#084328]/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#084328]/10 rounded-full blur-[100px] -ml-48 -mb-48" />
            
            <h2 className="text-4xl lg:text-6xl font-black text-white relative z-10 leading-tight">{t('ready_to_simplify')}</h2>
            <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto relative z-10">
              {t('trust_paystation')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 pt-6">
              <Button className="w-full sm:w-auto h-16 px-12 text-xl font-black bg-[#084328] hover:bg-[#063a23] text-white rounded-2xl shadow-2xl shadow-green-900/40" onClick={onSignUp}>
                {t('nav_get_started')}
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto h-16 px-12 text-xl font-black text-white hover:bg-white/10 rounded-2xl" onClick={onLogin}>
                {t('nav_login')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="py-16 border-t border-border/50 bg-slate-50/30 dark:bg-slate-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#084328] rounded-xl flex items-center justify-center shadow-lg shadow-green-900/10">
                  <Zap className="text-white fill-white" size={20} />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('app_name')}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs transition-colors duration-300">
                {t('footer_tagline')}
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('footer_quick_links')}</h3>
              <ul className="space-y-4">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-slate-500 dark:text-slate-400 hover:text-[#084328] font-bold transition-all hover:translate-x-1">{t('nav_features')}</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-slate-500 dark:text-slate-400 hover:text-[#084328] font-bold transition-all hover:translate-x-1">{t('nav_pricing')}</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="text-slate-500 dark:text-slate-400 hover:text-[#084328] font-bold transition-all hover:translate-x-1">{t('nav_faq')}</button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="text-slate-500 dark:text-slate-400 hover:text-[#084328] font-bold transition-all hover:translate-x-1">{t('nav_about')}</button>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-wider">{t('footer_get_in_touch')}</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <MapPin className="text-[#084328] shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300" size={20} />
                  <span className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Bauchi Road, Nassarawa Gwong Jos, Plateau State
                  </span>
                </li>
                <li className="flex items-center gap-3 group">
                  <Phone className="text-[#084328] shrink-0 group-hover:scale-110 transition-transform duration-300" size={20} />
                  <a href="tel:08085499803" className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#084328] transition-colors">08085499803</a>
                </li>
                <li className="flex items-center gap-3 group">
                  <Mail className="text-[#084328] shrink-0 group-hover:scale-110 transition-transform duration-300" size={20} />
                  <a href="mailto:khalidtechsolutions.ng@gmail.com" className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#084328] transition-colors break-all">khalidtechsolutions.ng@gmail.com</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm text-center md:text-left">
              {t('developed_at')} <span className="text-[#084328]">KhalidTech Solutions</span>
            </p>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm text-center md:text-right">
              {t('all_rights')} \u00a9 KhalidTech Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const testimonials = [
  {
    name: "Samuel Okon",
    role: "Merchant Agent",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/testimonial-avatar-1-55944aa9-1776536909798.webp",
    quote: "PayStation has completely transformed my VTU business. Transactions are instant and the customer support is top-notch."
  },
  {
    name: "Amaka Eze",
    role: "Student",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/testimonial-avatar-2-ddf395b0-1776536910646.webp",
    quote: "I never have to worry about my data running out at night. With PayStation, I get my data top-up in seconds!"
  },
  {
    name: "Tunde Williams",
    role: "Corporate Professional",
    image: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/389bcda3-883e-4e42-8765-8bfb48337f43/testimonial-avatar-3-129d9a8d-1776536912456.webp",
    quote: "Reliability is key for me. PayStation provides the security and speed I need for all my bill payments."
  }
];

export default LandingPage;