'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { 
  User, Mail, Lock, Eye, EyeOff, 
  Sparkles, Heart, Shield, CheckCircle, Fingerprint, 
  AlertCircle, Stethoscope, UserPlus, GraduationCap, 
  Calendar, Building, Banknote, CreditCard, 
  Smartphone, FileText, Upload, Clock, Award
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [userType, setUserType] = useState('patient')
  const [showOTPInput, setShowOTPInput] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registeredUserType, setRegisteredUserType] = useState('')
  
  // File states for doctor documents
  const [bmdcCertificate, setBmdcCertificate] = useState(null)
  const [nidCard, setNidCard] = useState(null)
  const [mbbsCertificate, setMbbsCertificate] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState(null)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      // Doctor specific fields
      bmdcRegNo: '',
      specialization: '',
      experienceYears: '',
      currentWorkplace: '',
      consultationFee: '',
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      bKashNumber: '',
      nagadNumber: '',
      qualifications: '',
    }
  })

  const password = watch('password')
  const fullName = watch('fullName')
  const email = watch('email')

  // Handle file upload
  const handleFileUpload = (field, file) => {
    if (!file) return false
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      showToast.error('Please upload JPEG, PNG, or PDF file')
      return false
    }
    
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('File size must be less than 5MB')
      return false
    }

    switch(field) {
      case 'bmdcCertificate':
        setBmdcCertificate(file)
        break
      case 'nidCard':
        setNidCard(file)
        break
      case 'mbbsCertificate':
        setMbbsCertificate(file)
        break
      case 'profilePhoto':
        setProfilePhoto(file)
        break
    }
    return true
  }

  // Step 1: Register user
  const onSubmit = async (data) => {
    if (!termsAccepted) {
      showToast.error('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)
    
    try {
      const formData = new FormData()
      
      // Basic info
      formData.append('fullName', data.fullName)
      formData.append('email', data.email)
      formData.append('password', data.password)
      formData.append('dateOfBirth', data.dateOfBirth)
      formData.append('gender', data.gender)
      formData.append('role', userType)

      if (userType === 'doctor') {
        // Doctor profile info
        formData.append('bmdcRegNo', data.bmdcRegNo)
        formData.append('specialization', data.specialization)
        formData.append('experienceYears', data.experienceYears)
        formData.append('currentWorkplace', data.currentWorkplace)
        formData.append('consultationFee', data.consultationFee)
        formData.append('qualifications', data.qualifications)
        
        // Bank info
        formData.append('bankName', data.bankName)
        formData.append('accountNumber', data.accountNumber)
        formData.append('accountHolderName', data.accountHolderName)
        
        // Mobile banking
        formData.append('bKashNumber', data.bKashNumber)
        formData.append('nagadNumber', data.nagadNumber)
        
        // Upload documents
        if (bmdcCertificate) formData.append('bmdcCertificate', bmdcCertificate)
        if (nidCard) formData.append('nidCard', nidCard)
        if (mbbsCertificate) formData.append('mbbsCertificate', mbbsCertificate)
        if (profilePhoto) formData.append('profilePhoto', profilePhoto)
      }

      const response = await axiosInstance.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.success) {
        setRegisteredEmail(data.email)
        setRegisteredUserType(userType)
        setShowOTPInput(true)
        
        const successMessage = userType === 'doctor' 
          ? 'Registration successful! Please verify your email. Our team will review your documents within 24-48 hours.'
          : 'Verification code sent to your email!'
        
        showToast.success(successMessage, {
          description: userType === 'doctor' 
            ? `We've sent a verification code to ${data.email}. You'll be notified once your account is approved.`
            : `We've sent a 6-digit code to ${data.email}`
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify Email OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      showToast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)

    try {
      const response = await axiosInstance.post('/auth/verify-email', {
        email: registeredEmail,
        otp: otpCode
      })

      if (response.success) {
        if (registeredUserType === 'doctor') {
          showToast.success('Email verified successfully!', {
            description: 'Your application has been submitted for review. You will receive an email once approved. This usually takes 24-48 hours.'
          })
          setTimeout(() => {
            router.push('/login')
          }, 3000)
        } else {
          showToast.success('Email verified successfully!', {
            description: 'Your account has been created. Redirecting to login...'
          })
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error)
    } finally {
      setIsLoading(false)
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

      if (response.success) {
        showToast.success('New OTP sent to your email!')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
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
        className="relative z-10 w-full max-w-2xl px-4"
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
          /* Registration Form */
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
                    <Award className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-200 font-medium">Doctor Registration Information</p>
                      <p className="text-xs text-blue-200/70 mt-1">
                        Please provide all required documents. Your account will be verified by our admin team 
                        within 24-48 hours. You will receive an email once your account is approved.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Common Fields for Both Patient & Doctor */}
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

                {/* Doctor Specific Fields - Fixed Version */}
                {userType === 'doctor' && (
                  <div className="space-y-4 pt-2 border-t border-white/20">
                    {/* Professional Information Section */}
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
                              {...register('bmdcRegNo', { required: userType === 'doctor' ? 'BMDC registration number is required' : false })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                          {errors.bmdcRegNo && (
                            <p className="mt-1 text-xs text-pink-300">{errors.bmdcRegNo.message}</p>
                          )}
                        </div>

                        {/* Specialization */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Specialization <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              placeholder="Cardiology, Neurology, etc."
                              {...register('specialization', { required: userType === 'doctor' ? 'Specialization is required' : false })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                          {errors.specialization && (
                            <p className="mt-1 text-xs text-pink-300">{errors.specialization.message}</p>
                          )}
                        </div>

                        {/* Qualifications */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Qualifications (MBBS, FCPS, etc.) <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            rows={2}
                            placeholder="MBBS (Dhaka Medical College), FCPS (Cardiology)..."
                            {...register('qualifications', { required: userType === 'doctor' ? 'Qualifications are required' : false })}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm resize-none"
                          />
                          {errors.qualifications && (
                            <p className="mt-1 text-xs text-pink-300">{errors.qualifications.message}</p>
                          )}
                        </div>

                        {/* Experience Years */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Years of Experience <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="number"
                              placeholder="5"
                              {...register('experienceYears', { 
                                required: userType === 'doctor' ? 'Experience years is required' : false,
                                min: { value: 0, message: 'Minimum 0 years' },
                                max: { value: 70, message: 'Maximum 70 years' }
                              })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                          {errors.experienceYears && (
                            <p className="mt-1 text-xs text-pink-300">{errors.experienceYears.message}</p>
                          )}
                        </div>

                        {/* Current Workplace */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Current Workplace <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="text"
                              placeholder="City Hospital, Dhaka"
                              {...register('currentWorkplace', { required: userType === 'doctor' ? 'Current workplace is required' : false })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                          {errors.currentWorkplace && (
                            <p className="mt-1 text-xs text-pink-300">{errors.currentWorkplace.message}</p>
                          )}
                        </div>

                        {/* Consultation Fee */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Consultation Fee (BDT) <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                              type="number"
                              placeholder="500"
                              {...register('consultationFee', { 
                                required: userType === 'doctor' ? 'Consultation fee is required' : false,
                                min: { value: 0, message: 'Fee must be positive' }
                              })}
                              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                          {errors.consultationFee && (
                            <p className="mt-1 text-xs text-pink-300">{errors.consultationFee.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Required Documents Section */}
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2 mt-4">
                        <Upload className="w-4 h-4" />
                        Required Documents <span className="text-red-400 text-xs">*</span>
                      </h3>
                      
                      <p className="text-xs text-white/50 mb-3 mt-1">Upload clear images or PDFs (Max 5MB each)</p>

                      <div className="space-y-3">
                        {/* BMDC Certificate */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            BMDC Certificate <span className="text-red-400">*</span>
                          </label>
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-pink-500 transition-colors bg-white/5">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload('bmdcCertificate', e.target.files[0])}
                              className="hidden"
                              id="bmdcCertificate"
                            />
                            <label htmlFor="bmdcCertificate" className="cursor-pointer block">
                              <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                              <p className="text-xs text-white/60">
                                {bmdcCertificate ? bmdcCertificate.name : 'Click to upload BMDC Certificate'}
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* NID Card */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            NID Card <span className="text-red-400">*</span>
                          </label>
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-pink-500 transition-colors bg-white/5">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload('nidCard', e.target.files[0])}
                              className="hidden"
                              id="nidCard"
                            />
                            <label htmlFor="nidCard" className="cursor-pointer block">
                              <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                              <p className="text-xs text-white/60">
                                {nidCard ? nidCard.name : 'Click to upload NID Card'}
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* MBBS Certificate */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            MBBS Certificate <span className="text-red-400">*</span>
                          </label>
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-pink-500 transition-colors bg-white/5">
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload('mbbsCertificate', e.target.files[0])}
                              className="hidden"
                              id="mbbsCertificate"
                            />
                            <label htmlFor="mbbsCertificate" className="cursor-pointer block">
                              <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                              <p className="text-xs text-white/60">
                                {mbbsCertificate ? mbbsCertificate.name : 'Click to upload MBBS Certificate'}
                              </p>
                            </label>
                          </div>
                        </div>

                        {/* Profile Photo */}
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Profile Photo <span className="text-red-400">*</span>
                          </label>
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-3 text-center hover:border-pink-500 transition-colors bg-white/5">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload('profilePhoto', e.target.files[0])}
                              className="hidden"
                              id="profilePhoto"
                            />
                            <label htmlFor="profilePhoto" className="cursor-pointer block">
                              <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                              <p className="text-xs text-white/60">
                                {profilePhoto ? profilePhoto.name : 'Click to upload Profile Photo'}
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Information (Optional) Section */}
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2 mt-4">
                        <CreditCard className="w-4 h-4" />
                        Payment Information (Optional)
                      </h3>

                      <div className="space-y-3 mt-3">
                        {/* Bank Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Bank Name
                            </label>
                            <input
                              type="text"
                              placeholder="Dutch-Bangla Bank"
                              {...register('bankName')}
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Account Number
                            </label>
                            <input
                              type="text"
                              placeholder="XXXXXXXXXX"
                              {...register('accountNumber')}
                              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            placeholder="Dr. John Doe"
                            {...register('accountHolderName')}
                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                          />
                        </div>

                        {/* Mobile Banking */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              bKash Number
                            </label>
                            <div className="relative">
                              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                              <input
                                type="tel"
                                placeholder="017XXXXXXXX"
                                {...register('bKashNumber')}
                                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-1">
                              Nagad Number
                            </label>
                            <div className="relative">
                              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                              <input
                                type="tel"
                                placeholder="017XXXXXXXX"
                                {...register('nagadNumber')}
                                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                              />
                            </div>
                          </div>
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
                        {userType === 'patient' ? 'Create Patient Account' : 'Submit Doctor Application'}
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
          /* Email OTP Verification */
          <motion.div
            key="otp"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
              
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Verify Your Email</h3>
              
              <p className="text-white/70 text-sm mb-6">
                We've sent a 6-digit verification code to <br />
                <span className="text-white font-semibold">{registeredEmail}</span>
              </p>
              
              {/* OTP Input */}
              <div className="mb-6">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-2xl tracking-widest px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>
              
              {/* Verify Button */}
              <Button
                onClick={handleVerifyOTP}
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-xl font-semibold mb-4"
              >
                Verify & Continue
              </Button>
              
              {/* Resend Link */}
              <p className="text-white/60 text-sm">
                Didn't receive the code?{' '}
                <button
                  onClick={handleResendOTP}
                  className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
                >
                  Resend
                </button>
              </p>
              
              {/* Back to Register */}
              <button
                onClick={() => setShowOTPInput(false)}
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