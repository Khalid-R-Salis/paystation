import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

const SplashView = () => {
  return (
    <div className="min-h-screen bg-[#084328] flex flex-col items-center justify-center p-6 fixed inset-0 z-[100]">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-8"
      >
        <Zap className="text-green-600 fill-green-600" size={48} />
      </motion.div>
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl font-black text-white tracking-tighter"
      >
        PayStation
      </motion.h1>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 120 }}
        className="h-1.5 bg-white/20 w-32 mt-8 rounded-full overflow-hidden"
      >
        <motion.div 
          animate={{ x: [-120, 120] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="h-full bg-white w-1/2 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default SplashView;