'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, User, DollarSign, Star, TrendingUp,
  Users, Activity, CheckCircle, AlertCircle, FileCheck,
  Upload, Shield, Award, Building, Phone, Mail, MapPin,
  Lock, AlertTriangle
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorDashboard() {
  const router = useRouter()
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctorStatus, setDoctorStatus] = useState(null)
  const [verificationInfo, setVerificationInfo] = useState(null)

  useEffect(() => {
    checkDoctorStatus()
  }, [])

  const checkDoctorStatus = async () => {
    setIsLoading(true)
    try {
      // First get verification status
      const statusResponse = await doctorAPI.getVerificationStatus()
      const statusData = statusResponse.data?.data
      setVerificationInfo(statusData)
      
      const verificationStatus = statusData?.verificationStatus
      const isVerified = verificationStatus === 'verified'
      
      setDoctorStatus({ 
        status: verificationStatus, 
        isVerified,
        requiredSteps: statusData?.requiredSteps || []
      })
      
      // If verified, load full dashboard
      if (isVerified) {
        await loadDashboard()
      } else {
        // Show limited dashboard with verification pending info
        setDashboardData(null)
      }
      
    } catch (error) {
      console.error('Error checking doctor status:', error)
      showToast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboard = async () => {
    try {
      const response = await doctorAPI.getDashboard()
      if (response.success) {
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      // If error (403), means not verified - just show pending UI
      if (error.response?.status === 403) {
        setDashboardData(null)
      } else {
        setDashboardData({
          stats: {
            totalPatients: 0,
            totalEarnings: 0,
            averageRating: 0,
            totalReviews: 0,
            todayAppointments: 0,
            pendingAppointments: 0,
            monthEarnings: 0
          },
          upcomingAppointments: [],
          recentPatients: []
        })
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  // Pending Verification UI - Limited Access
  if (!doctorStatus?.isVerified) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, Dr. {session?.user?.name || session?.user?.fullName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600 font-medium">Account Pending Verification</span>
          </div>
        </div>

        {/* Verification Progress Card */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Complete Your Verification</h2>
              <p className="text-gray-600 text-sm mt-1">
                Please complete the following steps to activate your account. 
                You will get full access to appointments, patients, and earnings after verification.
              </p>
              
              <div className="mt-4 space-y-2">
                {verificationInfo?.requiredSteps?.map((step, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {step.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : step.required ? (
                      <div className="w-5 h-5 rounded-full border-2 border-yellow-500 animate-pulse" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={`text-sm ${step.completed ? 'text-gray-600' : 'text-yellow-600 font-medium'}`}>
                      {step.step}
                    </span>
                    {!step.completed && step.required && (
                      <button
                        onClick={() => {
                          if (step.step === 'Professional Details') {
                            router.push('/doctor/complete-profile')
                          } else if (step.step === 'Document Upload') {
                            router.push('/doctor/documents')
                          }
                        }}
                        className="ml-auto text-xs text-primary-600 hover:text-primary-700"
                      >
                        Complete Now →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Limited Access Notice */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Limited Access Mode</h3>
              <p className="text-sm text-blue-700 mt-1">
                While your account is pending verification, you can only:
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                <li>Complete your profile information</li>
                <li>Upload verification documents</li>
                <li>Check verification status</li>
              </ul>
              <p className="text-sm text-blue-700 mt-2">
                After verification, you will have full access to manage appointments, patients, and earnings.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Only Profile and Documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/doctor/complete-profile')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Complete Profile</h3>
              <p className="text-xs text-gray-500">Add your specialization and experience</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/doctor/documents')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Upload Documents</h3>
              <p className="text-xs text-gray-500">Submit verification documents</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Fully Verified Dashboard
  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const stats = dashboardData.stats

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, Dr. {session?.user?.name || session?.user?.fullName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Verified Doctor</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">Full Access Enabled</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => router.push('/doctor/schedule')}
            className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100"
          >
            Update Schedule
          </button>
          <button 
            onClick={() => router.push('/doctor/appointments')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            View Appointments
          </button>
        </div>
      </div>

      {/* Stats Cards - Full Access */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-primary-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients || 0}</p>
            </div>
            <Users className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month Earnings</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.monthEarnings || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900">{stats.averageRating || 0}</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <button 
            onClick={() => router.push('/doctor/appointments')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </button>
        </div>
        <div className="p-6">
          {dashboardData.upcomingAppointments?.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dashboardData.upcomingAppointments?.slice(0, 5).map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{apt.patient?.user?.fullName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(apt.appointmentDate).toLocaleDateString('bn-BD')}</span>
                        <Clock className="w-3 h-3" />
                        <span>{apt.startTime}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    apt.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}