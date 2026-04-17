'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { adminAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, patients: 0, doctors: 0, admins: 0, newToday: 0, pendingVerification: 0 },
    appointments: { total: 0, today: 0, completed: 0, cancelled: 0, completionRate: 0 },
    revenue: { total: 0, today: 0, thisMonth: 0, pendingWithdrawals: 0 },
    recentAppointments: [],
    recentUsers: []
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await adminAPI.getDashboard()
      if (response && response.success) {
        setDashboardData(response.data)
      } else {
        // Dummy data for testing
        setDashboardData({
          users: { total: 1248, patients: 892, doctors: 324, admins: 32, newToday: 12, pendingVerification: 8 },
          appointments: { total: 2456, today: 18, completed: 1892, cancelled: 234, completionRate: 77 },
          revenue: { total: 1250000, today: 45000, thisMonth: 328000, pendingWithdrawals: 125000 },
          recentAppointments: [
            { _id: '1', doctor: { user: { fullName: 'Dr. John Smith' } }, patient: { user: { fullName: 'John Doe' } }, appointmentDate: new Date(), startTime: '10:00', status: 'confirmed' },
            { _id: '2', doctor: { user: { fullName: 'Dr. Sarah Ahmed' } }, patient: { user: { fullName: 'Jane Smith' } }, appointmentDate: new Date(), startTime: '11:00', status: 'pending' }
          ],
          recentUsers: [
            { _id: '1', fullName: 'John Doe', email: 'john@example.com', role: 'patient', createdAt: new Date() },
            { _id: '2', fullName: 'Dr. Sarah Ahmed', email: 'sarah@example.com', role: 'doctor', createdAt: new Date() }
          ]
        })
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      showToast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: dashboardData.users.total,
      icon: Users,
      color: 'bg-blue-500',
      trend: `+${dashboardData.users.newToday} today`,
      trendUp: true
    },
    {
      title: 'Doctors',
      value: dashboardData.users.doctors,
      icon: Stethoscope,
      color: 'bg-green-500',
      trend: `${dashboardData.users.pendingVerification} pending`,
      trendUp: false
    },
    {
      title: 'Appointments',
      value: dashboardData.appointments.total,
      icon: Calendar,
      color: 'bg-purple-500',
      trend: `${dashboardData.appointments.today} today`,
      trendUp: true
    },
    {
      title: 'Revenue',
      value: formatCurrency(dashboardData.revenue.total),
      icon: DollarSign,
      color: 'bg-orange-500',
      trend: `+${formatCurrency(dashboardData.revenue.today)} today`,
      trendUp: true
    }
  ]

  const appointmentStats = [
    { label: 'Completion Rate', value: `${dashboardData.appointments.completionRate}%`, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Today', value: dashboardData.appointments.today, icon: Clock, color: 'text-blue-600' },
    { label: 'Completed', value: dashboardData.appointments.completed, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Cancelled', value: dashboardData.appointments.cancelled, icon: XCircle, color: 'text-red-600' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {session?.user?.name || session?.user?.fullName || 'Admin'}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon
          return (
            <motion.div key={card.title} variants={itemVariants} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className={`text-xs mt-2 ${card.trendUp ? 'text-green-600' : 'text-yellow-600'}`}>{card.trend}</p>
                </div>
                <div className={`p-3 rounded-xl ${card.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${card.color} text-opacity-70`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Appointment Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {appointmentStats.map((stat) => {
          const Icon = stat.icon
          return (
            <motion.div key={stat.label} variants={itemVariants} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
            <Link href="/admin/appointments" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          <div className="divide-y">
            {dashboardData.recentAppointments?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No recent appointments</div>
            ) : (
              dashboardData.recentAppointments?.slice(0, 5).map((appointment) => (
                <div key={appointment._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Dr. {appointment.doctor?.user?.fullName || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{appointment.patient?.user?.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString('bn-BD') : 'N/A'} at {appointment.startTime || 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {appointment.status || 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">New Users</h2>
            <Link href="/admin/users" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          <div className="divide-y">
            {dashboardData.recentUsers?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No recent users</div>
            ) : (
              dashboardData.recentUsers?.slice(0, 5).map((user) => (
                <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('bn-BD') : 'N/A'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      user.role === 'doctor' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'patient' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Revenue Summary */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Revenue Summary</h2>
          <Link href="/admin/reports/revenue" className="text-sm text-primary-600 hover:text-primary-700">View Report</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(dashboardData.revenue.total)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(dashboardData.revenue.thisMonth)}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600">Pending Withdrawals</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(dashboardData.revenue.pendingWithdrawals)}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}