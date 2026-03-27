'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check } from 'lucide-react'

export default function ModernCheckbox({ 
  label, 
  checked, 
  onChange, 
  error,
  linkText,
  linkHref 
}) {
  return (
    <div className="space-y-2">
      <motion.label 
        className="flex items-start gap-3 cursor-pointer group"
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="hidden"
          />
          <motion.div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer
              ${checked 
                ? 'bg-pink-500 border-pink-500' 
                : 'bg-white/5 border-white/20 group-hover:border-pink-400/50'
              }`}
            animate={checked ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence>
              {checked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
          {label}{' '}
          {linkText && linkHref && (
            <a 
              href={linkHref} 
              className="text-pink-400 hover:text-pink-300 underline decoration-pink-400/30 hover:decoration-pink-300 transition-all"
            >
              {linkText}
            </a>
          )}
        </span>
      </motion.label>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-pink-300 flex items-center gap-1 pl-8"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  )
}