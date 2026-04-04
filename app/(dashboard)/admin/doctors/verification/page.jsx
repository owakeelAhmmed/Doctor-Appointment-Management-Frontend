'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Shield,
  Award,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Star,
  Building,
  GraduationCap,
  FileCheck,
  Image
} from 'lucide-react'
import { adminAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorVerificationPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
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
    try {
      const params = {
        verificationStatus: filters.verificationStatus,
        specialization: filters.specialization,
        page: filters.page,
        limit: filters.limit,
        search: searchQuery || undefined
      }
      
      const response = await adminAPI.getDoctorVerifications(params)
      if (response && response.success) {
        setDoctors(response.data?.doctors || [])
        setPagination(response.data?.pagination || { total: 0, pages: 1, page: 1, limit: 10 })
      } else {
        // ডামি ডাটা
        setDoctors([
          {
            _id: '1',
            user: {
              _id: 'u1',
              fullName: 'Dr. John Smith',
              email: 'john.smith@example.com',
              phone: '01712345678',
              profileImage: null,
              createdAt: '2024-01-15'
            },
            bmdcRegNo: 'BMDC-12345',
            specialization: 'Cardiology',
            qualifications: [
              { degree: 'MBBS', institute: 'Dhaka Medical College', year: 2010 },
              { degree: 'MD Cardiology', institute: 'BSMMU', year: 2015 }
            ],
            experienceYears: 12,
            currentWorkplace: {
              name: 'Square Hospital',
              address: 'Dhaka',
              contactNumber: '02-1234567'
            },
            consultationFee: 1200,
            consultationTypes: ['in-person', 'video'],
            verificationStatus: 'pending',
            documents: {
              bmdcCertificate: { url: 'https://example.com/bmdc.pdf', verified: false },
              nid: { url: 'https://example.com/nid.pdf', verified: true },
              mbbsCertificate: { url: 'https://example.com/mbbs.pdf', verified: false },
              specializationCertificate: { url: 'https://example.com/specialization.pdf', verified: false },
              profilePhoto: { url: 'https://example.com/photo.jpg', verified: true }
            },
            rating: 4.5,
            totalReviews: 28,
            commissionRate: 20
          },
          {
            _id: '2',
            user: {
              _id: 'u2',
              fullName: 'Dr. Sarah Ahmed',
              email: 'sarah.ahmed@example.com',
              phone: '01812345678',
              profileImage: null,
              createdAt: '2024-01-20'
            },
            bmdcRegNo: 'BMDC-67890',
            specialization: 'Neurology',
            qualifications: [
              { degree: 'MBBS', institute: 'Chittagong Medical College', year: 2012 },
              { degree: 'MD Neurology', institute: 'BSMMU', year: 2018 }
            ],
            experienceYears: 8,
            currentWorkplace: {
              name: 'Apollo Hospital',
              address: 'Dhaka',
              contactNumber: '02-7654321'
            },
            consultationFee: 1500,
            consultationTypes: ['video', 'phone'],
            verificationStatus: 'under_review',
            documents: {
              bmdcCertificate: { url: 'https://example.com/bmdc2.pdf', verified: true },
              nid: { url: 'https://example.com/nid2.pdf', verified: true },
              mbbsCertificate: { url: 'https://example.com/mbbs2.pdf', verified: true },
              specializationCertificate: { url: 'https://example.com/specialization2.pdf', verified: false },
              profilePhoto: { url: 'https://example.com/photo2.jpg', verified: true }
            },
            rating: 4.8,
            totalReviews: 42,
            commissionRate: 18
          }
        ])
        setPagination({ total: 2, pages: 1, page: 1, limit: 10 })
      }
    } catch (error) {
      console.error('Fetch doctors error:', error)
      showToast.error('Failed to load doctors')
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
      if (response && response.success) {
        showToast.success(`Doctor ${status === 'verified' ? 'approved' : status} successfully`)
        fetchDoctors()
        setShowVerifyModal(false)
        setSelectedDoctor(null)
      }
    } catch (error) {
      showToast.error('Failed to update verification status')
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
      showToast.error('Failed to update document status')
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle, bg: 'bg-green-50' }
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle, bg: 'bg-red-50' }
      case 'under_review':
        return { label: 'Under Review', color: 'bg-blue-100 text-blue-700', icon: Clock, bg: 'bg-blue-50' }
      default:
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock, bg: 'bg-yellow-50' }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All Doctors' }
  ]

  const specializations = [
    'Cardiology', 'Neurology', 'Dermatology', 'Pediatrics',
    'Orthopedics', 'Gynecology', 'Ophthalmology', 'ENT', 
    'Dentistry', 'Psychiatry', 'General Physician', 'Urology'
  ]

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
            <option value="">All Specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
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
              const documentsCount = Object.values(doctor.documents || {}).filter(d => d.verified).length
              const totalDocuments = Object.keys(doctor.documents || {}).length
              
              return (
                <motion.div
                  key={doctor._id}
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
                          {/* Profile Image */}
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
                            {/* Name and Status */}
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Dr. {doctor.user?.fullName}
                              </h3>
                              <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </span>
                            </div>
                            
                            {/* BMDC & Specialization */}
                            <div className="flex flex-wrap gap-3 mb-2">
                              <span className="text-sm text-gray-500 flex items-center gap-1">
                                <FileCheck className="w-4 h-4" />
                                {doctor.bmdcRegNo}
                              </span>
                              <span className="text-sm text-primary-600 font-medium">
                                {doctor.specialization}
                              </span>
                            </div>
                            
                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {doctor.user?.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {doctor.user?.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Joined: {new Date(doctor.user?.createdAt).toLocaleDateString('bn-BD')}
                              </span>
                            </div>
                            
                            {/* Professional Info */}
                            <div className="flex flex-wrap gap-4 text-sm">
                              <span className="flex items-center gap-1 text-gray-600">
                                <Award className="w-4 h-4 text-amber-500" />
                                {doctor.experienceYears} years experience
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <Building className="w-4 h-4 text-blue-500" />
                                {doctor.currentWorkplace?.name || 'N/A'}
                              </span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                {formatCurrency(doctor.consultationFee)}
                              </span>
                              {doctor.rating > 0 && (
                                <span className="flex items-center gap-1 text-gray-600">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  {doctor.rating} ({doctor.totalReviews} reviews)
                                </span>
                              )}
                            </div>
                            
                            {/* Qualifications */}
                            {doctor.qualifications?.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                <GraduationCap className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div className="flex flex-wrap gap-2">
                                  {doctor.qualifications.map((q, i) => (
                                    <span key={i} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                      {q.degree} ({q.year})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Section - Actions */}
                      <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                        {/* Document Status */}
                        <div className="flex items-center gap-1 mb-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Documents: {documentsCount}/{totalDocuments} verified
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/doctors/${doctor._id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5 text-gray-500" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedDoctor(doctor)
                              setShowVerifyModal(true)
                            }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                          >
                            {doctor.verificationStatus === 'pending' ? 'Review & Verify' : 
                             doctor.verificationStatus === 'under_review' ? 'Update Status' : 'View Details'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Documents Preview */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Verification Documents</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(doctor.documents || {}).map(([key, doc]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setSelectedDoctor(doctor)
                              setSelectedDocument({ type: key, document: doc })
                              setShowDocumentModal(true)
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                              doc.verified
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                            }`}
                          >
                            {doc.verified ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            {key === 'bmdcCertificate' ? 'BMDC Certificate' :
                             key === 'nid' ? 'NID' :
                             key === 'mbbsCertificate' ? 'MBBS Certificate' :
                             key === 'specializationCertificate' ? 'Specialization Certificate' :
                             key === 'profilePhoto' ? 'Profile Photo' :
                             key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </button>
                        ))}
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
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
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
                      key={pageNum}
                      onClick={() => setFilters({ ...filters, page: pageNum })}
                      className={`w-10 h-10 rounded-lg ${
                        filters.page === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.pages}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

      {/* Document Verify Modal */}
      <AnimatePresence>
        {showDocumentModal && selectedDoctor && selectedDocument && (
          <DocumentModal
            doctor={selectedDoctor}
            documentType={selectedDocument.type}
            document={selectedDocument.document}
            onClose={() => {
              setShowDocumentModal(false)
              setSelectedDocument(null)
            }}
            onConfirm={handleDocumentVerify}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Verify Modal Component
function VerifyModal({ doctor, onClose, onConfirm }) {
  const [status, setStatus] = useState(doctor.verificationStatus === 'pending' ? 'verified' : doctor.verificationStatus)
  const [notes, setNotes] = useState(doctor.verificationNotes || '')
  const [commissionRate, setCommissionRate] = useState(doctor.commissionRate || 20)
  const [isLoading, setIsLoading] = useState(false)

  const documents = Object.entries(doctor.documents || {})
  const verifiedDocs = documents.filter(([_, doc]) => doc.verified).length
  const totalDocs = documents.length
  const allDocumentsVerified = verifiedDocs === totalDocs

  const handleSubmit = async () => {
    setIsLoading(true)
    await onConfirm(doctor._id, status, notes, commissionRate)
    setIsLoading(false)
  }

  const statusOptions = [
    { value: 'verified', label: 'Approve & Verify', color: 'text-green-600', bg: 'bg-green-50' },
    { value: 'under_review', label: 'Mark as Under Review', color: 'text-blue-600', bg: 'bg-blue-50' },
    { value: 'rejected', label: 'Reject', color: 'text-red-600', bg: 'bg-red-50' }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Verify Doctor</h2>
          <p className="text-gray-500 mt-1">Dr. {doctor.user?.fullName}</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Documents Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents Status
            </h3>
            <div className="space-y-2">
              {documents.map(([key, doc]) => {
                const docName = key === 'bmdcCertificate' ? 'BMDC Certificate' :
                               key === 'nid' ? 'NID' :
                               key === 'mbbsCertificate' ? 'MBBS Certificate' :
                               key === 'specializationCertificate' ? 'Specialization Certificate' :
                               'Profile Photo'
                return (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <span className="text-sm text-gray-600">{docName}</span>
                    {doc.verified ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Pending
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
            {!allDocumentsVerified && (
              <p className="mt-3 text-xs text-yellow-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {verifiedDocs}/{totalDocs} documents verified. All documents must be verified for approval.
              </p>
            )}
          </div>

          {/* Verification Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Decision
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    status === opt.value
                      ? `${opt.bg} border-${opt.value === 'verified' ? 'green' : opt.value === 'under_review' ? 'blue' : 'red'}-500`
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

          {/* Commission Rate */}
          {status === 'verified' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                min={0}
                max={100}
                step={0.5}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default commission rate is 20%. This will apply to all appointments of this doctor.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder="Add any notes about this verification..."
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit Verification'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Document Modal Component
function DocumentModal({ doctor, documentType, document, onClose, onConfirm }) {
  const [verified, setVerified] = useState(document.verified)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const documentName = documentType === 'bmdcCertificate' ? 'BMDC Certificate' :
                       documentType === 'nid' ? 'NID' :
                       documentType === 'mbbsCertificate' ? 'MBBS Certificate' :
                       documentType === 'specializationCertificate' ? 'Specialization Certificate' :
                       'Profile Photo'

  const handleSubmit = async () => {
    setIsLoading(true)
    await onConfirm(doctor._id, documentType, verified, notes)
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
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Verify Document</h2>
          <p className="text-gray-500 mt-1">Dr. {doctor.user?.fullName} - {documentName}</p>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Document Preview */}
          {document.url && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              {documentType === 'profilePhoto' ? (
                <img 
                  src={document.url} 
                  alt={documentName}
                  className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                />
              ) : (
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <FileText className="w-4 h-4" />
                  View Document
                </a>
              )}
            </div>
          )}

          {/* Verification Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Decision
            </label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer border-gray-200 hover:border-gray-300 data-[checked=true]:border-green-500">
                <input
                  type="radio"
                  name="verified"
                  value="true"
                  checked={verified === true}
                  onChange={() => setVerified(true)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-green-600">Approve</span>
              </label>
              <label className="flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer border-gray-200 hover:border-gray-300 data-[checked=true]:border-red-500">
                <input
                  type="radio"
                  name="verified"
                  value="false"
                  checked={verified === false}
                  onChange={() => setVerified(false)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium text-red-600">Reject</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              placeholder={`Reason for ${verified ? 'approval' : 'rejection'}...`}
            />
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}