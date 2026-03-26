"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#243A5E]/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full bg-[#f5e6be] rounded-3xl shadow-2xl overflow-hidden ${title.includes("Вход") || title.includes("Регистрация") ? 'max-w-md' : 'max-w-2xl'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#243A5E]/10">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#243A5E]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[#243A5E]/5 transition-colors text-[#243A5E]"
              >
                <X size={28} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
