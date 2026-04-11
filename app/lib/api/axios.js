import axios from 'axios'
import { getSession } from 'next-auth/react'
import { showToast } from '../utils/toast'

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const axiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
})

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession()
      if (session?.user?.token) {
        config.headers.Authorization = `Bearer ${session.user.token}`
      }
      
      // Also check localStorage for token
      const localToken = localStorage.getItem('token')
      if (localToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${localToken}`
      }
    } catch (error) {
      console.error('Session fetch error:', error)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - FIXED: Return full response
axiosInstance.interceptors.response.use(
  (response) => {
    // Return full response object, not just response.data
    return response
  },
  (error) => {
    if (!error.response) {
      showToast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    const { status, data } = error.response
    const message = data?.message || 'Something went wrong'

    switch (status) {
      case 400:
        showToast.error(message)
        break
      case 401:
        showToast.error('Session expired. Please login again.')
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        }
        break
      case 403:
        showToast.error('You do not have permission')
        break
      case 404:
        showToast.error('Resource not found')
        break
      default:
        showToast.error(message)
    }

    return Promise.reject(error.response?.data || error)
  }
)

export default axiosInstance