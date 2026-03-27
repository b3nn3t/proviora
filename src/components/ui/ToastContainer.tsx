"use client";

import { useToast } from "@/lib/store/useToast";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-8 right-8 z-[999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center space-x-4 px-6 py-4 rounded-2xl shadow-2xl min-w-[300px] border backdrop-blur-md ${
              toast.type === 'success' ? 'bg-[#243A5E] border-[#d4af37]/20 text-white' :
              toast.type === 'error' ? 'bg-red-500 border-white/10 text-white' :
              'bg-white border-[#243A5E]/10 text-[#243A5E]'
            }`}
          >
            <div className={toast.type === 'success' ? 'text-[#d4af37]' : 'text-white'}>
              {toast.type === 'success' && <CheckCircle2 size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            
            <p className="flex-1 text-sm font-bold uppercase tracking-widest">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
