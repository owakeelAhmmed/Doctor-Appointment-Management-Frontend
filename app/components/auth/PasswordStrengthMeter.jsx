'use client'

import { motion } from 'framer-motion'
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'

export default function PasswordStrengthMeter({ password }) {
  const calculateStrength = () => {
    let strength = 0
    if (password?.length >= 8) strength += 25
    if (password?.match(/[A-Z]/)) strength += 25
    if (password?.match(/[0-9]/)) strength += 25
    if (password?.match(/[^A-Za-z0-9]/)) strength += 25
    return strength
  }

  const strength = calculateStrength()

  const getStrengthInfo = () => {
    if (strength <= 25) return { text: 'Weak', color: 'bg-red-500', icon: ShieldAlert }
    if (strength <= 50) return { text: 'Fair', color: 'bg-orange-500', icon: Shield }
    if (strength <= 75) return { text: 'Good', color: 'bg-yellow-500', icon: Shield }
    return { text: 'Strong', color: 'bg-green-500', icon: ShieldCheck }
  }

  const info = getStrengthInfo()
  const Icon = info.icon

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 space-y-2"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            className={`h-full ${info.color}`}
          />
        </div>
        <div className="flex items-center gap-1">
          <Icon className={`w-4 h-4 text-${info.color.replace('bg-', '')}-400`} />
          <span className="text-xs text-white/70">{info.text}</span>
        </div>
      </div>
      
      <p className="text-xs text-white/50 flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Use at least 8 characters with letters, numbers & symbols
      </p>
    </motion.div>
  )
}