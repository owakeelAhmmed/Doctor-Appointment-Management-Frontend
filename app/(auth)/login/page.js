'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Fingerprint } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { FaGithub, FaGoogle } from "react-icons/fa"
import Input from '@/app/components/ui/Input'
import Button from '@/app/components/ui/Button'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import { showToast } from '@/app/lib/utils/toast'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: '/'
      })

      if (result?.error) {
        showToast.error('Invalid email or password')
      } else {
        showToast.success('Login successful! Redirecting...')
        
        // Get session after successful login
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        
        setTimeout(() => {
          if (session?.user?.role === 'patient') {
            router.push('/patient')
          } else if (session?.user?.role === 'doctor') {
            router.push('/doctor')
          } else if (session?.user?.role === 'admin' || session?.user?.role === 'superadmin') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }, 1500)
      }
    } catch (error) {
      showToast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Animation variants
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

  const floatingShapeVariants = {
    animate: (i) => ({
      x: [0, 30, 0, -30, 0],
      y: [0, -30, 0, 30, 0],
      rotate: [0, 90, 180, 270, 360],
      transition: {
        duration: 20 + i * 2,
        repeat: Infinity,
        ease: "linear"
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={floatingShapeVariants}
            animate="animate"
            className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-20"
            style={{
              width: `${150 + i * 50}px`,
              height: `${150 + i * 50}px`,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 20}%`,
              background: `radial-gradient(circle, ${
                ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'][i]
              } 0%, transparent 70%)`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >

        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            className="inline-block p-4 bg-white/10 backdrop-blur-lg rounded-full mb-4"
          >
            <Fingerprint className="w-12 h-12 text-white" />
          </motion.div>
          <motion.h1 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </motion.h1>
          <motion.p className="text-white/70">
            Sign in to continue to your dashboard
          </motion.p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          variants={itemVariants}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <form autoComplete="off" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
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
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-pink-300">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-pink-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', { 
                    required: 'Password is required'
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
              {errors.password && (
                <p className="mt-1 text-sm text-pink-300">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 bg-white/5 border-white/20 rounded text-pink-500 focus:ring-pink-500 focus:ring-offset-0"
                />
                <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                  Remember me
                </span>
              </label>
              
              <Link 
                href="/forgot-password"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
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
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </motion.div>

            {/* Sign Up Link */}
            <motion.p 
              variants={itemVariants}
              className="text-center text-white/70 text-sm"
            >
              Don't have an account?{' '}
              <Link 
                href="/register" 
                className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
              >
                Create account
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  )
}