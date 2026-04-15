import axiosInstance from "./axios"

// API URL for direct fetch (if needed)
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'

// Auth API
export const authAPI = {
  register: (userData) => axiosInstance.post('/auth/register', userData),
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  verifyEmail: (email, otp) => axiosInstance.post('/auth/verify-email', { email, otp }),
  verifyPhone: (phone, otp) => axiosInstance.post('/auth/verify-phone', { phone, otp }),
  resendOTP: (identifier, type) => axiosInstance.post('/auth/resend-otp', { identifier, type }),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => axiosInstance.post('/auth/reset-password', { token, newPassword }),
  getProfile: () => axiosInstance.get('/auth/me'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => 
    axiosInstance.put('/auth/change-password', { currentPassword, newPassword }),
}

// Patient API
export const patientAPI = {
  getProfile: () => axiosInstance.get('/patient/profile'),
  updateProfile: (data) => axiosInstance.put('/patient/profile', data),
  searchDoctors: (params) => axiosInstance.get('/patient/doctors/search', { params }),
  getDoctorDetails: (doctorId) => axiosInstance.get(`/patient/doctors/${doctorId}`),
  getDoctorSlots: (doctorId) => axiosInstance.get(`/patient/doctors/${doctorId}/slots`),
  bookAppointment: (data) => axiosInstance.post('/patient/appointments', data),
  getMyAppointments: (params) => axiosInstance.get('/patient/appointments', { params }),
  cancelAppointment: (appointmentId) => axiosInstance.put(`/patient/appointments/${appointmentId}/cancel`),
  addReview: (appointmentId, data) => axiosInstance.post(`/patient/appointments/${appointmentId}/review`, data),
  addFavorite: (doctorId) => axiosInstance.post(`/patient/favorites/${doctorId}`),
  removeFavorite: (doctorId) => axiosInstance.delete(`/patient/favorites/${doctorId}`),
  getFavorites: () => axiosInstance.get('/patient/favorites'),
  getDashboard: () => axiosInstance.get('/patient/dashboard'),
  getPrescriptions: (params) => axiosInstance.get('/patient/prescriptions', { params }),
  downloadPrescription: (prescriptionId) => axiosInstance.get(`/patient/prescriptions/${prescriptionId}/download`),
}

// Payment API
export const paymentAPI = {
  initiateSSLCommerzPayment: (data) => axiosInstance.post('/payments/sslcommerz/initiate', data),
  getPaymentStatus: (paymentId) => axiosInstance.get(`/payments/${paymentId}`),
  getMyPayments: (params) => axiosInstance.get('/payments/my', { params }),
  getPaymentByAppointment: (appointmentId) => axiosInstance.get(`/payments/appointment/${appointmentId}`),
}

// Doctor API
export const doctorAPI = {
  getProfile: () => axiosInstance.get('/doctors/profile'),
  updateProfile: (data) => axiosInstance.put('/doctors/profile', data),
  
  // Document Upload
  uploadDocuments: (formData) => axiosInstance.post('/doctors/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Verification
  getVerificationStatus: () => axiosInstance.get('/doctors/verification-status'),
  getCompleteProfile: () => axiosInstance.get('/doctors/complete-profile'),
  submitCompleteProfile: (data) => axiosInstance.post('/doctors/complete-profile', data),
  
  // Schedule & Fee
  updateSchedule: (data) => axiosInstance.put('/doctors/schedule', data),
  updateFee: (fee) => axiosInstance.put('/doctors/fee', { consultationFee: fee }),
  
  // Banking
  updateBankInfo: (data) => axiosInstance.put('/doctors/bank-info', data),
  updateMobileBanking: (data) => axiosInstance.put('/doctors/mobile-banking', data),
  
  // Appointments
  getAppointments: (params) => axiosInstance.get('/doctors/appointments', { params }),
  getTodaySchedule: () => axiosInstance.get('/doctors/appointments/today'),
  updateAppointmentStatus: (appointmentId, status, notes) => 
    axiosInstance.put(`/doctors/appointments/${appointmentId}/status`, { status, notes }),
  getAppointmentDetails: (appointmentId) => 
    axiosInstance.get(`/doctors/appointments/${appointmentId}`),
  
  // Patients
  getPatients: (params) => axiosInstance.get('/doctors/patients', { params }),
  getPatientDetails: (patientId) => axiosInstance.get(`/doctors/patients/${patientId}`),
  
  // Reviews
  getReviews: (params) => axiosInstance.get('/doctors/reviews', { params }),
  respondToReview: (reviewId, comment) => 
    axiosInstance.post(`/doctors/reviews/${reviewId}/respond`, { comment }),
  
  // Earnings & Withdrawals
  getEarnings: (params) => axiosInstance.get('/doctors/earnings', { params }),
  requestWithdrawal: (data) => axiosInstance.post('/doctors/withdrawals', data),
  getWithdrawalHistory: () => axiosInstance.get('/doctors/withdrawals'),
  
  // Dashboard
  getDashboard: () => axiosInstance.get('/doctors/dashboard'),
}

// Admin API
export const adminAPI = {
  getDashboard: () => axiosInstance.get('/admin/dashboard'),
  getUsers: (params) => axiosInstance.get('/admin/users', { params }),
  getUserDetails: (userId) => axiosInstance.get(`/admin/users/${userId}`),
  updateUserStatus: (userId, data) => axiosInstance.put(`/admin/users/${userId}/status`, data),
  updateUserRole: (userId, data) => axiosInstance.put(`/admin/users/${userId}/role`, data),
  getDoctorVerifications: (params) => axiosInstance.get('/admin/doctors/verification', { params }),
  verifyDoctor: (doctorId, data) => axiosInstance.put(`/admin/doctors/${doctorId}/verify`, data),
  verifyDocument: (doctorId, documentType, data) => axiosInstance.put(`/admin/doctors/${doctorId}/documents/${documentType}/verify`, data),
  getAllAppointments: (params) => axiosInstance.get('/admin/appointments', { params }),
  getAllPayments: (params) => axiosInstance.get('/admin/payments', { params }),
  processWithdrawal: (withdrawalId, data) => axiosInstance.post(`/admin/withdrawals/${withdrawalId}/process`, data),
  getRevenueAnalytics: (params) => axiosInstance.get('/admin/analytics/revenue', { params }),
  updateCommission: (doctorId, rate) => axiosInstance.put(`/admin/commissions/doctors/${doctorId}`, { commissionRate: rate }),
  getSettings: () => axiosInstance.get('/admin/settings'),
  updateSettings: (data) => axiosInstance.put('/admin/settings', data),
}

// ✅ Public API
export const publicAPI = {
  getDoctors: (params) => axiosInstance.get('/doctors/public', { params }),
  getFilters: () => axiosInstance.get('/doctors/public/filters'),
  getDoctorDetails: (doctorId) => axiosInstance.get(`/doctors/public/${doctorId}`),
  getDoctorSlots: (doctorId, date) => axiosInstance.get(`/doctors/public/${doctorId}/slots`, { params: { date } }),
}

// Default export
export default {
  auth: authAPI,
  patient: patientAPI,
  doctor: doctorAPI,
  public: publicAPI,
  admin: adminAPI,
  payment: paymentAPI,
}