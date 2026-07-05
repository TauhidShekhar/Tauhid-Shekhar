import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const typeConfig = {
    success: {
      bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/30',
      text: 'text-green-800 dark:text-green-300',
      icon: <FaCheckCircle className="text-green-500" size={16} />
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30',
      text: 'text-red-800 dark:text-red-300',
      icon: <FaExclamationCircle className="text-red-500" size={16} />
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800/30',
      text: 'text-yellow-800 dark:text-yellow-300',
      icon: <FaExclamationCircle className="text-yellow-500" size={16} />
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30',
      text: 'text-blue-800 dark:text-blue-300',
      icon: <FaInfoCircle className="text-primary-blue" size={16} />
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3.5 px-5 py-4 rounded-xl border shadow-xl max-w-sm ${config.bg} ${config.text} text-left`}
    >
      <span className="shrink-0">{config.icon}</span>
      <p className="text-xs font-bold leading-relaxed pr-6">{message}</p>
      <button
        onClick={onClose}
        className="absolute top-1/2 -translate-y-1/2 right-3.5 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
      >
        <FaTimes size={12} />
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
