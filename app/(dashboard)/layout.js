'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react'
import { showToast } from '@/app/lib/utils/toast'
import { menuConfig } from '../lib/menu-config/menu'

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)

  const isLoading = status === 'loading'
  const user = session?.user
  const isAuthenticated = !!session?.user
  const userRole = user?.role

  const roleMenu = userRole === 'patient' ? menuConfig.patient.main :
                   userRole === 'doctor' ? menuConfig.doctor.main :
                   userRole === 'admin' || userRole === 'superadmin' ? menuConfig.admin.main : []
  
  const secondaryMenu = userRole === 'patient' ? menuConfig.patient.secondary :
                        userRole === 'doctor' ? menuConfig.doctor.secondary :
                        userRole === 'admin' || userRole === 'superadmin' ? menuConfig.admin.secondary : []

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (userRole === 'patient') {
        // patient allowed
      } else if (userRole === 'doctor') {
        // doctor allowed
      } else if (userRole === 'admin' || userRole === 'superadmin') {
        // admin allowed
      } else {
        router.push('/')
        showToast.error('Access denied')
      }
    }
  }, [isLoading, isAuthenticated, userRole, router])

  const handleLogout = async () => {
    try {
      const { signOut } = await import('next-auth/react')
      await signOut({ redirect: false })
      showToast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      showToast.error('Error logging out')
    }
  }

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name)
  }

  const isActive = (href) => {
    if (href === '/patient' || href === '/doctor' || href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getPageTitle = () => {
    for (const item of roleMenu) {
      if (isActive(item.href)) return item.name
      if (item.submenu) {
        const subItem = item.submenu.find(sub => isActive(sub.href))
        if (subItem) return subItem.name
      }
    }
    return 'Dashboard'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-full bg-white shadow-lg transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold text-primary-600">
            {userRole === 'patient' ? 'Patient Panel' : 
             userRole === 'doctor' ? 'Doctor Panel' : 'Admin Panel'}
          </h1>
          <p className="text-xs text-gray-500">Doctor Appointment System</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || user?.fullName}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {roleMenu.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            if (item.submenu) {
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 mx-2 rounded-lg transition-colors ${
                      active || openSubmenu === item.name
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        openSubmenu === item.name ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  
                  {openSubmenu === item.name && (
                    <div className="ml-11 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(sub.href)
                              ? 'text-primary-600 bg-primary-50'
                              : 'text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-primary-500 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Secondary Menu */}
          {secondaryMenu.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              {secondaryMenu.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 mx-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </nav>

        {/* Footer Menu */}
        <div className="p-4 border-t">
          {menuConfig.common.bottom.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2 mb-1 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full mt-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {getPageTitle()}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
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
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                      <Link
                        href={`/${userRole}/profile`}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </Link>
                      <Link
                        href={`/${userRole}/settings`}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </Link>
                      <hr />
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
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
      </main>
    </div>
  )
}