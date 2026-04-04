import axiosInstance from './axios'

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

// Doctor API
export const doctorAPI = {
  getProfile: () => axiosInstance.get('/doctor/profile'),
  updateProfile: (data) => axiosInstance.put('/doctor/profile', data),
  updateSchedule: (data) => axiosInstance.put('/doctor/schedule', data),
  updateFee: (fee) => axiosInstance.put('/doctor/fee', { consultationFee: fee }),
  getAppointments: (params) => axiosInstance.get('/doctor/appointments', { params }),
  getTodaySchedule: () => axiosInstance.get('/doctor/appointments/today'),
  updateAppointmentStatus: (appointmentId, status) => 
    axiosInstance.put(`/doctor/appointments/${appointmentId}/status`, { status }),
  getPatients: (params) => axiosInstance.get('/doctor/patients', { params }),
  getPatientDetails: (patientId) => axiosInstance.get(`/doctor/patients/${patientId}`),
  getEarnings: (params) => axiosInstance.get('/doctor/earnings', { params }),
  requestWithdrawal: (data) => axiosInstance.post('/doctor/withdrawals', data),
  getDashboard: () => axiosInstance.get('/doctor/dashboard'),
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

export default {
  auth: authAPI,
  patient: patientAPI,
  doctor: doctorAPI,
  admin: adminAPI,
}