// app/admin/doctors/verification/page.jsx (সম্পূর্ণ আপডেটেড - Real-time UI Update সহ)

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, User, Mail, Phone, CheckCircle, XCircle, Clock,
  Eye, FileText, Shield, Award, Calendar, DollarSign, ChevronLeft,
  ChevronRight, AlertCircle, Star, Building, GraduationCap, FileCheck,
  Image as ImageIcon, File, X, ChevronDown, ChevronUp, Upload, RefreshCw
} from 'lucide-react'
import { adminAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

// ==================== Custom Dropdown Component ====================
const CustomSelect = ({ options, value, onChange, placeholder, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg flex items-center justify-between hover:border-green-500 transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  value === option.value ? 'bg-green-50 text-green-600' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Document Viewer Modal ====================
const DocumentViewer = ({ document, onClose }) => {
  if (!document?.url) return null

  const isImage = document.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)
  const isPDF = document.url.match(/\.pdf$/i)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Document Preview</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {isImage && (
            <img src={document.url} alt="Document" className="max-w-full rounded-lg" />
          )}
          {isPDF && (
            <iframe src={document.url} className="w-full h-[70vh] rounded-lg" title="PDF Viewer" />
          )}
          {!isImage && !isPDF && (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Cannot preview this file type</p>
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ==================== Success Animation Component ====================
const SuccessAnimation = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        className="bg-white rounded-2xl p-8 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Complete!</h3>
        <p className="text-gray-500">Doctor status has been updated successfully.</p>
      </motion.div>
    </motion.div>
  )
}

// ==================== Main Component ====================
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
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1, limit: 10 })
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [updatingDoctorId, setUpdatingDoctorId] = useState(null)

  const fetchDoctors = useCallback(async () => {
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
      const response = await adminAPI.getDoctorVerifications(params)
      
      if (response?.data?.success === true) {
        setDoctors(response.data.data?.doctors || [])
        setPagination(response.data.data?.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
      } else if (response?.success === true) {
        setDoctors(response.data?.doctors || [])
        setPagination(response.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
      } else {
        setError('Failed to load doctors')
        setDoctors([])
      }
    } catch (error) {
      setError(error.message || 'Failed to load doctors')
      setDoctors([])
    } finally {
      setIsLoading(false)
    }
  }, [filters, searchQuery])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  // Real-time update after verification
  const handleVerify = async (doctorId, status, notes, commissionRate) => {
    setUpdatingDoctorId(doctorId)
    try {
      const response = await adminAPI.verifyDoctor(doctorId, { status, notes, commissionRate })
      if (response?.success) {
        // Update local state immediately for real-time UI update
        setDoctors(prevDoctors => 
          prevDoctors.map(doctor => 
            doctor._id === doctorId 
              ? { 
                  ...doctor, 
                  verificationStatus: status,
                  verificationNotes: notes,
                  commissionRate: commissionRate,
                  verifiedAt: status === 'verified' ? new Date().toISOString() : doctor.verifiedAt
                }
              : doctor
          )
        )
        
        // Show success animation
        setShowSuccess(true)
        
        // Update pagination total if status filter is not 'all'
        if (filters.verificationStatus !== 'all') {
          setPagination(prev => ({ ...prev, total: prev.total - 1 }))
        }
        
        // Close modal
        setShowVerifyModal(false)
        setSelectedDoctor(null)
        
        // Auto refresh after 2 seconds to ensure data consistency
        setTimeout(() => {
          fetchDoctors()
          setShowSuccess(false)
        }, 2000)
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to update verification status')
    } finally {
      setUpdatingDoctorId(null)
    }
  }

  const handleDocumentVerify = async (doctorId, documentType, verified, notes) => {
    try {
      const response = await adminAPI.verifyDocument(doctorId, documentType, { verified, notes })
      if (response?.success) {
        // Update local state for real-time UI update
        setDoctors(prevDoctors =>
          prevDoctors.map(doctor =>
            doctor._id === doctorId
              ? {
                  ...doctor,
                  documents: {
                    ...doctor.documents,
                    [documentType]: {
                      ...doctor.documents[documentType],
                      verified: verified,
                      verifiedAt: verified ? new Date().toISOString() : null,
                      rejectionReason: notes
                    }
                  }
                }
              : doctor
          )
        )
        showToast.success(`Document ${verified ? 'verified' : 'rejected'} successfully`)
        fetchDoctors() // Background refresh
      }
    } catch (error) {
      showToast.error('Failed to update document status')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
      under_review: { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Clock },
      profile_submitted: { label: 'Profile Submitted', color: 'bg-purple-100 text-purple-700', icon: FileCheck },
      document_verification: { label: 'Document Verification', color: 'bg-indigo-100 text-indigo-700', icon: FileText },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
    }
    return badges[status] || badges.pending
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
    { value: '', label: 'All Specializations' },
    { value: 'Cardiology', label: 'Cardiology' },
    { value: 'Neurology', label: 'Neurology' },
    { value: 'Dermatology', label: 'Dermatology' },
    { value: 'Pediatrics', label: 'Pediatrics' },
    { value: 'Orthopedics', label: 'Orthopedics' },
    { value: 'Gynecology', label: 'Gynecology' },
    { value: 'Ophthalmology', label: 'Ophthalmology' },
    { value: 'ENT', label: 'ENT' },
    { value: 'Dentistry', label: 'Dentistry' },
    { value: 'Psychiatry', label: 'Psychiatry' },
    { value: 'General Physician', label: 'General Physician' }
  ]

  if (isLoading && doctors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-12 text-center border border-red-200">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={fetchDoctors} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Try Again</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && <SuccessAnimation onComplete={() => setShowSuccess(false)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and verify doctor applications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDoctors}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
            Refresh
          </button>
          <CustomSelect
            options={statusOptions}
            value={filters.verificationStatus}
            onChange={(value) => setFilters({ ...filters, verificationStatus: value, page: 1 })}
            placeholder="Select Status"
          />
          <CustomSelect
            options={specializations}
            value={filters.specialization}
            onChange={(value) => setFilters({ ...filters, specialization: value, page: 1 })}
            placeholder="All Specializations"
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by doctor name, BMDC Reg No, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchDoctors()}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />
        </div>
      </div>

      {/* Doctors List */}
      {doctors.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {doctors.map((doctor, index) => {
              const status = getStatusBadge(doctor.verificationStatus)
              const StatusIcon = status.icon
              const isUpdating = updatingDoctorId === doctor._id
              const documentsList = Object.entries(doctor.documents || {}).filter(([_, doc]) => doc?.url)
              const verifiedDocs = documentsList.filter(([_, doc]) => doc.verified).length
              
              return (
                <motion.div
                  key={doctor._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-sm border transition-all overflow-hidden ${
                    isUpdating ? 'opacity-50' : 'hover:shadow-md'
                  } ${doctor.verificationStatus === 'verified' ? 'border-green-200' : 'border-gray-200'}`}
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {doctor.user?.profileImage?.url ? (
                              <img src={doctor.user.profileImage.url} alt={doctor.user.fullName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">Dr. {doctor.user?.fullName || 'N/A'}</h3>
                              <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                              {doctor.verifiedAt && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  Verified on {new Date(doctor.verifiedAt).toLocaleDateString('bn-BD')}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-3 mb-2">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FileCheck className="w-4 h-4" />
                                {doctor.bmdcRegNo || 'N/A'}
                              </span>
                              <span className="text-sm text-green-600 font-medium">{doctor.specialization || 'Not specified'}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{doctor.user?.email || 'N/A'}</span>
                              <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{doctor.user?.phone || 'N/A'}</span>
                              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined: {doctor.user?.createdAt ? new Date(doctor.user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-600"><Award className="w-4 h-4 text-amber-500" />{doctor.experienceYears || 0} years</span>
                              <span className="flex items-center gap-1 text-gray-600"><Building className="w-4 h-4 text-blue-500" />{doctor.currentWorkplace?.name || 'N/A'}</span>
                              <span className="flex items-center gap-1 text-gray-600"><DollarSign className="w-4 h-4 text-green-500" />{formatCurrency(doctor.consultationFee)}</span>
                              {doctor.commissionRate > 0 && (
                                <span className="flex items-center gap-1 text-gray-600">Commission: {doctor.commissionRate}%</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doctor.verificationStatus !== 'verified' && doctor.verificationStatus !== 'rejected' && (
                          <button
                            onClick={() => { setSelectedDoctor(doctor); setShowVerifyModal(true) }}
                            disabled={isUpdating}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                          >
                            {isUpdating ? 'Processing...' : 'Review & Verify'}
                          </button>
                        )}
                        {doctor.verificationStatus === 'verified' && (
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            Already Verified
                          </button>
                        )}
                        {doctor.verificationStatus === 'rejected' && (
                          <button
                            disabled
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            Rejected
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Documents Section */}
                    {documentsList.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Verification Documents</span>
                          </div>
                          <span className="text-xs text-gray-500">{verifiedDocs}/{documentsList.length} verified</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {documentsList.map(([key, doc]) => {
                            const docName = {
                              bmdcCertificate: 'BMDC Certificate',
                              nid: 'NID',
                              basicDegree: 'MBBS Certificate',
                              specializationCertificate: 'Specialization Certificate',
                              profilePhoto: 'Profile Photo',
                              tradeLicense: 'Trade License',
                              chamberPhoto: 'Chamber Photo'
                            }[key] || key
                            
                            return (
                              <button
                                key={key}
                                onClick={() => setPreviewDocument({ type: key, document: doc, doctor })}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                                  doc.verified 
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
                                    : doc.url
                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                                }`}
                              >
                                {doc.verified ? <CheckCircle className="w-3 h-3" /> : doc.url ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {docName}
                                <Eye className="w-3 h-3 ml-1 opacity-50" />
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} doctors
              </p>
              <div className="flex gap-2">
                <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">Page {filters.page} of {pagination.pages}</span>
                <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page === pagination.pages} className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50">
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
            onClose={() => { setShowVerifyModal(false); setSelectedDoctor(null) }} 
            onConfirm={handleVerify}
            onRefresh={fetchDoctors}
          />
        )}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDocument && (
          <DocumentViewer document={previewDocument.document} onClose={() => setPreviewDocument(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== Verify Modal Component (Updated with Real-time Status) ====================
function VerifyModal({ doctor, onClose, onConfirm, onRefresh }) {
  const [status, setStatus] = useState(() => {
    // Auto-select appropriate status based on document verification
    const documents = Object.entries(doctor.documents || {})
    const verifiedDocs = documents.filter(([_, doc]) => doc.verified).length
    const totalDocs = documents.filter(([_, doc]) => doc?.url).length
    
    if (doctor.verificationStatus === 'verified') return 'verified'
    if (doctor.verificationStatus === 'rejected') return 'rejected'
    if (verifiedDocs === totalDocs && totalDocs > 0) return 'verified'
    return 'under_review'
  })
  
  const [notes, setNotes] = useState(doctor.verificationNotes || '')
  const [commissionRate, setCommissionRate] = useState(doctor.commissionRate || 20)
  const [isLoading, setIsLoading] = useState(false)

  // Document verification status
  const documents = Object.entries(doctor.documents || {})
  const verifiedDocs = documents.filter(([_, doc]) => doc.verified).length
  const totalDocs = documents.filter(([_, doc]) => doc?.url).length
  const allDocumentsVerified = verifiedDocs === totalDocs && totalDocs > 0
  const hasDocuments = totalDocs > 0

  const handleSubmit = async () => {
    setIsLoading(true)
    await onConfirm(doctor._id, status, notes, commissionRate)
    setIsLoading(false)
  }

  const statusOptions = [
    { 
      value: 'verified', 
      label: 'Approve & Verify', 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-500',
      description: 'Doctor will get full access to the platform',
      icon: CheckCircle
    },
    { 
      value: 'under_review', 
      label: 'Mark as Under Review', 
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-500',
      description: 'Doctor\'s application needs more review',
      icon: Clock
    },
    { 
      value: 'rejected', 
      label: 'Reject Application', 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-500',
      description: 'Doctor will be notified with rejection reason',
      icon: XCircle
    }
  ]

  // Get recommended status message
  const getRecommendedStatus = () => {
    if (!hasDocuments) {
      return { message: 'No documents uploaded yet. Doctor needs to upload verification documents.', type: 'warning' }
    }
    if (!allDocumentsVerified) {
      return { message: `${totalDocs - verifiedDocs} document(s) pending verification. Review documents before approving.`, type: 'info' }
    }
    if (allDocumentsVerified && hasDocuments) {
      return { message: 'All documents are verified! Ready for approval.', type: 'success' }
    }
    return null
  }

  const recommendation = getRecommendedStatus()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Verify Doctor</h2>
          <p className="text-gray-500 mt-1">Dr. {doctor.user?.fullName}</p>
          <p className="text-xs text-gray-400 mt-0.5">BMDC: {doctor.bmdcRegNo || 'N/A'}</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Current Status Badge */}
          <div className={`rounded-lg p-3 flex items-center gap-3 ${
            doctor.verificationStatus === 'verified' ? 'bg-green-50' :
            doctor.verificationStatus === 'rejected' ? 'bg-red-50' :
            doctor.verificationStatus === 'under_review' ? 'bg-blue-50' : 'bg-yellow-50'
          }`}>
            {doctor.verificationStatus === 'verified' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {doctor.verificationStatus === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
            {doctor.verificationStatus === 'under_review' && <Clock className="w-5 h-5 text-blue-600" />}
            {doctor.verificationStatus === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
            <div>
              <p className="text-sm font-medium text-gray-900">Current Status</p>
              <p className="text-sm capitalize">{doctor.verificationStatus?.replace('_', ' ') || 'Pending'}</p>
            </div>
          </div>

          {/* Document Status Summary */}
          {hasDocuments && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4" />
                Document Status ({verifiedDocs}/{totalDocs} Verified)
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {documents.map(([key, doc]) => {
                  if (!doc?.url) return null
                  const docName = {
                    bmdcCertificate: 'BMDC Certificate',
                    nid: 'NID',
                    basicDegree: 'MBBS Certificate',
                    specializationCertificate: 'Specialization Certificate',
                    profilePhoto: 'Profile Photo'
                  }[key] || key
                  
                  return (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-600">{docName}</span>
                      {doc.verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          Pending Verification
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Recommendation Message */}
              {recommendation && (
                <div className={`mt-3 p-2 rounded-lg text-xs ${
                  recommendation.type === 'success' ? 'bg-green-100 text-green-700' :
                  recommendation.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {recommendation.type === 'success' && <CheckCircle className="w-3 h-3" />}
                    {recommendation.type === 'warning' && <AlertCircle className="w-3 h-3" />}
                    {recommendation.type === 'info' && <Clock className="w-3 h-3" />}
                    {recommendation.message}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Verification Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Decision</label>
            <div className="space-y-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon
                const isDisabled = opt.value === 'verified' && !allDocumentsVerified && hasDocuments
                return (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      status === opt.value ? `${opt.bg} ${opt.border}` : 'border-gray-200 hover:border-gray-300'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={opt.value}
                      checked={status === opt.value}
                      onChange={(e) => !isDisabled && setStatus(e.target.value)}
                      disabled={isDisabled}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${opt.color}`} />
                        <span className={`text-sm font-medium ${opt.color}`}>{opt.label}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{opt.description}</p>
                      {isDisabled && (
                        <p className="text-xs text-yellow-600 mt-1">⚠️ Verify all documents first</p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Commission Rate - Only show for verification */}
          {status === 'verified' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">Default: 20% of each consultation</p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes {status === 'rejected' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder={status === 'rejected' 
                ? "Please provide reason for rejection..." 
                : "Add any notes about this verification (optional)..."
              }
            />
            {status === 'rejected' && !notes && (
              <p className="text-xs text-red-500 mt-1">Rejection reason is required</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t flex gap-3 bg-gray-50">
          <button 
            onClick={onClose} 
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || (status === 'rejected' && !notes) || (status === 'verified' && !allDocumentsVerified && hasDocuments)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : status === 'verified' ? 'Approve Doctor' : status === 'rejected' ? 'Reject Application' : 'Submit for Review'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}