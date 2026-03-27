'use client'

import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { FaMale, FaFemale, FaGenderless } from 'react-icons/fa'

export default function GenderSelector({ value, onChange, error }) {
  const options = [
    { value: 'M', label: 'Male', icon: FaMale, color: 'blue' },
    { value: 'F', label: 'Female', icon: FaFemale, color: 'pink' },
    { value: 'O', label: 'Other', icon: FaGenderless, color: 'purple' }
  ]

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">
        Gender
      </label>
      
      <div className="flex gap-3">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = value === option.value
          
          return (
            <motion.label
              key={option.value}
              className="flex-1 cursor-pointer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <input
                type="radio"
                name="gender"
                value={option.value}
                checked={isSelected}
                onChange={(e) => onChange(e.target.value)}
                className="hidden"
              />
              
              <div className={`
                flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer
                ${isSelected 
                  ? `border-${option.color}-500 bg-${option.color}-500/20 text-white` 
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }
              `}>
                <Icon className={`w-6 h-6 ${isSelected ? `text-${option.color}-400` : ''}`} />
                <span className="text-xs font-medium">{option.label}</span>
              </div>
            </motion.label>
          )
        })}
      </div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-pink-300 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  )
}