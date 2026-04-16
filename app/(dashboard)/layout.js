'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  Stethoscope,
  FileText,
  Heart,
  Users,
  Clock,
  DollarSign,
  Shield,
  Video,
  MessageSquare,
  Star,
  CreditCard,
  TrendingUp
} from 'lucide-react'
import { showToast } from '@/app/lib/utils/toast'

// Menu Configuration
const getMenuConfig = (role) => {
  const commonItems = [
    { name: 'Dashboard', href: `/${role}`, icon: LayoutDashboard },
    { name: 'Appointments', href: `/${role}/appointments`, icon: Calendar },
  ]

  if (role === 'patient') {
    return {
      main: [
        ...commonItems,
        { name: 'Find Doctors', href: '/patient/doctors', icon: Stethoscope },
        { name: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
        { name: 'Favorites', href: '/patient/favorites', icon: Heart },
        { name: 'Profile', href: '/patient/profile', icon: User },
      ]
    }
  }

  if (role === 'doctor') {
    return {
      main: [
        ...commonItems,
        { name: 'My Patients', href: '/doctor/patients', icon: Users },
        { name: 'Schedule', href: '/doctor/schedule', icon: Clock },
        { name: 'Earnings', href: '/doctor/earnings', icon: DollarSign },
        // { name: 'Reviews', href: '/doctor/reviews', icon: Star },
        { name: 'Complete Profile', href: '/doctor/complete-profile', icon: Shield },
        { name: 'Profile', href: '/doctor/profile', icon: User },
      ]
    }
  }

  if (role === 'admin' || role === 'superadmin') {
    return {
      main: [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Doctor Verification', href: '/admin/doctors/verification', icon: Shield },
        { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard },
        { name: 'Reports', href: '/admin/reports', icon: TrendingUp },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
      ]
    }
  }

  return { main: [] }
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  const isLoading = loading
  const userRole = user?.role

  const menuConfig = getMenuConfig(userRole)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      }
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (href) => {
    if (href === `/${userRole}`) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getPageTitle = () => {
    for (const item of menuConfig.main) {
      if (isActive(item.href)) return item.name
    }
    return 'Dashboard'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Sidebar - Static on Desktop, Fixed on Mobile */}
      <aside
        className={`
          lg:relative lg:translate-x-0 lg:w-64 lg:flex-shrink-0 lg:block
          fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <Link href="/">
            <h1 className="text-lg font-bold text-green-600">Doccure</h1>
          <p className="text-xs text-gray-500 mt-0.5 capitalize">{userRole} Panel</p>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || user?.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuConfig.main.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all cursor-pointer ${
                  active
                    ? 'bg-green-50 text-green-600 border-l-3 border-green-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full border border-gray-200 rounded-lg text-red-600 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content - Full height with flex column */}
      <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed height, no grow */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h2 className="text-base font-semibold text-gray-800">
                {getPageTitle()}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg relative cursor-pointer transition-all">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg cursor-pointer transition-all"
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                    {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || user?.fullName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                </button>

                {/* Dropdown */}
                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                      <Link
                        href={`/${userRole}/profile`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href={`/${userRole}/settings`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-all"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <hr className="border-gray-200" />
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}