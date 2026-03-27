'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Menu,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import DynamicSidebar from '../components/layout/DynamicSidebar'
import { useAuth } from '../lib/hooks/useAuth'

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  useEffect(() => {
    setIsSidebarOpen(false)
    setIsProfileMenuOpen(false)
  }, [pathname])

  const getPageTitle = () => {
    const path = pathname.split('/').filter(Boolean)
    if (path.length === 1) return 'Dashboard'
    return path[1].charAt(0).toUpperCase() + path[1].slice(1).replace(/-/g, ' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop - fixed position */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
        <DynamicSidebar isMobile={false} onClose={() => {}} />
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72">
            <DynamicSidebar isMobile={true} onClose={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content - with proper margin */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Left section */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                <div>
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {getPageTitle()}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Welcome back, {user?.name || user?.fullName}
                  </p>
                </div>
              </div>

              {/* Right section */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Notifications */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                      {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || user?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role}
                      </p>
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
                          href={`/${user?.role}/profile`}
                          className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span className="text-sm">Profile</span>
                        </Link>
                        <Link
                          href={`/${user?.role}/settings`}
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
                            logout()
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
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}