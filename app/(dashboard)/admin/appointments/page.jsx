'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  Eye,
  Edit,
  XCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Video,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  RefreshCw,
  AlertCircle,
  MoreVertical,
  Download
} from 'lucide-react'
import { adminAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'
import { format } from 'date-fns'

export default function AppointmentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    fromDate: '',
    toDate: '',
    page: 1,
    limit: 15
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 15
  })
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [filters, searchQuery])

  const fetchAppointments = async () => {
    setIsLoading(true)
    try {
      const params = {
        status: filters.status === 'all' ? undefined : filters.status,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        page: filters.page,
        limit: filters.limit
      }
      
      const response = await adminAPI.getAllAppointments(params)
      if (response && response.success) {
        setAppointments(response.data?.appointments || [])
        setPagination(response.data?.pagination || { total: 0, pages: 1, page: 1, limit: 15 })
      } else {
        // ডামি ডাটা
        setAppointments([
          {
            _id: '1',
            patient: {
              _id: 'p1',
              user: { fullName: 'John Doe', email: 'john@example.com', phone: '01712345678' }
            },
            doctor: {
              _id: 'd1',
              user: { fullName: 'Dr. John Smith', email: 'dr.smith@example.com' },
              specialization: 'Cardiology',
              consultationFee: 1200
            },
            appointmentDate: '2024-03-25',
            startTime: '10:00',
            endTime: '10:30',
            type: 'in-person',
            status: 'confirmed',
            fee: 1200,
            symptoms: 'Chest pain, shortness of breath',
            notes: 'Patient has high blood pressure',
            createdAt: '2024-03-20T10:00:00Z',
            payment: { status: 'completed', amount: 1200 }
          },
          {
            _id: '2',
            patient: {
              _id: 'p2',
              user: { fullName: 'Jane Smith', email: 'jane@example.com', phone: '01812345678' }
            },
            doctor: {
              _id: 'd2',
              user: { fullName: 'Dr. Sarah Ahmed', email: 'dr.sarah@example.com' },
              specialization: 'Neurology',
              consultationFee: 1500
            },
            appointmentDate: '2024-03-25',
            startTime: '11:00',
            endTime: '11:30',
            type: 'video',
            status: 'pending',
            fee: 1500,
            symptoms: 'Severe headache, dizziness',
            notes: '',
            createdAt: '2024-03-21T10:00:00Z',
            payment: { status: 'pending', amount: 1500 }
          },
          {
            _id: '3',
            patient: {
              _id: 'p3',
              user: { fullName: 'Mike Rahman', email: 'mike@example.com', phone: '01912345678' }
            },
            doctor: {
              _id: 'd3',
              user: { fullName: 'Dr. Ahmed Khan', email: 'dr.khan@example.com' },
              specialization: 'Dermatology',
              consultationFee: 1000
            },
            appointmentDate: '2024-03-26',
            startTime: '09:00',
            endTime: '09:30',
            type: 'phone',
            status: 'completed',
            fee: 1000,
            symptoms: 'Skin rash, itching',
            notes: 'Prescribed antihistamines',
            createdAt: '2024-03-19T10:00:00Z',
            payment: { status: 'completed', amount: 1000 }
          },
          {
            _id: '4',
            patient: {
              _id: 'p4',
              user: { fullName: 'Sadia Sultana', email: 'sadia@example.com', phone: '01612345678' }
            },
            doctor: {
              _id: 'd1',
              user: { fullName: 'Dr. John Smith', email: 'dr.smith@example.com' },
              specialization: 'Cardiology',
              consultationFee: 1200
            },
            appointmentDate: '2024-03-26',
            startTime: '14:00',
            endTime: '14:30',
            type: 'video',
            status: 'cancelled',
            fee: 1200,
            symptoms: 'Palpitations',
            notes: 'Cancelled by patient',
            createdAt: '2024-03-18T10:00:00Z',
            payment: { status: 'refunded', amount: 1200 }
          }
        ])
        setPagination({ total: 4, pages: 1, page: 1, limit: 15 })
      }
    } catch (error) {
      console.error('Fetch appointments error:', error)
      showToast.error('Failed to load appointments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (appointmentId, status, notes = '') => {
    try {
      const response = await adminAPI.updateAppointmentStatus(appointmentId, { status, notes })
      if (response && response.success) {
        showToast.success(`Appointment ${status} successfully`)
        fetchAppointments()
        setShowUpdateModal(false)
        setSelectedAppointment(null)
      }
    } catch (error) {
      showToast.error('Failed to update appointment status')
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: CheckCircle, bg: 'bg-green-50' }
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock, bg: 'bg-yellow-50' }
      case 'completed':
        return { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, bg: 'bg-blue-50' }
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle, bg: 'bg-red-50' }
      case 'rescheduled':
        return { label: 'Rescheduled', color: 'bg-purple-100 text-purple-700', icon: RefreshCw, bg: 'bg-purple-50' }
      case 'no-show':
        return { label: 'No Show', color: 'bg-gray-100 text-gray-700', icon: AlertCircle, bg: 'bg-gray-50' }
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700', icon: AlertCircle, bg: 'bg-gray-50' }
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'video': return { icon: Video, label: 'Video', color: 'text-blue-600' }
      case 'phone': return { icon: Phone, label: 'Phone', color: 'text-green-600' }
      default: return { icon: MapPin, label: 'In-Person', color: 'text-purple-600' }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  const statusOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'no-show', label: 'No Show' }
  ]

  const handleExportCSV = () => {
    const headers = ['Date', 'Time', 'Patient', 'Doctor', 'Specialization', 'Type', 'Status', 'Fee']
    const rows = appointments.map(apt => [
      format(new Date(apt.appointmentDate), 'dd/MM/yyyy'),
      apt.startTime,
      apt.patient?.user?.fullName || 'N/A',
      apt.doctor?.user?.fullName || 'N/A',
      apt.doctor?.specialization || 'N/A',
      apt.type,
      apt.status,
      apt.fee
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
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage all appointments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => fetchAppointments()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
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

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => setFilters({ ...filters, fromDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => setFilters({ ...filters, toDate: e.target.value, page: 1 })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Patient or Doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchAppointments()}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.fromDate || filters.toDate || filters.status !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-xs text-gray-500">Active filters:</span>
            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
                <button onClick={() => setFilters({ ...filters, status: 'all', page: 1 })} className="hover:text-primary-900">
                  <XCircle className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.fromDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                From: {new Date(filters.fromDate).toLocaleDateString()}
                <button onClick={() => setFilters({ ...filters, fromDate: '', page: 1 })} className="hover:text-blue-900">
                  <XCircle className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.toDate && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                To: {new Date(filters.toDate).toLocaleDateString()}
                <button onClick={() => setFilters({ ...filters, toDate: '', page: 1 })} className="hover:text-blue-900">
                  <XCircle className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      {appointments.length > 0 && (
        <div className="text-sm text-gray-500">
          Found {pagination.total} appointment{pagination.total !== 1 ? 's' : ''}
        </div>
      )}

      {/* Appointments Table */}
      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
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
                      <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {new Date(appointment.appointmentDate).toLocaleDateString('bn-BD')}
                            </span>
                            <Clock className="w-4 h-4 text-gray-400 ml-1" />
                            <span className="text-sm text-gray-600">{appointment.startTime}</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.patient?.user?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.patient?.user?.email || 'N/A'}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.doctor?.user?.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.doctor?.specialization || 'N/A'}
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
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(appointment.fee)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3">
                          <span className={`text-xs ${
                            appointment.payment?.status === 'completed' ? 'text-green-600' :
                            appointment.payment?.status === 'pending' ? 'text-yellow-600' :
                            appointment.payment?.status === 'refunded' ? 'text-orange-600' :
                            'text-red-600'
                          }`}>
                            {appointment.payment?.status === 'completed' ? 'Paid' :
                             appointment.payment?.status === 'pending' ? 'Pending' :
                             appointment.payment?.status === 'refunded' ? 'Refunded' : 'Failed'}
                          </span>
                        </td>
                        
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
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
                                setShowUpdateModal(true)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
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

      {/* Update Status Modal */}
      <AnimatePresence>
        {showUpdateModal && selectedAppointment && (
          <UpdateStatusModal
            appointment={selectedAppointment}
            onClose={() => {
              setShowUpdateModal(false)
              setSelectedAppointment(null)
            }}
            onConfirm={handleUpdateStatus}
          />
        )}
      </AnimatePresence>

      {/* Appointment Details Modal */}
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
      </AnimatePresence>
    </div>
  )
}

