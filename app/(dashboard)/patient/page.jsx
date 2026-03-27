'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, User, FileText, ChevronRight, Activity, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { showToast } from '@/app/lib/utils/toast'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { patientAPI } from '@/app/lib/api/client'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      favoriteDoctors: 0
    },
    upcomingAppointments: [],
    recentPrescriptions: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.getDashboard()
      if (response.success) {
        setDashboardData(response.data)
      }
    } catch (error) {
      showToast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening with your health today.
        </p>
      </div>

      {/* Stats - Compact grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Total Appointments</p>
              <p className="text-xl font-bold text-gray-900">{dashboardData.stats.totalAppointments}</p>
            </div>
            <Calendar className="w-6 h-6 text-primary-600 opacity-50" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">{dashboardData.stats.completedAppointments}</p>
            </div>
            <Activity className="w-6 h-6 text-green-600 opacity-50" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-xl font-bold text-gray-900">{dashboardData.stats.cancelledAppointments}</p>
            </div>
            <Clock className="w-6 h-6 text-red-600 opacity-50" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Favorites</p>
              <p className="text-xl font-bold text-gray-900">{dashboardData.stats.favoriteDoctors}</p>
            </div>
            <Heart className="w-6 h-6 text-pink-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Upcoming Appointments - Compact */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link href="/patient/appointments" className="text-xs text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {dashboardData.upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No upcoming appointments</p>
              <Link href="/patient/doctors" className="inline-block mt-2 text-xs text-primary-600 hover:text-primary-700">
                Book an appointment →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {dashboardData.upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment._id}
                  href={`/patient/appointments/${appointment._id}`}
                  className="block p-3 border rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        Dr. {appointment.doctor?.user?.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{appointment.doctor?.specialization}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                        <span>{format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</span>
                        <span>{appointment.startTime}</span>
                        <span className="capitalize">{appointment.type}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Prescriptions - Compact */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Recent Prescriptions</h2>
            <Link href="/patient/prescriptions" className="text-xs text-primary-600 hover:text-primary-700">
              View All
            </Link>
          </div>
        </div>
        
        <div className="p-4">
          {dashboardData.recentPrescriptions.length === 0 ? (
            <div className="text-center py-6">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No prescriptions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {dashboardData.recentPrescriptions.map((prescription) => (
                <Link
                  key={prescription._id}
                  href={`/patient/prescriptions/${prescription._id}`}
                  className="block p-3 border rounded-lg hover:border-primary-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        Dr. {prescription.doctor?.user?.fullName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {prescription.diagnosis}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}