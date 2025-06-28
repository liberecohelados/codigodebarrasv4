import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ToastProps {
  visible: boolean;
  message: string;
}

export default function Toast({ visible, message }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-brand text-white px-5 py-2 rounded-2xl shadow-lg"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}