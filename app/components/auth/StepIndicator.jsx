'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function StepIndicator({ currentStep }) {
  const steps = [
    { number: 1, label: 'Register' },
    { number: 2, label: 'Verify' }
  ]

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center"
    >
      <div className="flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full p-1">
        {steps.map((step) => {
          const isActive = currentStep === step.number
          const isCompleted = currentStep > step.number
          
          return (
            <div
              key={step.number}
              className={`
                flex items-center space-x-1 px-4 py-2 rounded-full transition-all
                ${isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg' 
                  : isCompleted
                    ? 'bg-green-500/20 text-green-300'
                    : 'text-white/50'
                }
              `}
            >
              <span className="text-sm font-medium">
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </span>
              <span className="text-sm font-medium hidden sm:inline">
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}