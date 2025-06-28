import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className = '', ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, boxShadow: '0px 4px 14px rgba(255,22,59,0.3)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={`bg-brand text-white font-medium rounded-xl px-6 py-2 shadow-md ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}