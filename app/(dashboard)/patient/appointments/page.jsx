// app/(dashboard)/patient/appointments/page.jsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
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
  Plus,
  DollarSign,
  CalendarDays,
  AlertCircle,
  X,
  Star,
  Stethoscope,
  CreditCard
} from 'lucide-react'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'
import { useAuth } from '@/app/lib/hooks/useAuth'

export default function PatientAppointmentsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  })

  useEffect(() => {
    fetchAppointments()
  }, [pagination.page])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const timestamp = Date.now()
      
      const response = await patientAPI.getMyAppointments({
        page: pagination.page,
        limit: pagination.limit,
        _t: timestamp 
      })
      
      console.log('📡 API Response:', response)
      
      let appointmentsData = []
      let paginationData = { total: 0, pages: 1, page: 1, limit: 10 }
      
      if (response?.data?.success) {
        appointmentsData = response.data.data || []
        paginationData = response.data.pagination || paginationData
        console.log('✅ Appointments from data.data:', appointmentsData.length)
      } else if (response?.success) {
        appointmentsData = response.data || []
        paginationData = response.pagination || paginationData
        console.log('✅ Appointments from data:', appointmentsData.length)
      }
      
      console.log('📋 All appointments:', appointmentsData.map(a => ({
        id: a._id,
        status: a.status,
        doctor: a.doctorInfo?.name,
        date: a.appointmentDate,
        payment: a.payment
      })))
      
      setAppointments(appointmentsData)
      setPagination({
        ...paginationData,
        total: appointmentsData.length,
        pages: Math.ceil(appointmentsData.length / pagination.limit)
      })
    } catch (error) {
      console.error('❌ Failed to load appointments:', error)
      showToast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelAppointment = async () => {
    if (!selectedAppointment) return
    
    try {
      const response = await patientAPI.cancelAppointment(selectedAppointment._id, { reason: cancelReason })
      if (response.success) {
        showToast.success(response.message || 'Appointment cancelled successfully')
        setShowCancelModal(false)
        setSelectedAppointment(null)
        setCancelReason('')
        fetchAppointments()
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to cancel appointment')
    }
  }

  const submitReview = async () => {
    if (!selectedAppointment) return
    
    try {
      const response = await patientAPI.addReview(selectedAppointment._id, reviewData)
      if (response.success) {
        showToast.success('Review submitted successfully')
        setShowReviewModal(false)
        setSelectedAppointment(null)
        setReviewData({ rating: 5, comment: '' })
        fetchAppointments()
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      case 'rescheduled':
        return { label: 'Rescheduled', color: 'bg-purple-100 text-purple-700', icon: RefreshCw }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: ClockIcon }
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return { icon: Video, label: 'Video Call', color: 'text-blue-600' }
      case 'phone': return { icon: Phone, label: 'Phone Call', color: 'text-green-600' }
      default: return { icon: MapPin, label: 'In-Person', color: 'text-purple-600' }
    }
  }

  const canReview = (appointment) => {
    return appointment.status === 'completed' && !appointment.hasReviewed
  }

  const getDoctorName = (appointment) => {
    return appointment.doctorInfo?.name || appointment.doctor?.user?.fullName || 'Doctor'
  }

  const getDoctorSpecialization = (appointment) => {
    return appointment.doctorInfo?.specialization || appointment.doctor?.specialization || 'General Medicine'
  }

  const getDoctorProfileImage = (appointment) => {
    return appointment.doctorInfo?.profileImage || appointment.doctor?.user?.profileImage?.url
  }

  const DetailsModal = ({ appointment, onClose }) => {
    if (!appointment) return null
    
    const status = getStatusBadge(appointment.status)
    const StatusIcon = status.icon
    const type = getTypeIcon(appointment.type)
    const TypeIcon = type.icon
    const doctorName = getDoctorName(appointment)
    const doctorSpecialization = getDoctorSpecialization(appointment)
    
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
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-end">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

            {/* Doctor Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                {getDoctorProfileImage(appointment) ? (
                  <img 
                    src={getDoctorProfileImage(appointment)} 
                    alt={doctorName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Stethoscope className="w-8 h-8 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Dr. {doctorName}</h3>
                <p className="text-gray-500">{doctorSpecialization}</p>
                <p className="text-sm text-gray-400">BMDC Verified</p>
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
                <p className={`font-medium flex items-center gap-1 ${type.color}`}>
                  <TypeIcon className="w-4 h-4" />
                  {type.label}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Fee</p>
                <p className="font-medium">৳{appointment.fee}</p>
              </div>
            </div>

            {/* Payment Info */}
            {appointment.payment && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Payment Status</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Paid on {formatDate(appointment.payment.paymentDate || appointment.createdAt)}
                </p>
                {appointment.payment.transactionId && (
                  <p className="text-xs text-green-600 mt-1">
                    Transaction ID: {appointment.payment.transactionId}
                  </p>
                )}
              </div>
            )}

            {/* Symptoms */}
            {appointment.symptoms && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                <p className="text-sm text-gray-600">{appointment.symptoms}</p>
              </div>
            )}

            {/* Meeting Link */}
            {appointment.meetingLink && appointment.type === 'video' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Video Consultation Link</h4>
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

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {appointment.status === 'confirmed' && (
                <button
                  onClick={() => {
                    onClose()
                    setSelectedAppointment(appointment)
                    setShowCancelModal(true)
                  }}
                  className="flex-1 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Cancel Appointment
                </button>
              )}
              {canReview(appointment) && (
                <button
                  onClick={() => {
                    onClose()
                    setSelectedAppointment(appointment)
                    setShowReviewModal(true)
                  }}
                  className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Write a Review
                </button>
              )}
              <button onClick={onClose} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const CancelModal = ({ appointment, onClose, onConfirm, reason, setReason, isLoading }) => {
    if (!appointment) return null
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl w-full max-w-md"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Cancel Appointment</h2>
            <p className="text-gray-500 mt-1">
              Dr. {getDoctorName(appointment)}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for cancellation</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                placeholder="Please tell us why you're cancelling..."
              />
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Note: Cancellation charges may apply based on our cancellation policy.
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const ReviewModal = ({ appointment, onClose, onConfirm, review, setReview, isLoading }) => {
    if (!appointment) return null
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl w-full max-w-md"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
            <p className="text-gray-500 mt-1">
              Dr. {getDoctorName(appointment)}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="Share your experience with this doctor..."
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
              onClick={onConfirm}
              disabled={isLoading || !review.comment}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Pagination handlers
  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const goToPrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const goToNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }))
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your confirmed appointments</p>
        </div>
        <button
          onClick={() => router.push('/patient/doctors')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Book New Appointment
        </button>
      </div>

      {/* Appointments Count */}
      {appointments.length > 0 && (
        <div className="text-sm text-gray-500">
          Total {pagination.total} appointment{pagination.total !== 1 ? 's' : ''}
        </div>
      )}

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-300">
          <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500 mb-6">You haven't booked any appointments yet.</p>
          <button
            onClick={() => router.push('/patient/doctors')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
          >
            Find Doctors
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {appointments.map((appointment, index) => {
              const status = getStatusBadge(appointment.status)
              const StatusIcon = status.icon
              const type = getTypeIcon(appointment.type)
              const TypeIcon = type.icon
              const doctorName = getDoctorName(appointment)
              const doctorSpecialization = getDoctorSpecialization(appointment)
              
              return (
                <motion.div
                  key={appointment._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-gray-300 p-5 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setShowDetailsModal(true)
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-7 h-7 text-green-600" />
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
                            {formatTime(appointment.startTime)}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <TypeIcon className={`w-4 h-4 ${type.color}`} />
                            <span className={type.color}>{type.label}</span>
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            ৳{appointment.fee}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedAppointment(appointment)
                          setShowDetailsModal(true)
                        }}
                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
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

      {/* Modals */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <DetailsModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedAppointment(null)
            }}
          />
        )}
        
        {showCancelModal && selectedAppointment && (
          <CancelModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowCancelModal(false)
              setSelectedAppointment(null)
              setCancelReason('')
            }}
            onConfirm={cancelAppointment}
            reason={cancelReason}
            setReason={setCancelReason}
            isLoading={false}
          />
        )}
        
        {showReviewModal && selectedAppointment && (
          <ReviewModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowReviewModal(false)
              setSelectedAppointment(null)
              setReviewData({ rating: 5, comment: '' })
            }}
            onConfirm={submitReview}
            review={reviewData}
            setReview={setReviewData}
            isLoading={false}
          />
        )}
      </AnimatePresence>
    </div>
  )
}