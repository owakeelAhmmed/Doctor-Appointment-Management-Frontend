// app/(dashboard)/doctor/appointments/page.jsx

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
  RefreshCw,
  CreditCard,
  DollarSign,
  FileText,
  MessageSquare,
  MoreVertical
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
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
    page: 1,
    limit: 10
  })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchAppointments()
    fetchTodayAppointments()
  }, [filters, searchQuery])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const cleanFilters = {}
      
      if (filters.status && filters.status !== 'all') {
        cleanFilters.status = filters.status
      }
      if (filters.fromDate && filters.fromDate !== '') {
        cleanFilters.fromDate = filters.fromDate
      }
      if (filters.toDate && filters.toDate !== '') {
        cleanFilters.toDate = filters.toDate
      }
      cleanFilters.page = filters.page
      cleanFilters.limit = filters.limit
      if (searchQuery) {
        cleanFilters.search = searchQuery
      }
      
      console.log('Sending clean filters:', cleanFilters)
      
      const response = await doctorAPI.getAppointments(cleanFilters)
      
      let appointmentsData = []
      let paginationData = { total: 0, pages: 1, page: 1, limit: 10 }
      
      if (response?.success) {
        appointmentsData = response.data?.appointments || response.data || []
        paginationData = response.pagination || paginationData
      } else if (response?.data?.success) {
        appointmentsData = response.data.data?.appointments || response.data.data || []
        paginationData = response.data.pagination || paginationData
      }
      
      setAppointments(appointmentsData)
      setPagination(paginationData)
    } catch (error) {
      console.error('Failed to load appointments:', error)
      showToast.error(error.response?.data?.message || 'Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTodayAppointments = async () => {
    try {
      const response = await doctorAPI.getTodaySchedule()
      
      if (response?.success) {
        setTodayAppointments(response.data?.appointments || [])
      } else if (response?.data?.success) {
        setTodayAppointments(response.data.data?.appointments || [])
      }
    } catch (error) {
      console.error('Failed to load today appointments:', error)
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

  const getPaymentStatusBadge = (paymentStatus) => {
    if (!paymentStatus) return { label: 'N/A', color: 'bg-gray-100 text-gray-600' }
    switch(paymentStatus) {
      case 'completed':
        return { label: 'Paid', color: 'bg-green-100 text-green-700' }
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' }
      case 'failed':
        return { label: 'Failed', color: 'bg-red-100 text-red-700' }
      case 'refunded':
        return { label: 'Refunded', color: 'bg-purple-100 text-purple-700' }
      default:
        return { label: paymentStatus, color: 'bg-gray-100 text-gray-600' }
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return { icon: Video, label: 'Video Call', color: 'text-blue-600' }
      case 'phone': return { icon: Phone, label: 'Phone Call', color: 'text-green-600' }
      default: return { icon: MapPin, label: 'In-Person', color: 'text-purple-600' }
    }
  }

  const getPatientName = (appointment) => {
    return appointment.patientInfo?.name || 
           appointment.patient?.user?.fullName || 
           appointment.patientName || 
           'Patient'
  }

  const getPatientPhone = (appointment) => {
    return appointment.patientInfo?.phone || 
           appointment.patient?.user?.phone || 
           'N/A'
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const statusOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  // Pagination handlers
  const goToPage = (page) => {
    setFilters({ ...filters, page })
  }

  const goToPrevPage = () => {
    if (filters.page > 1) {
      setFilters({ ...filters, page: filters.page - 1 })
    }
  }

  const goToNextPage = () => {
    if (filters.page < pagination.pages) {
      setFilters({ ...filters, page: filters.page + 1 })
    }
  }

  const StatusModal = ({ appointment, onClose, onConfirm }) => {
    const [status, setStatus] = useState(appointment.status)
    const [notes, setNotes] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const statusOptions = [
      { value: 'confirmed', label: 'Confirm', color: 'text-green-600', description: 'Confirm this appointment' },
      { value: 'completed', label: 'Complete', color: 'text-blue-600', description: 'Mark as completed' },
      { value: 'cancelled', label: 'Cancel', color: 'text-red-600', description: 'Cancel this appointment' },
      { value: 'no-show', label: 'No Show', color: 'text-gray-600', description: 'Patient did not show up' }
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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Update Appointment Status</h2>
            <p className="text-gray-500 mt-1">
              Patient: {getPatientName(appointment)}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {statusOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      status === opt.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div>
                      <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                      <p className="text-xs text-gray-500">{opt.description}</p>
                    </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Add notes about this appointment..."
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const DetailsModal = ({ appointment, onClose }) => {
    const status = getStatusBadge(appointment.status)
    const StatusIcon = status.icon
    const type = getTypeIcon(appointment.type)
    const TypeIcon = type.icon
    const paymentStatus = getPaymentStatusBadge(appointment.payment?.status)

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-500 text-sm mt-1">ID: {appointment._id}</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-end">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

            {/* Patient & Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Patient Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> {getPatientName(appointment)}</p>
                  <p><span className="text-gray-500">Phone:</span> {getPatientPhone(appointment)}</p>
                  <p><span className="text-gray-500">Email:</span> {appointment.patientInfo?.email || appointment.patient?.user?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  Appointment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <p><span className="text-gray-500">Date:</span> {formatDate(appointment.appointmentDate)}</p>
                  <p><span className="text-gray-500">Time:</span> {appointment.startTime} - {appointment.endTime}</p>
                  <p><span className="text-gray-500">Type:</span> <span className={type.color}>{type.label}</span></p>
                  <p><span className="text-gray-500">Fee:</span> ৳{appointment.fee}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">৳{appointment.payment?.amount || appointment.fee}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={`inline-flex px-2 py-0.5 rounded-full text-xs ${paymentStatus.color}`}>
                    {paymentStatus.label}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Method</p>
                  <p className="font-medium capitalize">{appointment.payment?.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-mono text-xs">{appointment.payment?.transactionId || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Symptoms & Notes */}
            {appointment.symptoms && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  Symptoms
                </h3>
                <p className="text-sm text-gray-700">{appointment.symptoms}</p>
              </div>
            )}

            {appointment.notes && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600" />
                  Doctor's Notes
                </h3>
                <p className="text-sm text-gray-700">{appointment.notes}</p>
              </div>
            )}

            {/* Meeting Link for Video Consultation */}
            {appointment.meetingLink && appointment.type === 'video' && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video Consultation Link
                </h3>
                <a 
                  href={appointment.meetingLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm break-all"
                >
                  {appointment.meetingLink}
                </a>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={() => {
                onClose()
                setSelectedAppointment(appointment)
                setShowStatusModal(true)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Update Status
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your appointments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAppointments()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Today's Appointments Section */}
      {todayAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-300">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50 rounded-t-xl">
            <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule ({new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})
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
                  <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{getPatientName(appointment)}</p>
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
                        className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ ...filters, fromDate: '', toDate: '', status: 'all', page: 1 })
                setSearchQuery('')
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-300">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
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
                    const paymentStatus = getPaymentStatusBadge(appointment.payment?.status)
                    
                    return (
                      <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(appointment.appointmentDate)}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {appointment.startTime}
                            </span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {getPatientName(appointment)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getPatientPhone(appointment)}
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
                          <span className="text-sm font-medium text-gray-900">৳{appointment.fee}</span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${paymentStatus.color}`}>
                            <DollarSign className="w-3 h-3" />
                            {paymentStatus.label}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowDetailsModal(true)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setShowStatusModal(true)
                              }}
                              className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevPage}
                  disabled={filters.page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
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
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          filters.page === pageNum
                            ? 'bg-green-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={filters.page === pagination.pages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
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

      {/* Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <DetailsModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedAppointment(null)
          }}
        />
      )}
    </div>
  )
}