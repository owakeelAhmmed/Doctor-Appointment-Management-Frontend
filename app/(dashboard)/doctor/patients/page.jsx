// app/(dashboard)/doctor/patients/page.jsx

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import {
  Users,
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Activity,
  Clock,
  Filter,
  X,
  Download,
  RefreshCw,
  FileText,
  Stethoscope,
  TrendingUp,
  Star,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Video,
  MapPin,
  Bell,
  BellRing,
  CheckCircle,
  CreditCard
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'
import { useAuth } from '@/app/lib/hooks/useAuth'

// Dynamic import for JitsiMeeting to avoid SSR issues
const JitsiMeeting = dynamic(() => import('@/app/components/VideoCall/JitsiMeeting'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4" />
        <p>Loading video call...</p>
      </div>
    </div>
  )
})

export default function DoctorPatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('appointmentDate')
  const [sortOrder, setSortOrder] = useState('asc')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [roomName, setRoomName] = useState('')
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 12
  })

  useEffect(() => {
    fetchAppointments()
  }, [pagination.page, searchQuery, sortBy, sortOrder, activeTab])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.getAppointments({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        sortBy,
        sortOrder,
        status: 'confirmed'
      })
      
      let appointmentsData = []
      let paginationData = { total: 0, pages: 1, page: 1, limit: 12 }
      
      if (response?.success) {
        appointmentsData = response.data?.appointments || response.data || []
        paginationData = response.pagination || paginationData
      } else if (response?.data?.success) {
        appointmentsData = response.data.data?.appointments || response.data.data || []
        paginationData = response.data.pagination || paginationData
      }
      
      const confirmedAppointments = appointmentsData.filter(apt => 
        apt.status === 'confirmed' && 
        apt.payment?.status === 'completed'
      )
      
      setAppointments(confirmedAppointments)
      setPagination(paginationData)
    } catch (error) {
      console.error('Failed to load appointments:', error)
      showToast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
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

  const isAppointmentToday = (appointmentDate) => {
    const today = new Date()
    const aptDate = new Date(appointmentDate)
    return aptDate.toDateString() === today.toDateString()
  }

  const isAppointmentUpcoming = (appointmentDate) => {
    const today = new Date()
    const aptDate = new Date(appointmentDate)
    return aptDate > today
  }

  const canStartCall = (appointment) => {
    const appointmentTime = new Date(appointment.appointmentDate)
    const [hours, minutes] = appointment.startTime.split(':')
    appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0)
    
    const now = new Date()
    const timeDiff = (appointmentTime - now) / (1000 * 60)
    
    return timeDiff <= 5 && appointmentTime.toDateString() === now.toDateString()
  }

  const sendReminder = async (appointment) => {
    try {
      showToast.success(`Reminder sent to ${appointment.patientInfo?.name || appointment.patient?.user?.fullName}`)
    } catch (error) {
      showToast.error('Failed to send reminder')
    }
  }

  const startVideoCall = (appointment) => {
    // Generate unique room name
    const uniqueRoomName = `doccure-${appointment._id}-${Date.now()}`
    setRoomName(uniqueRoomName)
    setSelectedAppointment(appointment)
    setShowVideoModal(true)
  }

  const exportToCSV = () => {
    const headers = ['Patient Name', 'Phone', 'Email', 'Appointment Date', 'Time', 'Type', 'Fee', 'Payment Status']
    const rows = appointments.map(apt => [
      apt.patientInfo?.name || apt.patient?.user?.fullName || 'N/A',
      apt.patientInfo?.phone || apt.patient?.user?.phone || 'N/A',
      apt.patientInfo?.email || apt.patient?.user?.email || 'N/A',
      formatDate(apt.appointmentDate),
      apt.startTime,
      apt.type || 'N/A',
      apt.fee ? `৳${apt.fee}` : 'N/A',
      apt.payment?.status === 'completed' ? 'Paid' : 'Pending'
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast.success('Export started')
  }

  const goToPage = (page) => {
    setPagination({ ...pagination, page })
  }

  const goToPrevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 })
    }
  }

  const goToNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination({ ...pagination, page: pagination.page + 1 })
    }
  }

  const sortOptions = [
    { value: 'appointmentDate', label: 'Appointment Date' },
    { value: 'patientName', label: 'Patient Name' },
    { value: 'fee', label: 'Fee' }
  ]

  const VideoCallModal = ({ appointment, onClose, roomName: existingRoomName }) => {
    if (!appointment) return null

    const isToday = isAppointmentToday(appointment.appointmentDate)
    const callAvailable = canStartCall(appointment)
    const doctorName = `Dr. ${user?.fullName || 'Doctor'}`
    const patientName = appointment.patientInfo?.name || appointment.patient?.user?.fullName || 'Patient'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl w-full max-w-md"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Video Consultation</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-500 mt-1">with {patientName}</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Video className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="font-medium text-gray-900">Schedule Details</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(appointment.appointmentDate)} at {formatTime(appointment.startTime)}
              </p>
            </div>

            {callAvailable ? (
              <button
                onClick={() => {
                  onClose()
                  startVideoCall(appointment)
                }}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-5 h-5" />
                Start Video Call
              </button>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">
                  {isToday ? 'Call will be available 5 minutes before scheduled time' : 'Call can only be started on the appointment date'}
                </p>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const AppointmentDetailsModal = ({ appointment, onClose }) => {
    if (!appointment) return null

    const isToday = isAppointmentToday(appointment.appointmentDate)
    const callAvailable = canStartCall(appointment)

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
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {appointment.patientInfo?.name || appointment.patient?.user?.fullName}
                </h3>
                <p className="text-gray-500">
                  {appointment.patientInfo?.phone || appointment.patient?.user?.phone}
                </p>
                <p className="text-gray-500 text-sm">
                  {appointment.patientInfo?.email || appointment.patient?.user?.email}
                </p>
              </div>
            </div>

            {/* Appointment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{formatDate(appointment.appointmentDate)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Type</p>
                <p className="font-medium capitalize">{appointment.type}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Fee</p>
                <p className="font-medium">৳{appointment.fee}</p>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Payment Status</p>
                <p className="text-sm text-green-700">Paid - {formatDate(appointment.payment?.paymentDate)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {appointment.type === 'video' && (
                <button
                  onClick={() => {
                    onClose()
                    setSelectedAppointment(appointment)
                    setShowVideoModal(true)
                  }}
                  disabled={!callAvailable}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    callAvailable 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  {callAvailable ? 'Start Video Call' : 'Call Not Available'}
                </button>
              )}
              
              {isToday && appointment.type === 'in-person' && (
                <button
                  onClick={() => sendReminder(appointment)}
                  className="flex-1 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Send Reminder
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // Filter appointments by type
  const videoAppointments = appointments.filter(apt => apt.type === 'video')
  const inPersonAppointments = appointments.filter(apt => apt.type === 'in-person')
  const todayAppointments = appointments.filter(apt => isAppointmentToday(apt.appointmentDate))
  const upcomingAppointments = appointments.filter(apt => isAppointmentUpcoming(apt.appointmentDate))

  const getDisplayedAppointments = () => {
    switch(activeTab) {
      case 'today':
        return todayAppointments
      case 'video':
        return videoAppointments
      case 'in-person':
        return inPersonAppointments
      default:
        return upcomingAppointments
    }
  }

  const displayedAppointments = getDisplayedAppointments()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">Manage your confirmed appointments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => fetchAppointments()}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'today'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Today ({todayAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'video'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Video Call ({videoAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab('in-person')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'in-person'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          In-Person ({inPersonAppointments.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-300">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchAppointments()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={`flex-1 px-3 py-2 border rounded-lg transition-colors ${
                        sortOrder === 'asc'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Ascending
                    </button>
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={`flex-1 px-3 py-2 border rounded-lg transition-colors ${
                        sortOrder === 'desc'
                          ? 'bg-green-600 text-white border-green-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Descending
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Appointments Count */}
      {displayedAppointments.length > 0 && (
        <div className="text-sm text-gray-500">
          Found {displayedAppointments.length} appointment{displayedAppointments.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : displayedAppointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-300">
          {activeTab === 'video' ? (
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          ) : activeTab === 'in-person' ? (
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          ) : (
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500">
            {activeTab === 'video' ? 'No video call appointments scheduled' :
             activeTab === 'in-person' ? 'No in-person appointments scheduled' :
             'No upcoming appointments found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedAppointments.map((appointment, index) => {
              const isToday = isAppointmentToday(appointment.appointmentDate)
              const isVideo = appointment.type === 'video'
              const isInPerson = appointment.type === 'in-person'
              const callAvailable = canStartCall(appointment)
              
              return (
                <motion.div
                  key={appointment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patientInfo?.name || appointment.patient?.user?.fullName}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="w-3 h-3" />
                          <span>{appointment.patientInfo?.phone || appointment.patient?.user?.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isVideo ? (
                            <Video className="w-3 h-3 text-blue-600" />
                          ) : (
                            <MapPin className="w-3 h-3 text-purple-600" />
                          )}
                          <span className={isVideo ? 'text-blue-600' : 'text-purple-600'}>
                            {isVideo ? 'Video Call' : 'In-Person'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        {isVideo && (
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setShowVideoModal(true)
                            }}
                            disabled={!callAvailable}
                            className={`flex-1 py-1.5 text-sm rounded-lg transition-colors flex items-center justify-center gap-1 ${
                              callAvailable 
                                ? 'bg-green-600 text-white hover:bg-green-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Video className="w-3 h-3" />
                            {callAvailable ? 'Start Call' : 'Not Available'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setShowDetailsModal(true)
                          }}
                          className="flex-1 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Details
                        </button>
                        
                        {isToday && isInPerson && (
                          <button
                            onClick={() => sendReminder(appointment)}
                            className="py-1.5 px-2 border border-blue-600 text-blue-600 text-sm rounded-lg hover:bg-blue-50 transition-colors"
                            title="Send Reminder"
                          >
                            <BellRing className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                    let pageNum
                    if (pagination.pages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          pagination.page === pageNum
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
                  disabled={pagination.page === pagination.pages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Video Call Modal */}
      <AnimatePresence>
        {showVideoModal && selectedAppointment && (
          <VideoCallModal
            appointment={selectedAppointment}
            roomName={roomName}
            onClose={() => {
              setShowVideoModal(false)
              setSelectedAppointment(null)
              setRoomName('')
            }}
          />
        )}
      </AnimatePresence>

      {/* Jitsi Meeting Component - Shows when call starts */}
      <AnimatePresence>
        {showVideoModal && selectedAppointment && roomName && (
          <JitsiMeeting
            roomName={roomName}
            displayName={`Dr. ${user?.fullName || 'Doctor'}`}
            onClose={() => {
              setShowVideoModal(false)
              setSelectedAppointment(null)
              setRoomName('')
            }}
          />
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <AppointmentDetailsModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedAppointment(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}