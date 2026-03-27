'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Filter,
  Search,
  ChevronDown,
  Video,
  Phone,
  MapPin,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

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
      if (response.success) {
        setAppointments(response.data.appointments)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      showToast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-600'
      case 'pending': return 'bg-yellow-100 text-yellow-600'
      case 'completed': return 'bg-blue-100 text-blue-600'
      case 'cancelled': return 'bg-red-100 text-red-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'phone': return <Phone className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <Link
          href="/patient/doctors"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Book New</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
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
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="video">Video</option>
            <option value="phone">Phone</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">You haven't booked any appointments yet.</p>
          <Link
            href="/patient/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Find Doctors
            <Search className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {appointment.doctor?.user?.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{appointment.doctor?.specialization}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(appointment.appointmentDate), 'MMMM dd, yyyy')}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        {getTypeIcon(appointment.type)}
                        {appointment.type}
                      </span>
                    </div>

                    {appointment.symptoms && (
                      <p className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  
                  <Link
                    href={`/patient/appointments/${appointment._id}`}
                    className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setFilters({ ...filters, page: i + 1 })}
                  className={`w-10 h-10 rounded-lg ${
                    filters.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}