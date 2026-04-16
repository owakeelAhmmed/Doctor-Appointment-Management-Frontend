// app/(dashboard)/doctor/page.jsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, User, DollarSign, Star, TrendingUp,
  Users, Activity, CheckCircle, AlertCircle, FileCheck,
  Upload, Shield, Award, Building, Phone, Mail, MapPin,
  Lock, AlertTriangle, Send, Clock as ClockIcon, CheckCircle2,
  FileText, UserCheck, Briefcase, RefreshCw, Eye, ChevronRight
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [doctorStatus, setDoctorStatus] = useState(null)
  const [verificationInfo, setVerificationInfo] = useState(null)

  const loadDashboard = useCallback(async () => {
    try {
      const response = await doctorAPI.getDashboard()
      if (response?.success || response?.data?.success) {
        const data = response.data || response
        setDashboardData(data)
        return true
      }
      return false
    } catch (error) {
      console.error('Dashboard error:', error)
      if (error.response?.status === 403) {
        setDashboardData(null)
      }
      return false
    }
  }, [])

  const checkDoctorStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      const statusResponse = await doctorAPI.getVerificationStatus()
      const statusData = statusResponse?.data?.data || statusResponse?.data
      setVerificationInfo(statusData)
      
      const verificationStatus = statusData?.verificationStatus || 'pending'
      const isVerified = verificationStatus === 'verified'
      const isProfileSubmitted = verificationStatus === 'profile_submitted'
      const isDocumentSubmitted = verificationStatus === 'document_verification'
      const isUnderReview = verificationStatus === 'under_review'
      
      setDoctorStatus({ 
        status: verificationStatus, 
        isVerified,
        isProfileSubmitted,
        isDocumentSubmitted,
        isUnderReview,
        requiredSteps: statusData?.requiredSteps || [],
        profileCompletionPercentage: statusData?.profileCompletionPercentage || 0
      })
      
      if (isVerified) {
        await loadDashboard()
      } else {
        setDashboardData(null)
      }
      
    } catch (error) {
      console.error('Error checking doctor status:', error)
      setDoctorStatus({ 
        status: 'pending', 
        isVerified: false,
        isProfileSubmitted: false,
        isDocumentSubmitted: false,
        isUnderReview: false
      })
      setDashboardData(null)
    } finally {
      setIsLoading(false)
    }
  }, [loadDashboard])

  useEffect(() => {
    checkDoctorStatus()
  }, [checkDoctorStatus])

  const formatCurrency = (amount) => {
    if (!amount) return '৳0'
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Loading State
  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    )
  }

  // If doctor is verified but dashboard data is still loading
  if (doctorStatus?.isVerified && !dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-gray-500">Loading your dashboard...</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Refresh
        </button>
      </div>
    )
  }

  // Show Profile Submitted Success Message
  if (doctorStatus?.isProfileSubmitted && !doctorStatus?.isVerified && !doctorStatus?.isDocumentSubmitted) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.fullName || 'Doctor'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Send className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Profile Submitted Successfully!</span>
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-green-800">Profile Submitted Successfully!</h2>
              <p className="text-green-700 mt-1">
                Your doctor profile has been submitted. Now please upload your verification documents to complete the process.
              </p>
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-300">
                <h3 className="font-semibold text-gray-800 mb-2">📋 Next Steps:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">✅ Basic information completed</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-[10px] text-white">2</span>
                    </div>
                    <span className="text-gray-700">📄 Upload verification documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-[10px] text-white">3</span>
                    </div>
                    <span className="text-gray-500">⏳ Wait for admin verification</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => router.push('/doctor/documents')}
                className="mt-4 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload Documents Now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <ClockIcon className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">What happens next?</h3>
              <p className="text-sm text-blue-700 mt-1">
                After you upload your documents, our admin team will review your application.
                You will receive an email notification once your account is verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show Document Under Review / Waiting for Admin
  if ((doctorStatus?.isDocumentSubmitted || doctorStatus?.isUnderReview) && !doctorStatus?.isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.fullName || 'Doctor'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <ClockIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Under Review</span>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-800">Application Under Review</h2>
              <p className="text-blue-700 mt-1">
                Your documents have been submitted successfully! Our admin team is now reviewing your application.
              </p>
              <div className="mt-4 bg-white rounded-lg p-4 border border-gray-300">
                <h3 className="font-semibold text-gray-800 mb-3">📊 Verification Progress:</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Profile Information</span>
                    </div>
                    <span className="text-xs text-green-600">Completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-600">Documents Uploaded</span>
                    </div>
                    <span className="text-xs text-green-600">Completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-500 animate-pulse" />
                      <span className="text-sm text-blue-600 font-medium">Admin Verification</span>
                    </div>
                    <span className="text-xs text-blue-600">In Progress</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
                <ClockIcon className="w-4 h-4" />
                <span>Estimated time: 24-48 hours</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">What happens next?</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Our admin team will verify your documents. You will receive an email notification once verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pending Verification UI - Profile not submitted yet
  if (!doctorStatus?.isProfileSubmitted && !doctorStatus?.isDocumentSubmitted && !doctorStatus?.isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.fullName || 'Doctor'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-600 font-medium">Profile Incomplete</span>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Complete Your Profile</h2>
              <p className="text-gray-600 text-sm mt-1">
                Please complete your doctor profile to start the verification process.
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Basic Registration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Email Verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-yellow-500 animate-pulse" />
                  <span className="text-sm text-yellow-600 font-medium">Professional Details (Required)</span>
                  <button
                    onClick={() => router.push('/doctor/complete-profile')}
                    className="ml-auto text-xs text-green-600 hover:text-green-700 cursor-pointer"
                  >
                    Complete Now →
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-400">Document Upload</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/doctor/complete-profile')}
            className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-medium text-gray-900">Complete Profile</h3>
              <p className="text-xs text-gray-500">Add your specialization and experience</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>
    )
  }

  // Fully Verified Dashboard
  if (!dashboardData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        <p className="text-gray-500">Loading dashboard data...</p>
        <button 
          onClick={checkDoctorStatus}
          className="mt-4 px-4 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Retry
        </button>
      </div>
    )
  }

  const stats = dashboardData.stats || {}
  const upcomingAppointments = dashboardData.upcomingAppointments || []
  const recentPatients = dashboardData.recentPatients || []

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name || user?.fullName || 'Doctor'}
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
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all cursor-pointer border border-gray-300"
          >
            Update Schedule
          </button>
          <button 
            onClick={() => router.push('/doctor/appointments')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
          >
            View Appointments
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/doctor/appointments/today')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments || 0}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/doctor/patients')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients || 0}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/doctor/earnings')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">This Month Earnings</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.monthEarnings || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300 hover:shadow-md transition-all cursor-pointer" onClick={() => router.push('/doctor/reviews')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-gray-900">{stats.averageRating || 0}</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-400">({stats.totalReviews || 0} reviews)</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <button 
            onClick={() => router.push('/doctor/appointments')}
            className="text-sm text-green-600 hover:text-green-700 cursor-pointer flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map((apt) => (
                <div 
                  key={apt._id} 
                  onClick={() => router.push(`/doctor/appointments/${apt._id}`)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-300 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{apt.patientInfo?.name || apt.patient?.user?.fullName || 'Patient'}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(apt.appointmentDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(apt.startTime)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Patients */}
      {recentPatients.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
            <button 
              onClick={() => router.push('/doctor/patients')}
              className="text-sm text-green-600 hover:text-green-700 cursor-pointer flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentPatients.slice(0, 5).map((patient, idx) => (
                <div 
                  key={idx}
                  onClick={() => router.push(`/doctor/patients/${patient._id}`)}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-300 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{patient.user?.fullName || 'Patient'}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {patient.visitCount || 0} visits
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Last: {formatDate(patient.lastVisitDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/doctor/schedule')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-300 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 text-sm">Manage</p>
            <p className="text-xs text-gray-500">Schedule</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/doctor/earnings')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-300 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
            <DollarSign className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 text-sm">View</p>
            <p className="text-xs text-gray-500">Earnings</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/doctor/patients')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-300 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 text-sm">View All</p>
            <p className="text-xs text-gray-500">Patients</p>
          </div>
        </button>

        <button
          onClick={() => router.push('/doctor/reviews')}
          className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-300 hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-200 transition-colors">
            <Star className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 text-sm">Check</p>
            <p className="text-xs text-gray-500">Reviews</p>
          </div>
        </button>
      </div>
    </div>
  )
}