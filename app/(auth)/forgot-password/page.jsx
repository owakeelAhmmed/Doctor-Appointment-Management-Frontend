'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Mail, ArrowLeft, Send, Fingerprint, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Input from '@/app/components/ui/Input'
import Button from '@/app/components/ui/Button'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import { showToast } from '@/app/lib/utils/toast'
import axiosInstance from '@/app/lib/api/axios'

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const email = watch('email')

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await axiosInstance.post('/auth/forgot-password', {
        email: data.email
      })

      if (response.success) {
        setSubmittedEmail(data.email)
        setIsSubmitted(true)
        showToast.success('Password reset email sent!', {
          description: 'Please check your email for the reset link'
        })
      }
    } catch (error) {
      // Error handled by axios interceptor
      console.error('Forgot password error:', error)
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
            {isSubmitted ? 'Check Your Email' : 'Forgot Password?'}
          </motion.h1>
          <motion.p className="text-white/70 text-sm">
            {isSubmitted 
              ? `We've sent a reset link to ${submittedEmail}`
              : 'Enter your email and we\'ll send you a reset link'}
          </motion.p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                  />
                  {email?.includes('@') && !errors.email && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-pink-300 flex items-center gap-1"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                  </motion.p>
                )}
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
                  {!isLoading && (
                    <span className="flex items-center justify-center gap-2">
                      Send Reset Link
                      <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </motion.div>
            </form>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>

              <div className="space-y-2">
                <p className="text-white/80 text-sm">
                  We've sent a password reset link to:
                </p>
                <p className="text-white font-medium text-lg">{submittedEmail}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-4 text-left space-y-3">
                <p className="text-white/60 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                  Check your spam folder if you don't see the email
                </p>
                <p className="text-white/60 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                  The link will expire in 10 minutes
                </p>
                <p className="text-white/60 text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                  Click the link to reset your password
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-white/20 text-white hover:bg-white/10"
                >
                  Try different email
                </Button>

                <Link 
                  href="/login" 
                  className="block text-sm text-pink-400 hover:text-pink-300 transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Help Text */}
        <motion.p 
          variants={itemVariants}
          className="mt-6 text-center text-white/40 text-xs"
        >
          Remember your password?{' '}
          <Link href="/login" className="text-pink-400 hover:text-pink-300 transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  )
}