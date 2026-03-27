'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  FileText,
  Download,
  Calendar,
  User,
  Search,
  Filter,
  Eye,
  Pill,
  Beaker,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all') // all, active, past
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1
  })

  useEffect(() => {
    fetchPrescriptions()
  }, [filter, pagination.page])

  const fetchPrescriptions = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.getPrescriptions({
        status: filter === 'all' ? 'all' : filter === 'active' ? 'active' : '',
        page: pagination.page,
        limit: 10
      })
      if (response.success) {
        setPrescriptions(response.data.prescriptions)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      showToast.error('Failed to load prescriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPrescription = async (prescriptionId) => {
    try {
      const response = await patientAPI.downloadPrescription(prescriptionId)
      if (response.success) {
        window.open(response.data.pdfUrl, '_blank')
      }
    } catch (error) {
      showToast.error('Failed to download prescription')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Prescriptions</option>
            <option value="active">Active</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search prescriptions by doctor name or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No prescriptions yet</h3>
          <p className="text-gray-500 mb-6">Your prescriptions will appear here after your appointments</p>
          <Link
            href="/patient/doctors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Book an Appointment
          </Link>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {prescriptions.map((prescription) => (
            <motion.div
              key={prescription._id}
              variants={itemVariants}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary-600" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {prescription.doctor?.user?.fullName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {prescription.doctor?.specialization}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(prescription.createdAt), 'MMMM dd, yyyy')}
                      </span>
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      <span className="text-gray-900 font-medium">
                        {prescription.diagnosis}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-2">
                      {prescription.medicines?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Pill className="w-3 h-3" />
                          {prescription.medicines.length} medicines
                        </div>
                      )}
                      {prescription.tests?.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Beaker className="w-3 h-3" />
                          {prescription.tests.length} tests
                        </div>
                      )}
                    </div>

                    {prescription.followUpDate && (
                      <p className="mt-2 text-sm text-primary-600">
                        Follow-up: {format(new Date(prescription.followUpDate), 'MMMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/patient/prescriptions/${prescription._id}`}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => downloadPrescription(prescription._id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <Link
                    href={`/patient/prescriptions/${prescription._id}`}
                    className="flex items-center gap-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4" />
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
                  onClick={() => setPagination({ ...pagination, page: i + 1 })}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}