// app/login/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Mail, Lock, Eye, EyeOff, Fingerprint, AlertCircle, Stethoscope, Clock, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/app/components/ui/Button'
import AnimatedBackground from '@/app/components/ui/AnimatedBackground'
import axiosInstance from '@/app/lib/api/axios'
import { showToast } from '@/app/lib/utils/toast'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [doctorStatus, setDoctorStatus] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password
      })

      if (response.data?.success) {
        const { token, user } = response.data.data
        
        // Store token
        localStorage.setItem('token', token)
        
        // Check if user is doctor
        if (user.role === 'doctor') {
          // Fetch doctor profile to check status
          const profileResponse = await axiosInstance.get('/auth/me')
          const doctorProfile = profileResponse.data.data.profile
          
          // Check verification status
          switch (doctorProfile?.verificationStatus) {
            case 'pending':
              // Status: Registered but profile not completed
              setDoctorStatus({
                type: 'incomplete',
                title: 'Profile Incomplete',
                message: 'Please complete your profile to continue.',
                action: 'Complete Profile',
                actionLink: '/doctor/complete-profile',
                icon: AlertCircle,
                color: 'yellow'
              })
              setShowStatusModal(true)
              break
              
            case 'profile_submitted':
              // Status: Profile submitted, waiting for admin review
              setDoctorStatus({
                type: 'pending_review',
                title: 'Profile Under Review',
                message: 'Your profile has been submitted and is pending admin approval. You will receive an email once verified. This usually takes 24-48 hours.',
                action: 'Go to Dashboard',
                actionLink: '/dashboard',
                icon: Clock,
                color: 'blue'
              })
              setShowStatusModal(true)
              break
              
            case 'under_review':
              // Status: Admin is reviewing
              setDoctorStatus({
                type: 'reviewing',
                title: 'Profile Being Reviewed',
                message: 'An admin is currently reviewing your profile. You will be notified via email once completed.',
                action: 'Go to Dashboard',
                actionLink: '/dashboard',
                icon: Clock,
                color: 'blue'
              })
              setShowStatusModal(true)
              break
              
            case 'verified':
              // Status: Fully verified and active
              showToast.success('Login successful! Redirecting to dashboard...')
              setTimeout(() => {
                router.push('/doctor/dashboard')
              }, 1000)
              break
              
            case 'rejected':
              // Status: Rejected
              setDoctorStatus({
                type: 'rejected',
                title: 'Application Rejected',
                message: `Your application has been rejected. Reason: ${doctorProfile.rejectionReason || doctorProfile.verificationNotes || 'Please contact support for more information.'}`,
                action: 'Contact Support',
                actionLink: '/support',
                icon: XCircle,
                color: 'red'
              })
              setShowStatusModal(true)
              break
              
            case 'suspended':
              // Status: Suspended
              setDoctorStatus({
                type: 'suspended',
                title: 'Account Suspended',
                message: 'Your account has been suspended. Please contact support for assistance.',
                action: 'Contact Support',
                actionLink: '/support',
                icon: XCircle,
                color: 'red'
              })
              setShowStatusModal(true)
              break
              
            default:
              // Unknown status
              router.push('/dashboard')
          }
        } else {
          // Patient or Admin login
          showToast.success('Login successful! Redirecting...')
          setTimeout(() => {
            if (user.role === 'admin' || user.role === 'superadmin') {
              router.push('/admin/dashboard')
            } else {
              router.push('/dashboard')
            }
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
      showToast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Status Modal Component
  const StatusModal = ({ status, onClose }) => {
    const Icon = status.icon
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full border border-white/20"
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-${status.color}-500/20`}>
            <Icon className={`w-8 h-8 text-${status.color}-400`} />
          </div>
          
          <h2 className="text-xl font-bold text-white text-center mb-2">
            {status.title}
          </h2>
          
          <p className="text-white/70 text-center text-sm mb-6">
            {status.message}
          </p>
          
          <Button
            onClick={() => {
              setShowStatusModal(false)
              router.push(status.actionLink)
            }}
            className={`w-full bg-gradient-to-r from-${status.color}-500 to-purple-600 text-white py-2 rounded-xl`}
          >
            {status.action}
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative py-8">
      
      <AnimatedBackground />

      {/* Status Modal */}
      {showStatusModal && doctorStatus && (
        <StatusModal status={doctorStatus} onClose={() => setShowStatusModal(false)} />
      )}

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
            className="inline-block p-3 bg-white/10 backdrop-blur-lg rounded-full mb-3"
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
              isLoading={isLoading}
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
            1. Register with basic info → 2. Verify email → 3. Login → 4. Complete profile → 5. Wait for admin approval → 6. Start practicing
          </p>
        </div>
      </motion.div>
    </div>
  )
}