import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100]"
        >
          <Button
            onClick={scrollToTop}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#084328] hover:bg-[#063a23] text-white shadow-2xl shadow-[#084328]/40 border-4 border-white dark:border-slate-900 p-0 transition-transform active:scale-90"
            size="icon"
          >
            <ChevronUp size={28} strokeWidth={3} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};