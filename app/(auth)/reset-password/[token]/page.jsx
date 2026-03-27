'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Lock, Eye, EyeOff, ArrowLeft, Fingerprint, AlertCircle, CheckCircle, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import Input from '@/app/components/ui/Input'
import Button from '@/app/components/ui/Button'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import PasswordStrengthMeter from '@/app/components/auth/PasswordStrengthMeter'
import { showToast } from '@/app/lib/utils/toast'
import axiosInstance from '@/app/lib/api/axios'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState(true)
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  
  const password = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false)
      showToast.error('Invalid reset token')
    }
  }, [token])

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await axiosInstance.post('/auth/reset-password', {
        token: token,
        newPassword: data.newPassword
      })

      if (response.success) {
        setIsSuccess(true)
        showToast.success('Password reset successful!', {
          description: 'You can now login with your new password'
        })
        
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setIsValidToken(false)
      }
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

  // Invalid Token View
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
        <AnimatedBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md px-4"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h2>
            <p className="text-white/70 text-sm mb-6">
              This password reset link is invalid or has expired.
            </p>
            
            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                  Request New Link
                </Button>
              </Link>
              
              <Link href="/login" className="block text-sm text-pink-400 hover:text-pink-300">
                Back to login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success View
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
        <AnimatedBackground />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md px-4"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-white/70 text-sm mb-6">
              Your password has been successfully reset.
            </p>
            
            <p className="text-white/50 text-xs mb-4">
              Redirecting to login in 3 seconds...
            </p>
            
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
                Go to Login
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Reset Password Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      
      <AnimatedBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >

        {/* Back to Login Link */}
        <motion.div variants={itemVariants} className="mb-6">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to login</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="inline-block p-4 bg-white/10 backdrop-blur-lg rounded-full mb-4 cursor-pointer"
          >
            <Fingerprint className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 className="text-3xl font-bold text-white mb-2">
            Reset Password
          </motion.h1>
          <motion.p className="text-white/70 text-sm">
            Enter your new password below
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* New Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                New Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  {...register('newPassword', { 
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)/,
                      message: 'Password must contain at least one letter and one number'
                    }
                  })}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <PasswordStrengthMeter password={password} />
              
              {errors.newPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-pink-300 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.newPassword.message}
                </motion.p>
              )}
            </motion.div>

            {/* Confirm Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {confirmPassword?.length > 0 && confirmPassword === password && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-10 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </motion.div>
                )}
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-pink-300 flex items-center gap-1"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Requirements */}
            <motion.div 
              variants={itemVariants}
              className="bg-white/5 rounded-xl p-4 space-y-2"
            >
              <p className="text-white/60 text-xs flex items-center gap-2">
                <Shield className="w-3 h-3 text-pink-400" />
                At least 8 characters
              </p>
              <p className="text-white/60 text-xs flex items-center gap-2">
                <Shield className="w-3 h-3 text-pink-400" />
                At least one letter
              </p>
              <p className="text-white/60 text-xs flex items-center gap-2">
                <Shield className="w-3 h-3 text-pink-400" />
                At least one number
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 border-0 text-white py-3 rounded-xl shadow-lg shadow-purple-500/25"
              >
                {!isLoading && 'Reset Password'}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}