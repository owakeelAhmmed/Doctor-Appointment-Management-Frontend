'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  User,
  Mail,
  Phone,
  Eye,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Shield
} from 'lucide-react'
import { adminAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const roleFromUrl = searchParams.get('role')
  
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    role: roleFromUrl || 'all',
    status: 'all',
    page: 1,
    limit: 20
  })
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 })
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const newRole = searchParams.get('role')
    if (newRole && newRole !== filters.role) {
      setFilters(prev => ({ ...prev, role: newRole, page: 1 }))
    } else if (!newRole && filters.role !== 'all') {
      setFilters(prev => ({ ...prev, role: 'all', page: 1 }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchUsers()
  }, [filters, searchQuery])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const apiFilters = { ...filters }
      if (apiFilters.role === 'all') {
        delete apiFilters.role
      }
      
      const response = await adminAPI.getUsers({ ...apiFilters, search: searchQuery })
      if (response && response.success) {
        setUsers(response.data || [])
        setPagination(response.pagination || { total: 0, pages: 1, page: 1 })
      } else {
        let dummyUsers = [
          { _id: '1', fullName: 'John Doe', email: 'john@example.com', phone: '01712345678', role: 'patient', isActive: true, isEmailVerified: true, createdAt: '2024-01-15' },
          { _id: '2', fullName: 'Dr. Sarah Ahmed', email: 'sarah@example.com', phone: '01812345678', role: 'doctor', isActive: true, isEmailVerified: true, createdAt: '2024-01-20' },
          { _id: '3', fullName: 'Admin User', email: 'admin@example.com', phone: '01912345678', role: 'admin', isActive: true, isEmailVerified: true, createdAt: '2024-01-10' },
          { _id: '4', fullName: 'Dr. Rahman', email: 'rahman@example.com', phone: '01612345678', role: 'doctor', isActive: true, isEmailVerified: true, createdAt: '2024-01-25' },
          { _id: '5', fullName: 'Jane Smith', email: 'jane@example.com', phone: '01512345678', role: 'patient', isActive: true, isEmailVerified: true, createdAt: '2024-01-28' },
        ]
        
        if (filters.role !== 'all') {
          dummyUsers = dummyUsers.filter(u => u.role === filters.role)
        }
        
        setUsers(dummyUsers)
        setPagination({ total: dummyUsers.length, pages: 1, page: 1, limit: 20 })
      }
    } catch (error) {
      console.error('Fetch users error:', error)
      showToast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleFilterChange = (newRole) => {
    if (newRole === 'all') {
      router.push('/admin/users')
    } else {
      router.push(`/admin/users?role=${newRole}`)
    }
    setFilters({ ...filters, role: newRole, page: 1 })
  }

  const handleStatusChange = async (userId, isActive) => {
    try {
      const response = await adminAPI.updateUserStatus(userId, { isActive })
      if (response && response.success) {
        showToast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
        fetchUsers()
        setShowStatusModal(false)
      }
    } catch (error) {
      showToast.error('Failed to update user status')
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      doctor: 'bg-blue-100 text-blue-700',
      patient: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700',
      superadmin: 'bg-red-100 text-red-700'
    }
    return colors[role] || 'bg-gray-100 text-gray-700'
  }

  const getStatusBadge = (isActive, isEmailVerified) => {
    if (!isActive) return { label: 'Inactive', color: 'bg-red-100 text-red-700' }
    if (!isEmailVerified) return { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' }
    return { label: 'Active', color: 'bg-green-100 text-green-700' }
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
        <h1 className="text-2xl font-bold text-gray-900">
          {filters.role === 'patient' ? 'Patients' : 
           filters.role === 'doctor' ? 'Doctors' : 
           filters.role === 'admin' ? 'Admins' : 'User Management'}
        </h1>
        <div className="flex gap-2">
          <select
            value={filters.role}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Users Count */}
      <div className="text-sm text-gray-500">
        Found {pagination.total} {filters.role === 'patient' ? 'patients' : 
                                filters.role === 'doctor' ? 'doctors' : 
                                filters.role === 'admin' ? 'admins' : 'users'}
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {filters.role === 'patient' ? 'patients' : 
                 filters.role === 'doctor' ? 'doctors' : 
                 filters.role === 'admin' ? 'admins' : 'users'} found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const status = getStatusBadge(user.isActive, user.isEmailVerified)
                    return (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{user.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadge(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${status.color}`}>{status.label}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/users/${user._id}`} className="p-2 hover:bg-gray-100 rounded-lg">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </Link>
                            <button
                              onClick={() => { setSelectedUser(user); setShowStatusModal(true) }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              {user.isActive ? <Ban className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="p-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm">
                  Page {filters.page} of {pagination.pages}
                </span>
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

      {/* Status Modal */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedUser.isActive 
                ? `Are you sure you want to deactivate ${selectedUser.fullName}? They will not be able to login.`
                : `Are you sure you want to activate ${selectedUser.fullName}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(selectedUser._id, !selectedUser.isActive)}
                className={`flex-1 px-4 py-2 rounded-lg text-white ${
                  selectedUser.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {selectedUser.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}