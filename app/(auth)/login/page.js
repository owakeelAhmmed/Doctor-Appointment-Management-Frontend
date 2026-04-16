'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, Fingerprint, AlertCircle, Stethoscope } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/app/components/ui/Button'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import { useAuth } from '@/app/lib/hooks/useAuth'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect')
  const prefilledEmail = searchParams.get('email')
  
  const { login, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      email: prefilledEmail || '',
      password: '',
    }
  })

  useEffect(() => {
    if (prefilledEmail) {
      setValue('email', prefilledEmail)
    }
  }, [prefilledEmail, setValue])

  const onSubmit = async (data) => {
    setIsLoading(true)

    const result = await login(data.email, data.password)
    
    if (result.success) {
      const user = result.user
      
      // Handle based on user role
      if (user.role === 'doctor') {
        const verificationStatus = user.verificationStatus || 'pending'

        if (verificationStatus === 'pending') {
          router.push('/doctor/complete-profile')
        } else if (verificationStatus === 'profile_submitted') {
          router.push('/doctor/documents')
        } else {
          router.push('/doctor')
        }
      }
      else if (user.role === 'admin' || user.role === 'superadmin') {
        router.push('/admin')
      }
      else {
        router.push('/patient')
      }
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative py-8">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="inline-block p-3 bg-white/10 backdrop-blur-lg rounded-full mb-3 cursor-pointer"
          >
            <Fingerprint className="w-10 h-10 text-white" />
          </motion.div>

          <h1 className="text-3xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-white/70 text-sm">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
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
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-pink-300 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading || authLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-2.5 rounded-xl"
            >
              Sign In
            </Button>

            {/* Register Link */}
            <p className="text-center text-white/70 text-sm">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Create Account
              </Link>
            </p>
          </form>
        </div>

        {/* Info Box for Doctors */}
        <div className="mt-6 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <Stethoscope className="w-3 h-3" />
            <span>Doctor Registration Process:</span>
          </div>
          <p className="text-xs text-white/40 mt-1">
            1. Register → 2. Verify Email → 3. Complete Profile → 4. Upload Documents → 5. Admin Verification → 6. Start Practicing
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}