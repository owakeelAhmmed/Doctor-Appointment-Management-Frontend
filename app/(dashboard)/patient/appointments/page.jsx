'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Search,
  Video,
  Phone,
  MapPin,
  Plus,
  Stethoscope
} from 'lucide-react'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

// Helper function to format date
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function AppointmentsPage() {
  const searchParams = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    type: 'all',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1
  })

  useEffect(() => {
    fetchAppointments()
  }, [filters])
  
  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.getMyAppointments(filters)

      console.log('Full response:', response)

      let appointmentsData = []
      let paginationData = { total: 0, pages: 1, page: 1 }

      if (response?.data?.success) {
        appointmentsData = response.data.data || []
        paginationData = response.data.pagination || paginationData
      }
      else if (response?.success) {
        appointmentsData = response.data || []
        paginationData = response.pagination || paginationData
      }

      console.log('Appointments data:', appointmentsData)
      console.log('Pagination:', paginationData)

      setAppointments(appointmentsData)
      setPagination(paginationData)

    } catch (error) {
      console.error('Error fetching appointments:', error)
      showToast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed'
      case 'pending': return 'Pending'
      case 'completed': return 'Completed'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const getTypeText = (type) => {
    switch (type) {
      case 'video': return 'Video Call'
      case 'phone': return 'Phone Call'
      case 'in-person': return 'In-Person'
      default: return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your appointments</p>
        </div>
        <Link
          href="/patient/doctors"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Book New</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">You haven't booked any appointments yet.</p>
          <Link
            href="/patient/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Find Doctors
            <Search className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment, index) => {
            // 🔥 ডাক্তারের তথ্য doctorInfo থেকে নিন
            const doctorName = appointment.doctorInfo?.name || appointment.doctor?.user?.fullName || 'Doctor'
            const doctorSpecialization = appointment.doctorInfo?.specialization || appointment.doctor?.specialization || 'General Medicine'
            const doctorProfileImage = appointment.doctorInfo?.profileImage || appointment.doctor?.user?.profileImage?.url
            
            // পেশেন্টের তথ্য patientInfo থেকে নিন
            const patientName = appointment.patientInfo?.name || appointment.patient?.user?.fullName || 'Patient'
            
            return (
              <motion.div
                key={appointment._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Profile Image */}
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {doctorProfileImage ? (
                        <img 
                          src={doctorProfileImage} 
                          alt={doctorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Stethoscope className="w-8 h-8 text-green-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctorName}
                      </h3>
                      <p className="text-sm text-green-600 font-medium mb-2">
                        {doctorSpecialization}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(appointment.appointmentDate)}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          {getTypeIcon(appointment.type)}
                          {getTypeText(appointment.type)}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          Fee: ৳{appointment.fee}
                        </span>
                      </div>

                      {appointment.symptoms && (
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                        </p>
                      )}

                      {appointment.meetingLink && appointment.type === 'video' && (
                        <a
                          href={appointment.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                        >
                          <Video className="w-4 h-4" />
                          Join Video Call
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>

                    <Link
                      href={`/patient/appointments/${appointment._id}`}
                      className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                let pageNum
                if (pagination.pages <= 5) {
                  pageNum = i + 1
                } else if (filters.page <= 3) {
                  pageNum = i + 1
                } else if (filters.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i
                } else {
                  pageNum = filters.page - 2 + i
                }
                return (
                  <button
                    key={i}
                    onClick={() => setFilters({ ...filters, page: pageNum })}
                    className={`w-10 h-10 rounded-lg ${filters.page === pageNum
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setFilters({ ...filters, page: Math.min(pagination.pages, filters.page + 1) })}
                disabled={filters.page === pagination.pages}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}