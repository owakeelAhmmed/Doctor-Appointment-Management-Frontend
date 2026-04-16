'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Search,
  Stethoscope,
  Home,
  Info,
  Phone,
  Mail,
  MapPin,
  LogIn,
  UserPlus,
  Clock,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { showToast } from '@/app/lib/utils/toast'

const publicMenu = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Doctors', href: '/doctors', icon: Stethoscope },
  { name: 'How It Works', href: '/how-it-works', icon: null },
  { name: 'Services', href: '/services', icon: null },
  { name: 'About', href: '/about', icon: Info },
  { name: 'Contact', href: '/contact', icon: Phone },
]

const contactInfo = [
  { icon: Phone, text: '+880 1234 567890', href: 'tel:+8801234567890' },
  { icon: Mail, text: 'support@doccare.com', href: 'mailto:support@doccare.com' },
  { icon: MapPin, text: 'Dhaka, Bangladesh', href: '#' }
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const userRole = user?.role

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
    setSearchOpen(false)
    setNotificationsOpen(false)
    setProfileOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
  }

  const isActive = (href) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const getDashboardLink = () => {
    if (userRole === 'patient') return '/patient'
    if (userRole === 'doctor') return '/doctor'
    if (userRole === 'admin' || userRole === 'superadmin') return '/admin'
    return '/'
  }

  const notifications = [
    { id: 1, title: 'New appointment request', time: '5 min ago', read: false },
    { id: 2, title: 'Payment received', time: '2 hours ago', read: true },
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      {!isAuthenticated && !isScrolled && (
        <div className="hidden lg:block bg-gradient-to-r from-blue-700 to-indigo-700 text-white text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-4">
                {contactInfo.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.text}</span>
                    </a>
                  )
                })}
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  24/7 Emergency Support
                </span>
                <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
                  Emergency: 999
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b'
            : isAuthenticated
              ? 'bg-white shadow-sm border-b'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        } ${!isAuthenticated && !isScrolled ? 'lg:top-8' : 'top-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href={isAuthenticated ? getDashboardLink() : '/'}
              className="flex items-center gap-2 group"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                !isAuthenticated && !isScrolled
                  ? 'bg-white/20 group-hover:bg-white/30'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}>
                <Stethoscope className={`w-5 h-5 ${!isAuthenticated && !isScrolled ? 'text-white' : 'text-white'}`} />
              </div>
              <span className={`text-xl font-bold ${
                !isAuthenticated && !isScrolled
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              } hidden sm:inline`}>
                DocCare
              </span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-1">
              {publicMenu.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !isAuthenticated && !isScrolled
                        ? active
                          ? 'text-white bg-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                        : active
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50"
                    >
                      <form onSubmit={handleSearch} className="p-2">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <Search className="w-5 h-5 text-gray-400 ml-3" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search doctors, clinics..."
                            className="flex-1 px-3 py-2 outline-none text-sm"
                            autoFocus
                          />
                          <button type="submit" className="px-3 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700">
                            Go
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications.some(n => !n.read) && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border overflow-hidden z-50"
                      >
                        <div className="p-3 border-b">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notif) => (
                            <div key={notif.id} className={`block px-3 py-3 ${!notif.read ? 'bg-blue-50' : ''}`}>
                              <p className="text-sm text-gray-900">{notif.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Auth Buttons / Profile Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {user?.name?.charAt(0) || user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name || user?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium text-gray-900">{user?.name || user?.fullName}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          href={getDashboardLink()}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href={`/${userRole}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Profile
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                      !isAuthenticated && !isScrolled
                        ? 'text-white/90 hover:text-white'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-all ${
                      !isAuthenticated && !isScrolled
                        ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/25'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed top-16 left-0 bottom-0 w-80 bg-white shadow-xl z-40 overflow-y-auto lg:hidden"
          >
            <div className="p-4">
              <nav className="space-y-1">
                {publicMenu.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        active
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {item.icon && <item.icon className="w-5 h-5" />}
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {!isAuthenticated && (
                <>
                  <hr className="my-4" />
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </>
              )}

              {isAuthenticated && (
                <>
                  <hr className="my-4" />
                  <div className="space-y-2">
                    <Link
                      href={getDashboardLink()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}

              <hr className="my-4" />
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Contact Info</p>
                {contactInfo.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.text}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className={`${!isAuthenticated && !isScrolled ? 'lg:h-24 h-16' : 'h-16'}`} />
    </>
  )
}