'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  Clock
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  })

  useEffect(() => {
    fetchPatients()
  }, [pagination.page, searchQuery])

  const fetchPatients = async () => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.getPatients({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery
      })
      if (response.success) {
        setPatients(response.data || [])
        setPagination(response.pagination)
      }
    } catch (error) {
      showToast.error('Failed to load patients')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('bn-BD')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-500 mt-1">View and manage your patient list</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchPatients()}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Patients Count */}
      {patients.length > 0 && (
        <div className="text-sm text-gray-500">
          Found {pagination.total} patient{pagination.total !== 1 ? 's' : ''}
        </div>
      )}

      {/* Patients List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients yet</h3>
          <p className="text-gray-500">Your patients will appear here after appointments</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient, index) => (
              <motion.div
                key={patient._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {patient.user?.fullName}
                    </h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3" />
                        <span>{patient.user?.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{patient.user?.email}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Activity className="w-3 h-3" />
                        <span>{patient.visitCount || 0} visits</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Last visit: {formatDate(patient.lastVisitDate)}</span>
                      </div>
                    </div>
                    
                    <Link
                      href={`/doctor/patients/${patient._id}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} patients
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}