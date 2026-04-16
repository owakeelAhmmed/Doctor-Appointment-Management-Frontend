
import axios from 'axios'
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

// Request interceptor - Get token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
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
        localStorage.removeItem('token')
        localStorage.removeItem('user')
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
      case 500:
        showToast.error('Server error. Please try again later.')
        break
      default:
        showToast.error(message)
    }

    return Promise.reject(error.response?.data || error)
  }
)

export default axiosInstance