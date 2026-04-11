'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Eye,
  Video,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    fromDate: '',
    toDate: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1
  })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    fetchAppointments()
    fetchTodayAppointments()
  }, [filters])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.getAppointments(filters)
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

  const fetchTodayAppointments = async () => {
    try {
      const response = await doctorAPI.getTodaySchedule()
      if (response.success) {
        setTodayAppointments(response.data.appointments || [])
      }
    } catch (error) {
      console.error('Failed to load today appointments')
    }
  }

  const updateStatus = async (appointmentId, status, notes = '') => {
    try {
      const response = await doctorAPI.updateAppointmentStatus(appointmentId, { status, notes })
      if (response.success) {
        showToast.success(`Appointment ${status} successfully`)
        fetchAppointments()
        fetchTodayAppointments()
        setShowStatusModal(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      showToast.error('Failed to update status')
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon }
      case 'completed':
        return { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle }
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle }
      case 'no-show':
        return { label: 'No Show', color: 'bg-gray-100 text-gray-700', icon: XCircle }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: ClockIcon }
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return { icon: Video, label: 'Video', color: 'text-blue-600' }
      case 'phone': return { icon: Phone, label: 'Phone', color: 'text-green-600' }
      default: return { icon: MapPin, label: 'In-Person', color: 'text-purple-600' }
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const StatusModal = ({ appointment, onClose, onConfirm }) => {
    const [status, setStatus] = useState(appointment.status)
    const [notes, setNotes] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const statusOptions = [
      { value: 'confirmed', label: 'Confirm', color: 'text-green-600' },
      { value: 'completed', label: 'Complete', color: 'text-blue-600' },
      { value: 'cancelled', label: 'Cancel', color: 'text-red-600' },
      { value: 'no-show', label: 'No Show', color: 'text-gray-600' }
    ]

    const handleSubmit = async () => {
      setIsLoading(true)
      await onConfirm(appointment._id, status, notes)
      setIsLoading(false)
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl w-full max-w-md"
        >
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Update Appointment Status</h2>
            <p className="text-gray-500 mt-1">
              Patient: {appointment.patient?.user?.fullName}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {statusOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                      status === opt.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                placeholder="Add notes about this appointment..."
              />
            </div>
          </div>

          <div className="p-6 border-t flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAppointments()}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Today's Appointments Section */}
      {todayAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b bg-primary-50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-primary-700 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule ({new Date().toLocaleDateString('bn-BD')})
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              {todayAppointments.map((appointment) => {
                const status = getStatusBadge(appointment.status)
                const StatusIcon = status.icon
                const type = getTypeIcon(appointment.type)
                const TypeIcon = type.icon
                
                return (
                  <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.patient?.user?.fullName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{appointment.startTime}</span>
                          <TypeIcon className={`w-3 h-3 ${type.color}`} />
                          <span className={type.color}>{type.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment)
                          setShowStatusModal(true)
                        }}
                        className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ ...filters, fromDate: '', toDate: '', status: 'all', page: 1 })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
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
          <p className="text-gray-500">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((appointment) => {
                    const status = getStatusBadge(appointment.status)
                    const StatusIcon = status.icon
                    const type = getTypeIcon(appointment.type)
                    const TypeIcon = type.icon
                    
                    return (
                      <tr key={appointment._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(appointment.appointmentDate).toLocaleDateString('bn-BD')}
                            </span>
                            <Clock className="w-4 h-4 text-gray-400 ml-1" />
                            <span className="text-sm">{appointment.startTime}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.patient?.user?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.patient?.user?.phone || 'N/A'}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-sm ${type.color}`}>
                            <TypeIcon className="w-4 h-4" />
                            {type.label}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium">৳{appointment.fee}</span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/doctor/appointments/${appointment._id}`}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowStatusModal(true)
                              }}
                              className="px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} appointments
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {filters.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedAppointment && (
        <StatusModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowStatusModal(false)
            setSelectedAppointment(null)
          }}
          onConfirm={updateStatus}
        />
      )}
    </div>
  )
}