import axiosInstance from './axios'

export const authApi = {
  // Register new user
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData)
  },

  // Verify email OTP
  verifyEmail: (email, otp) => {
    return axiosInstance.post('/auth/verify-email', { email, otp })
  },

  // Verify phone OTP
  verifyPhone: (phone, otp) => {
    return axiosInstance.post('/auth/verify-phone', { phone, otp })
  },

  // Resend OTP
  resendOTP: (identifier, type) => {
    return axiosInstance.post('/auth/resend-otp', { identifier, type })
  },

  // Forgot password
  forgotPassword: (email) => {
    return axiosInstance.post('/auth/forgot-password', { email })
  },

  // Reset password
  resetPassword: (token, newPassword) => {
    return axiosInstance.post('/auth/reset-password', { token, newPassword })
  },

  // Get current user profile
  getProfile: () => {
    return axiosInstance.get('/auth/me')
  },

  // Update profile
  updateProfile: (profileData) => {
    return axiosInstance.put('/auth/profile', profileData)
  },

  // Change password
  changePassword: (currentPassword, newPassword) => {
    return axiosInstance.put('/auth/change-password', { currentPassword, newPassword })
  }
}