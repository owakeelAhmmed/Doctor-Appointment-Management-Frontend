'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  User,
  FileText,
  Heart,
  Stethoscope,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/app/lib/hooks/useAuth'

// Menu configuration based on role
const getMenuByRole = (role) => {
  const patientMenu = [
    { name: 'Dashboard', href: '/patient', icon: LayoutDashboard },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Find Doctors', href: '/patient/doctors', icon: Stethoscope },
    { name: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
    { name: 'Favorites', href: '/patient/favorites', icon: Heart },
    { name: 'Profile', href: '/patient/profile', icon: User },
  ]

  const doctorMenu = [
    { name: 'Dashboard', href: '/doctor', icon: LayoutDashboard },
    { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
    { name: 'My Patients', href: '/doctor/patients', icon: User },
    { name: 'Schedule', href: '/doctor/schedule', icon: Calendar },
    { name: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
    { name: 'Earnings', href: '/doctor/earnings', icon: Heart },
    { name: 'Profile', href: '/doctor/profile', icon: User },
  ]

  const adminMenu = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { name: 'Payments', href: '/admin/payments', icon: Heart },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
  ]

  if (role === 'patient') return patientMenu
  if (role === 'doctor') return doctorMenu
  if (role === 'admin' || role === 'superadmin') return adminMenu
  return patientMenu
}

export default function DynamicSidebar({ isMobile, onClose }) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = getMenuByRole(user?.role)

  const isActive = (href) => {
    if (href === '/patient' || href === '/doctor' || href === '/admin') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72'

  return (
    <div className={`h-full bg-white border-r ${sidebarWidth} transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b">
        {!isCollapsed ? (
          <Link href="/" className="text-lg font-bold text-primary-600">
            DABS
          </Link>
        ) : (
          <Link href="/" className="text-lg font-bold text-primary-600 mx-auto">
            D
          </Link>
        )}
        
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}

        {isMobile && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* User Info - Compact */}
      {!isCollapsed && (
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate text-sm">
                {user?.name || user?.fullName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - Compact spacing */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && onClose()}
              className={`
                flex items-center gap-2 px-2 py-2 rounded-md transition-colors
                ${active 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-primary-600' : ''}`} />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer - Compact */}
      <div className="border-t p-2 space-y-0.5">
        {!isCollapsed && (
          <>
            <Link
              href="/support"
              className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:bg-gray-50 rounded-md text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </>
        )}
        
        <button
          onClick={logout}
          className={`flex items-center gap-2 px-2 py-2 text-red-600 hover:bg-red-50 rounded-md w-full ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  )
}