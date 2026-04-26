import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Zap, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingViewProps {
  onFinish: () => void;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onFinish }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('onboarding_step1_title', 'Fast & Reliable'),
      description: t('onboarding_step1_desc', 'Experience lightning-fast VTU and bill payments with zero failures.'),
      icon: Zap,
      color: 'bg-[#084328]'
    },
    {
      title: t('onboarding_step2_title', 'Secure Wallet'),
      description: t('onboarding_step2_desc', 'Your funds are protected with industry-leading security protocols.'),
      icon: ShieldCheck,
      color: 'bg-[#084328]'
    },
    {
      title: t('onboarding_step3_title', 'Multiple Services'),
      description: t('onboarding_step3_desc', 'Data, Airtime, Electricity, and Cable TV - all in one place.'),
      icon: Smartphone,
      color: 'bg-[#084328]'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md space-y-12 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className={`w-32 h-32 ${steps[currentStep].color} rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-current/20`}>
              <StepIcon className="text-white" size={64} />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">{steps[currentStep].title}</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2">
          {steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-[#084328]' : 'w-2 bg-slate-200 dark:bg-slate-800'}`} 
            />
          ))}
        </div>

        <div className="space-y-4">
          <Button onClick={handleNext} className="w-full h-16 bg-[#084328] hover:bg-[#063a23] text-white text-xl font-black rounded-2xl shadow-xl shadow-green-900/10 transition-all active:scale-95">
            {currentStep === steps.length - 1 ? t('onboarding_finish') : t('onboarding_continue')}
            <ArrowRight className="ml-2" size={20} strokeWidth={3} />
          </Button>
          <button onClick={handleSkip} className="text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300">
            {t('onboarding_skip')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingView;