'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import axiosInstance from '@/app/lib/api/axios'
import { showToast } from '@/app/lib/utils/toast'

// Create Auth Context
const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Main Providers component
export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <GooeyToaster 
          position="bottom-right"
          theme="light"
          gap={14}
          offset="24px"
          spring={true}
          bounce={0.4}
          showProgress={false}
          closeOnEscape={true}
          swipeToDismiss={true}
          dir="ltr"
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

// Pure localStorage Auth Provider (No NextAuth) - NO PROTECTION
function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          
          // Set axios default header
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          // Verify token with backend (optional but recommended)
          try {
            const response = await axiosInstance.get('/auth/me')
            if (response.data?.success) {
              setUser(response.data.data.user)
              localStorage.setItem('user', JSON.stringify(response.data.data.user))
            }
          } catch (error) {
            // Token invalid, clear storage
            console.error('Token verification failed:', error)
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
          }
        } catch (error) {
          console.error('Auth init error:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      
      setLoading(false)
    }
    
    initAuth()
  }, [])


  // Login function
  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password })
      
      if (response.data?.success) {
        const { token, user } = response.data.data
        
        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        
        // Set axios header
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        setUser(user)
        showToast.success('Login successful!')
        
        return { success: true, user }
      }
      
      return { success: false, message: response.data?.message || 'Login failed' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Login failed'
      }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData)
      
      if (response.data?.success) {
        showToast.success('Registration successful! Please verify your email.')
        return { success: true, data: response.data.data }
      }
      
      return { success: false, message: response.data?.message || 'Registration failed' }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Registration failed'
      }
    }
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axiosInstance.defaults.headers.common['Authorization']
    setUser(null)
    showToast.success('Logged out successfully')
    router.push('/login')
  }

  // Update user in state and localStorage
  const updateUser = (updatedUser) => {
    const mergedUser = { ...user, ...updatedUser }
    setUser(mergedUser)
    localStorage.setItem('user', JSON.stringify(mergedUser))
  }

  // Role check helpers
  const isPatient = user?.role === 'patient'
  const isDoctor = user?.role === 'doctor'
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isDoctorVerified = user?.verificationStatus === 'verified'

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isPatient,
    isDoctor,
    isAdmin,
    isDoctorVerified,
    login,
    register,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}