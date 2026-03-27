'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone } from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { showToast } from '@/app/lib/utils/toast'
import axiosInstance from '@/app/lib/api/axios'

export default function OTPVerification({ email, phone, onComplete }) {
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', ''])
  const [phoneOTP, setPhoneOTP] = useState(['', '', '', '', '', ''])
  const [emailVerified, setEmailVerified] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((t) => t - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else if (timer === 0) {
      setCanResend(true)
    }
  }, [timer, canResend])

  const handleOTPChange = (index, value, type) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const setter = type === 'email' ? setEmailOTP : setPhoneOTP
      const currentOTP = type === 'email' ? emailOTP : phoneOTP
      
      const newOTP = [...currentOTP]
      newOTP[index] = value
      setter(newOTP)
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`${type}-otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleKeyDown = (e, index, type) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = document.getElementById(`${type}-otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const verifyOTP = async (type) => {
    const otp = type === 'email' ? emailOTP.join('') : phoneOTP.join('')
    if (otp.length !== 6) {
      showToast.warning(`Please enter complete 6-digit OTP`)
      return
    }

    setIsLoading(true)
    try {
      const endpoint = type === 'email' ? '/auth/verify-email' : '/auth/verify-phone'
      const payload = type === 'email' 
        ? { email, otp } 
        : { phone, otp }
      const response = await axiosInstance.post(endpoint, payload)
      
      if (response.success) {
        showToast.success(`${type} verified successfully`)
        if (type === 'email') {
          setEmailVerified(true)
        } else {
          setPhoneVerified(true)
        }
      }
    } catch (error) {
      console.error(`${type} verification error:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async (type) => {
    setTimer(60)
    setCanResend(false)
    try {
      const payload = type === 'email' 
        ? { identifier: email, type: 'email' }
        : { identifier: phone, type: 'phone' }
      
      await axiosInstance.post('/auth/resend-otp', payload)
      showToast.success(`New OTP sent to your ${type}`)
    } catch (error) {
      console.error('Resend OTP error:', error)
    }
  }

  if (emailVerified && phoneVerified) {
    onComplete()
    return null
  }

  const renderOTPInputs = (type) => {
    const otp = type === 'email' ? emailOTP : phoneOTP
    const color = type === 'email' ? 'pink' : 'purple'
    
    return (
      <div className="flex justify-between gap-1">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`${type}-otp-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value, type)}
            onKeyDown={(e) => handleKeyDown(e, index, type)}
            className={`
              w-10 h-10 text-center bg-white/5 border border-white/10 rounded-lg 
              text-white text-sm focus:outline-none focus:border-${color}-500 
              focus:ring-2 focus:ring-${color}-500/20 transition-all cursor-pointer
            `}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Email Verification */}
      {!emailVerified && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-500/20 rounded-xl">
              <Mail className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Verify Email</h3>
              <p className="text-white/50 text-xs">OTP sent to {email}</p>
            </div>
          </div>

          <div className="space-y-4">
            {renderOTPInputs('email')}

            <div className="flex gap-2">
              <Button
                onClick={() => verifyOTP('email')}
                isLoading={isLoading}
                disabled={emailOTP.join('').length !== 6}
                size="sm"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2 cursor-pointer"
              >
                Verify Email
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resendOTP('email')}
                disabled={!canResend}
                className="px-4 bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer"
              >
                {canResend ? 'Resend' : `${timer}s`}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Phone Verification */}
      {!phoneVerified && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Phone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">Verify Phone</h3>
              <p className="text-white/50 text-xs">OTP sent to {phone}</p>
            </div>
          </div>

          <div className="space-y-4">
            {renderOTPInputs('phone')}

            <div className="flex gap-2">
              <Button
                onClick={() => verifyOTP('phone')}
                isLoading={isLoading}
                disabled={phoneOTP.join('').length !== 6}
                size="sm"
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 cursor-pointer"
              >
                Verify Phone
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resendOTP('phone')}
                disabled={!canResend}
                className="px-4 bg-white/5 hover:bg-white/10 text-white/70 cursor-pointer"
              >
                {canResend ? 'Resend' : `${timer}s`}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}