import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Toast = () => {
  const { error, successMessage, clearMessages } = useAppStore();

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, successMessage, clearMessages]);

  const message = error || successMessage;
  const isError = !!error;

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          className="fixed top-4 left-1/2 z-50 w-full max-w-md"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${
              isError
                ? 'bg-red-50 border-l-4 border-red-500'
                : 'bg-green-50 border-l-4 border-green-500'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            )}
            <p
              className={`flex-1 text-sm font-medium ${
                isError ? 'text-red-800' : 'text-green-800'
              }`}
            >
              {message}
            </p>
            <button
              onClick={clearMessages}
              className={`flex-shrink-0 ${
                isError
                  ? 'text-red-600 hover:text-red-800'
                  : 'text-green-600 hover:text-green-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
};

// Made with Bob
