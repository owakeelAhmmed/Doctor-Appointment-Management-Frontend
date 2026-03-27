'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  Sparkles, Heart, Shield, CheckCircle, Fingerprint, 
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

// Components
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import ModernDatePicker from '@/app/components/ui/ModernDatePicker'
import ModernCheckbox from '@/app/components/ui/ModernCheckbox'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import GenderSelector from '@/app/components/auth/GenderSelector'
import PasswordStrengthMeter from '@/app/components/auth/PasswordStrengthMeter'
import StepIndicator from '@/app/components/auth/StepIndicator'
import OTPVerification from '@/app/components/auth/OTPVerification'

// Utils
import axiosInstance from '@/app/lib/api/axios'
import { showToast } from '@/app/lib/utils/toast'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
    }
  })

  const password = watch('password')
  const fullName = watch('fullName')
  const email = watch('email')
  const phone = watch('phone')
  const dateOfBirth = watch('dateOfBirth')
  const gender = watch('gender')

  const onSubmit = async (data) => {
    if (!termsAccepted) {
      showToast.error('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await axiosInstance.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
      })

      if (response.success) {
        showToast.success('Registration successful! Please verify your email and phone.', {
          description: 'We have sent OTP to your email and phone'
        })
        
        localStorage.setItem('pendingVerification', JSON.stringify({
          email: data.email,
          phone: data.phone,
          userId: response.data.userId
        }))
        
        setStep(2)
      }
    } catch (error) {
      // Error handled by axios interceptor
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative py-8">
      
      <AnimatedBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >

        {/* Logo/Brand Section */}
        <motion.div variants={itemVariants} className="text-center mb-6">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="inline-block p-3 bg-white/10 backdrop-blur-lg rounded-full mb-3 cursor-pointer"
          >
            <Fingerprint className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1 className="text-3xl font-bold text-white mb-1">
            {step === 1 ? 'Create Account' : 'Verify Identity'}
          </motion.h1>
          
          <motion.p className="text-white/70 text-sm">
            {step === 1 
              ? 'Join thousands of patients and doctors' 
              : 'Please verify your email and phone number'}
          </motion.p>
        </motion.div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} />

        {step === 1 ? (
          /* Registration Form */
          <motion.div
            key="form"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Full Name */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register('fullName', { 
                        required: 'Full name is required',
                        minLength: {
                          value: 3,
                          message: 'Name must be at least 3 characters'
                        }
                      })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                    />
                    {fullName?.length > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </motion.div>
                    )}
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.fullName.message}
                    </p>
                  )}
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: 'Invalid email address'
                        }
                      })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                    />
                    {email?.includes('@') && !errors.email && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </motion.div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </motion.div>

                {/* Phone */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                    <input
                      type="tel"
                      placeholder="017XXXXXXXX"
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^01[3-9]\d{8}$/,
                          message: 'Invalid Bangladeshi phone number'
                        }
                      })}
                      className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                    />
                    {phone?.length === 11 && !errors.phone && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </motion.div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.phone.message}
                    </p>
                  )}
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        }
                      })}
                      className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <PasswordStrengthMeter password={password} />
                  
                  {errors.password && (
                    <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.password.message}
                    </p>
                  )}
                </motion.div>

                {/* Confirm Password */}
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword', { 
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {watch('confirmPassword')?.length > 0 && watch('confirmPassword') === password && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-10 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </motion.div>
                    )}
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </motion.div>

                {/* Date of Birth - Modern DatePicker */}
                <motion.div variants={itemVariants}>
                  <ModernDatePicker
                    label="Date of Birth"
                    value={dateOfBirth}
                    onChange={(value) => setValue('dateOfBirth', value)}
                    error={errors.dateOfBirth?.message}
                  />
                </motion.div>

                {/* Gender - Modern Gender Selector */}
                <motion.div variants={itemVariants}>
                  <GenderSelector
                    value={gender}
                    onChange={(value) => setValue('gender', value)}
                    error={errors.gender?.message}
                  />
                </motion.div>

                {/* Terms & Conditions - Modern Checkbox */}
                <motion.div variants={itemVariants}>
                  <ModernCheckbox
                    label="I agree to the"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    linkText="Terms of Service and Privacy Policy"
                    linkHref="/terms"
                    error={!termsAccepted && errors.terms ? 'You must accept the terms' : null}
                  />
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 text-white py-2.5 rounded-xl shadow-lg shadow-purple-500/25 text-sm cursor-pointer"
                  >
                    {!isLoading && (
                      <span className="flex items-center justify-center gap-2">
                        Create Account
                        <Sparkles className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.div>

                {/* Login Link */}
                <motion.p 
                  variants={itemVariants}
                  className="text-center text-white/70 text-sm"
                >
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    className="text-pink-400 hover:text-pink-300 font-medium transition-colors cursor-pointer"
                  >
                    Sign in
                  </Link>
                </motion.p>
              </form>
            </div>
          </motion.div>
        ) : (
          /* OTP Verification */
          <motion.div
            key="otp"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <OTPVerification 
              email={JSON.parse(localStorage.getItem('pendingVerification'))?.email}
              phone={JSON.parse(localStorage.getItem('pendingVerification'))?.phone}
              onComplete={() => {
                showToast.success('Verification complete! Redirecting to login...', {
                  description: 'Your account is now active',
                })
                setTimeout(() => router.push('/login'), 2000)
              }}
            />
          </motion.div>
        )}

        {/* Trust Badges */}
        <motion.div 
          variants={itemVariants}
          className="mt-4 flex justify-center gap-4 text-white/40 text-xs"
        >
          <span className="flex items-center gap-1 cursor-pointer hover:text-white/60 transition-colors">
            <Shield className="w-3 h-3" /> Secure
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-white/60 transition-colors">
            <Heart className="w-3 h-3" /> Trusted
          </span>
          <span className="flex items-center gap-1 cursor-pointer hover:text-white/60 transition-colors">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}