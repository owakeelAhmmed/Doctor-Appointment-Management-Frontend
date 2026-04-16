// app/register/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import {
  User, Mail, Lock, Eye, EyeOff,
  Sparkles, Heart, Shield, CheckCircle, Fingerprint,
  AlertCircle, Stethoscope, UserPlus,
  Smartphone,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'

// Components
import Button from '@/app/components/ui/Button'
import ModernDatePicker from '@/app/components/ui/ModernDatePicker'
import ModernCheckbox from '@/app/components/ui/ModernCheckbox'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import GenderSelector from '@/app/components/auth/GenderSelector'
import PasswordStrengthMeter from '@/app/components/auth/PasswordStrengthMeter'

// Utils
import axiosInstance from '@/app/lib/api/axios'
import { showToast } from '@/app/lib/utils/toast'

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [userType, setUserType] = useState('patient')
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registeredUserType, setRegisteredUserType] = useState('')
  const [registeredUserId, setRegisteredUserId] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      bmdcRegNo: '',
    }
  })

  const password = watch('password')

  // Step 1: Registration
  const onSubmit = async (data) => {
    if (!termsAccepted) {
      showToast.error('Please accept the terms and conditions')
      return
    }

    if (data.password !== data.confirmPassword) {
      showToast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        role: userType,
      }

      if (userType === 'doctor') {
        payload.bmdcRegNo = data.bmdcRegNo
      }

      console.log('Sending payload:', payload)

      // Now response is full axios response object
      const response = await axiosInstance.post('/auth/register', payload)

      console.log('Full response:', response)
      console.log('Response data:', response.data)

      // Check response properly
      if (response.data?.success === true) {
        const responseData = response.data.data || {}

        setRegisteredEmail(responseData.email || data.email)
        setRegisteredUserType(responseData.role || userType)
        setRegisteredUserId(responseData.userId)

        // Show OTP form
        setShowOTPInput(true)

        if (userType === 'doctor') {
          showToast.success('Doctor registration successful!', {
            description: 'Please verify your email to continue.'
          })
        } else {
          showToast.success('Registration successful! Verification code sent to your email.')
        }

      } else {
        // Handle case where success is false or missing
        const errorMsg = response.data?.message || 'Registration failed'
        showToast.error(errorMsg)
      }

    } catch (error) {
      console.error('Registration error:', error)

      let errorMessage = 'Registration failed'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }

      showToast.error(errorMessage)

    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsVerifying(true)

    try {
      const response = await axiosInstance.post('/auth/verify-email', {
        email: registeredEmail,
        otp: otpCode
      })

      console.log('OTP verification response:', response)

      if (response.data?.success) {
        showToast.success('Email verified successfully!')

        if (registeredUserType === 'doctor') {
          showToast.info('Please login to complete your profile', {
            description: 'You need to login first to complete your doctor profile.'
          })

          // Option 1: Go to login with redirect parameter
          setTimeout(() => {
            router.push(`/login?redirect=/doctor/complete-profile&email=${encodeURIComponent(registeredEmail)}`)
          }, 2000)

        } else {
          // Patient goes to login
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }

      } else {
        showToast.error(response.data?.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      showToast.error('Invalid OTP. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/auth/resend-otp', {
        identifier: registeredEmail,
        type: 'email'
      })

      if (response.data?.success) {
        showToast.success('New OTP sent to your email!')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      showToast.error('Failed to resend OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Back to registration
  const handleBackToRegister = () => {
    setShowOTPInput(false)
    setOtpCode('')
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
            {!showOTPInput ? 'Create Account' : 'Verify Your Email'}
          </motion.h1>

          <motion.p className="text-white/70 text-sm">
            {!showOTPInput
              ? 'Join thousands of patients and doctors'
              : `We've sent a verification code to ${registeredEmail}`}
          </motion.p>
        </motion.div>

        {!showOTPInput ? (
          /* ========== REGISTRATION FORM ========== */
          <motion.div
            key="form"
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">

              {/* User Type Toggle Buttons */}
              <motion.div variants={itemVariants} className="flex gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300
                    ${userType === 'patient'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'}
                  `}
                >
                  <UserPlus className="w-4 h-4" />
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('doctor')}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-300
                    ${userType === 'doctor'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/60 hover:bg-white/20 border border-white/20'}
                  `}
                >
                  <Stethoscope className="w-4 h-4" />
                  Doctor
                </button>
              </motion.div>

              {/* Info Banner for Doctor Registration */}
              {userType === 'doctor' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-200 font-medium">Doctor Registration - 2 Step Process</p>
                      <p className="text-xs text-blue-200/70 mt-1">
                        <strong>Step 1:</strong> Provide basic information and verify email.<br />
                        <strong>Step 2:</strong> Complete your professional profile with qualifications, documents, and fee details.<br />
                        <strong>Final Step:</strong> Our admin team will verify your information and activate your account within 24-48 hours.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Common Fields */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Full Name <span className="text-red-400">*</span>
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
                      Email Address <span className="text-red-400">*</span>
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
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Phone Number */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="relative group">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                      <input
                        type="tel"
                        placeholder="017XXXXXXXX"
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^01[3-9]\d{8}$/,
                            message: 'Enter a valid Bangladeshi phone number'
                          }
                        })}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                      />
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
                      Password <span className="text-red-400">*</span>
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
                      Confirm Password <span className="text-red-400">*</span>
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
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </motion.div>

                  {/* Date of Birth */}
                  <motion.div variants={itemVariants}>
                    <ModernDatePicker
                      label="Date of Birth"
                      value={watch('dateOfBirth')}
                      onChange={(value) => setValue('dateOfBirth', value)}
                      error={errors.dateOfBirth?.message}
                    />
                  </motion.div>

                  {/* Gender */}
                  <motion.div variants={itemVariants}>
                    <GenderSelector
                      value={watch('gender')}
                      onChange={(value) => setValue('gender', value)}
                      error={errors.gender?.message}
                    />
                  </motion.div>
                </div>

                {/* Doctor Specific Fields - ONLY BMDC NUMBER */}
                {userType === 'doctor' && (
                  <div className="space-y-4 pt-2 border-t border-white/20">
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2 mb-4">
                        <Stethoscope className="w-4 h-4" />
                        Professional Information <span className="text-red-400 text-xs">*Required</span>
                      </h3>

                      <div className="space-y-4">
                        {/* BMDC Registration Number */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            BMDC Registration Number <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              placeholder="BMDC-XXXXX"
                              {...register('bmdcRegNo', {
                                required: userType === 'doctor' ? 'BMDC registration number is required' : false
                              })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                          {errors.bmdcRegNo && (
                            <p className="mt-1 text-xs text-pink-300">{errors.bmdcRegNo.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
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
                        {userType === 'patient' ? 'Create Patient Account' : 'Register as Doctor'}
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
          /* ========== OTP VERIFICATION FORM ========== */
          <motion.div
            key="otp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center">

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
              >
                <Mail className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h3
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold text-white mb-2"
              >
                Verify Your Email
              </motion.h3>

              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/70 text-sm mb-6"
              >
                We've sent a 6-digit verification code to <br />
                <span className="text-white font-semibold">{registeredEmail}</span>
              </motion.p>

              {/* OTP Input */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-widest px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  autoFocus
                />
              </motion.div>

              {/* Verify Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  onClick={handleVerifyOTP}
                  isLoading={isVerifying}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold mb-4"
                >
                  Verify & Continue
                </Button>
              </motion.div>

              {/* Resend Link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/60 text-sm"
              >
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-pink-400 hover:text-pink-300 font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend'}
                </button>
              </motion.p>

              {/* Back to Register */}
              <button
                onClick={handleBackToRegister}
                className="mt-4 text-white/50 hover:text-white/70 text-sm transition-colors"
              >
                ← Back to registration
              </button>
            </div>
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