// Update Status Modal Component
function UpdateStatusModal({ appointment, onClose, onConfirm }) {
  const [status, setStatus] = useState(appointment.status)
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmed', color: 'text-green-600' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'completed', label: 'Completed', color: 'text-blue-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
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
            Dr. {appointment.doctor?.user?.fullName} with {appointment.patient?.user?.fullName}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
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
              placeholder="Add notes about this status change..."
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

// Appointment Details Modal Component
function DetailsModal({ appointment, onClose }) {
  const status = {
    confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' }
  }[appointment.status] || { label: appointment.status, color: 'bg-gray-100 text-gray-700' }

  const typeInfo = {
    'in-person': { icon: MapPin, label: 'In-Person', color: 'text-purple-600' },
    'video': { icon: Video, label: 'Video Consultation', color: 'text-blue-600' },
    'phone': { icon: Phone, label: 'Phone Consultation', color: 'text-green-600' }
  }[appointment.type] || { icon: MapPin, label: appointment.type, color: 'text-gray-600' }

  const TypeIcon = typeInfo.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
          <p className="text-gray-500 mt-1">ID: {appointment._id}</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-end">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Patient Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {appointment.patient?.user?.fullName || 'N/A'}</p>
                <p><span className="text-gray-500">Email:</span> {appointment.patient?.user?.email || 'N/A'}</p>
                <p><span className="text-gray-500">Phone:</span> {appointment.patient?.user?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Doctor Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Name:</span> {appointment.doctor?.user?.fullName || 'N/A'}</p>
                <p><span className="text-gray-500">Specialization:</span> {appointment.doctor?.specialization || 'N/A'}</p>
                <p><span className="text-gray-500">Email:</span> {appointment.doctor?.user?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{new Date(appointment.appointmentDate).toLocaleDateString('bn-BD')}</p>
              </div>
              <div>
                <p className="text-gray-500">Time</p>
                <p className="font-medium">{appointment.startTime} - {appointment.endTime}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className={`flex items-center gap-1 font-medium ${typeInfo.color}`}>
                  <TypeIcon className="w-4 h-4" />
                  {typeInfo.label}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Fee</p>
                <p className="font-medium">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(appointment.fee)}</p>
              </div>
            </div>
          </div>

          {/* Symptoms & Notes */}
          {appointment.symptoms && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Symptoms
              </h3>
              <p className="text-sm text-gray-700">{appointment.symptoms}</p>
            </div>
          )}

          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Doctor's Notes
              </h3>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {/* Payment Info */}
          {appointment.payment && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Amount</p>
                  <p className="font-medium">{new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(appointment.payment.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className={`font-medium ${
                    appointment.payment.status === 'completed' ? 'text-green-600' :
                    appointment.payment.status === 'pending' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {appointment.payment.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Method</p>
                  <p className="font-medium capitalize">{appointment.payment.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transaction ID</p>
                  <p className="font-medium">{appointment.payment.transactionId || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Booking Information
            </h3>
            <div className="text-sm">
              <p><span className="text-gray-500">Booked on:</span> {new Date(appointment.createdAt).toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  )
}