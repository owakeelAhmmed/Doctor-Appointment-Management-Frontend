// app/admin/doctors/verification/page.jsx (আপডেটেড)

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, User, Mail, Phone, CheckCircle, XCircle, Clock,
  Eye, FileText, Shield, Award, Calendar, DollarSign, ChevronLeft,
  ChevronRight, AlertCircle, Star, Building, GraduationCap, FileCheck
} from 'lucide-react'
import { adminAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorVerificationPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    verificationStatus: 'pending',
    specialization: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  })
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)

  useEffect(() => {
    fetchDoctors()
  }, [filters, searchQuery])

  const fetchDoctors = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = {
        verificationStatus: filters.verificationStatus === 'all' ? undefined : filters.verificationStatus,
        specialization: filters.specialization || undefined,
        page: filters.page,
        limit: filters.limit,
        search: searchQuery || undefined
      }

      console.log('Fetching doctors with params:', params)

      const response = await adminAPI.getDoctorVerifications(params)

      console.log('Full API Response:', response)

      // Extract doctors array from various possible response structures
      let doctorsData = []
      let paginationData = {
        total: 0,
        pages: 1,
        page: filters.page,
        limit: filters.limit
      }

      if (response?.data?.success === true) {
        // Structure 1: { data: { success: true, data: { doctors: [], pagination: {} } } }
        if (response.data.data?.doctors) {
          doctorsData = response.data.data.doctors
          paginationData = response.data.data.pagination || paginationData
        }
        // Structure 2: { data: { success: true, data: [], pagination: {} } }
        else if (Array.isArray(response.data.data)) {
          doctorsData = response.data.data
          paginationData = response.data.pagination || paginationData
        }
        // Structure 3: { data: { success: true, doctors: [], pagination: {} } }
        else if (response.data.doctors) {
          doctorsData = response.data.doctors
          paginationData = response.data.pagination || paginationData
        }
        // Structure 4: { data: { success: true, data: { doctors: [] } } }
        else if (response.data.data?.doctors) {
          doctorsData = response.data.data.doctors
          paginationData = response.data.data.pagination || paginationData
        }
      }
      else if (response?.success === true) {
        // Structure 5: { success: true, data: { doctors: [] } }
        if (response.data?.doctors) {
          doctorsData = response.data.doctors
          paginationData = response.pagination || paginationData
        }
        // Structure 6: { success: true, data: [] }
        else if (Array.isArray(response.data)) {
          doctorsData = response.data
          paginationData = response.pagination || paginationData
        }
      }

      // Ensure doctorsData is an array
      if (!Array.isArray(doctorsData)) {
        console.error('Doctors data is not an array:', doctorsData)
        doctorsData = []
      }

      console.log('Final doctors data:', doctorsData)
      console.log('Doctors count:', doctorsData.length)

      setDoctors(doctorsData)
      setPagination({
        total: paginationData.total || doctorsData.length,
        pages: paginationData.pages || Math.ceil((paginationData.total || doctorsData.length) / filters.limit),
        page: paginationData.page || filters.page,
        limit: paginationData.limit || filters.limit
      })

    } catch (error) {
      console.error('Fetch doctors error:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load doctors')
      showToast.error('Failed to load doctors')
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (doctorId, status, notes, commissionRate) => {
    try {
      const response = await adminAPI.verifyDoctor(doctorId, {
        status,
        notes,
        commissionRate
      })

      console.log('Verify response:', response)

      if (response && response.success) {
        showToast.success(`Doctor ${status === 'verified' ? 'approved' : status} successfully`)
        fetchDoctors()
        setShowVerifyModal(false)
        setSelectedDoctor(null)
      } else {
        showToast.error(response?.message || 'Failed to update verification status')
      }
    } catch (error) {
      console.error('Verify error:', error)
      showToast.error(error.response?.data?.message || 'Failed to update verification status')
    }
  }

  const handleDocumentVerify = async (doctorId, documentType, verified, notes) => {
    try {
      const response = await adminAPI.verifyDocument(doctorId, documentType, {
        verified,
        notes
      })

      if (response && response.success) {
        showToast.success(`Document ${verified ? 'verified' : 'rejected'} successfully`)
        fetchDoctors()
        setShowDocumentModal(false)
        setSelectedDocument(null)
      }
    } catch (error) {
      console.error('Document verify error:', error)
      showToast.error('Failed to update document status')
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
      case 'under_review':
        return { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Clock }
      case 'profile_submitted':
        return { label: 'Profile Submitted', color: 'bg-purple-100 text-purple-700', icon: FileCheck }
      case 'document_verification':
        return { label: 'Document Verification', color: 'bg-indigo-100 text-indigo-700', icon: FileText }
      default:
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '৳0'
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  const statusOptions = [
    { value: 'all', label: 'All Doctors' },
    { value: 'pending', label: 'Pending' },
    { value: 'profile_submitted', label: 'Profile Submitted' },
    { value: 'document_verification', label: 'Document Verification' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const specializations = [
    'All', 'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics',
    'Orthopedics', 'Gynecology', 'Ophthalmology', 'ENT',
    'Dentistry', 'Psychiatry', 'General Physician', 'Urology'
  ]

  // Error State
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 rounded-xl p-6 text-center border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDoctors}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and verify doctor applications</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.verificationStatus}
            onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={filters.specialization}
            onChange={(e) => setFilters({ ...filters, specialization: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec === 'All' ? '' : spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor name, BMDC Reg No, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchDoctors()}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {/* Results Count */}
      {doctors.length > 0 && (
        <div className="text-sm text-gray-500">
          Found {pagination.total} doctor{pagination.total !== 1 ? 's' : ''}
        </div>
      )}

      {/* Doctors List */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500">
            {filters.verificationStatus === 'pending'
              ? 'No pending verification requests at the moment'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {doctors.map((doctor, index) => {
              const status = getStatusBadge(doctor.verificationStatus)
              const StatusIcon = status.icon

              return (
                <motion.div
                  key={doctor._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left Section - Doctor Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {doctor.user?.profileImage?.url ? (
                              <img
                                src={doctor.user.profileImage.url}
                                alt={doctor.user.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-8 h-8 text-gray-400" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Dr. {doctor.user?.fullName || 'N/A'}
                              </h3>
                              <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-2">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FileCheck className="w-4 h-4" />
                                {doctor.bmdcRegNo || 'N/A'}
                              </span>
                              <span className="text-sm text-primary-600 font-medium">
                                {doctor.specialization || 'Not specified'}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {doctor.user?.email || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {doctor.user?.phone || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Joined: {doctor.user?.createdAt ? new Date(doctor.user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-600">
                                <Award className="w-4 h-4 text-amber-500" />
                                {doctor.experienceYears || 0} years exp.
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <Building className="w-4 h-4 text-blue-500" />
                                {doctor.currentWorkplace?.name || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                {formatCurrency(doctor.consultationFee)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedDoctor(doctor)
                            setShowVerifyModal(true)
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                        >
                          Review & Verify
                        </button>
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
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} doctors
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

      {/* Verify Modal */}
      <AnimatePresence>
        {showVerifyModal && selectedDoctor && (
          <VerifyModal
            doctor={selectedDoctor}
            onClose={() => {
              setShowVerifyModal(false)
              setSelectedDoctor(null)
            }}
            onConfirm={handleVerify}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Verify Modal Component (keep as is)
function VerifyModal({ doctor, onClose, onConfirm }) {
  const [status, setStatus] = useState(doctor.verificationStatus === 'pending' ? 'verified' : doctor.verificationStatus)
  const [notes, setNotes] = useState(doctor.verificationNotes || '')
  const [commissionRate, setCommissionRate] = useState(doctor.commissionRate || 20)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    setIsLoading(true)
    await onConfirm(doctor._id, status, notes, commissionRate)
    setIsLoading(false)
  }

  const statusOptions = [
    { value: 'verified', label: 'Approve & Verify', color: 'text-green-600' },
    { value: 'under_review', label: 'Mark as Under Review', color: 'text-blue-600' },
    { value: 'rejected', label: 'Reject', color: 'text-red-600' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-md"
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Verify Doctor</h2>
          <p className="text-gray-500 mt-1">Dr. {doctor.user?.fullName}</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Decision</label>
            <div className="space-y-2">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${status === opt.value
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

          {status === 'verified' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Add any notes about this verification..."
            />
          </div>
        </div>

        <div className="p-6 border-t flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit Verification'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}