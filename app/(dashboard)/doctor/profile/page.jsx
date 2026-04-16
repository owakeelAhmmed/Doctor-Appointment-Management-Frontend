// app/(dashboard)/doctor/profile/page.jsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  GraduationCap,
  Building,
  DollarSign,
  Edit2,
  Save,
  X,
  Camera,
  Star,
  Users,
  Calendar,
  Clock,
  Stethoscope,
  Briefcase,
  Smartphone,
  Banknote,
  Shield,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorProfilePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getProfile()
      
      let userData = null
      let doctorData = null
      
      if (response?.data?.success) {
        userData = response.data.data.user
        doctorData = response.data.data.doctor
      } else if (response?.success) {
        userData = response.data.user
        doctorData = response.data.doctor
      }
      
      if (userData && doctorData) {
        setProfileData({ user: userData, doctor: doctorData })
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          specialization: doctorData.specialization || '',
          experienceYears: doctorData.experienceYears || 0,
          consultationFee: doctorData.consultationFee || 0,
          workplaceName: doctorData.currentWorkplace?.name || '',
          workplaceCity: doctorData.currentWorkplace?.city || '',
          workplaceAddress: doctorData.currentWorkplace?.address || '',
          workplacePhone: doctorData.currentWorkplace?.contactNumber || '',
          bankName: doctorData.bankInfo?.bankName || '',
          accountNumber: doctorData.bankInfo?.accountNumber || '',
          accountHolderName: doctorData.bankInfo?.accountHolderName || '',
          bkashNumber: doctorData.mobileBanking?.bKash || '',
          nagadNumber: doctorData.mobileBanking?.nagad || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast.error('Failed to load profile')
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const updateData = {
        specialization: formData.specialization,
        experienceYears: parseInt(formData.experienceYears),
        consultationFee: parseInt(formData.consultationFee),
        currentWorkplace: {
          name: formData.workplaceName,
          city: formData.workplaceCity,
          address: formData.workplaceAddress,
          contactNumber: formData.workplacePhone
        },
        bankInfo: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountHolderName: formData.accountHolderName
        },
        mobileBanking: {
          bKash: formData.bkashNumber,
          nagad: formData.nagadNumber
        }
      }

      const response = await doctorAPI.updateProfile(updateData)
      
      if (response?.data?.success || response?.success) {
        showToast.success('Profile updated successfully')
        setIsEditing(false)
        fetchProfile()
      }
    } catch (error) {
      showToast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    if (!amount) return '৳0'
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const { user: userData, doctor } = profileData
  const isVerified = doctor.verificationStatus === 'verified'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal and professional information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false)
                fetchProfile()
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-24 bg-gradient-to-r from-green-600 to-green-700"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                  {userData.profileImage?.url ? (
                    <img
                      src={userData.profileImage.url}
                      alt={userData.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-green-600" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">Dr. {userData.fullName}</h2>
                {isVerified && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-gray-500">{doctor.specialization || 'Specialization not set'}</p>
              <p className="text-sm text-gray-400 mt-1">
                Member since {formatDate(userData.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {doctor.verificationStatus === 'verified' ? 'Verified Account' : 'Pending Verification'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{doctor.totalPatients || 0}</p>
              <p className="text-xs text-gray-500">Total Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
                {doctor.rating || 0} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </p>
              <p className="text-xs text-gray-500">Rating ({doctor.totalReviews || 0})</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(doctor.consultationFee || 0)}</p>
              <p className="text-xs text-gray-500">Consultation Fee</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'professional', label: 'Professional', icon: Stethoscope },
              { id: 'workplace', label: 'Workplace', icon: Building },
              { id: 'banking', label: 'Banking', icon: Banknote }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative cursor-pointer ${
                    activeTab === tab.id
                      ? 'text-green-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit}>
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        name="phone"
                        value={formData.phone}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BMDC Reg No</label>
                    <input
                      value={doctor.bmdcRegNo || 'N/A'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'professional' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      <option value="">Select Specialization</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Neurology">Neurology</option>
                      <option value="Dermatology">Dermatology</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="ENT">ENT</option>
                      <option value="Dentistry">Dentistry</option>
                      <option value="Psychiatry">Psychiatry</option>
                      <option value="General Medicine">General Medicine</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (BDT)</label>
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Qualifications */}
                {doctor.qualifications && doctor.qualifications.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                    <div className="space-y-2">
                      {doctor.qualifications.map((q, i) => (
                        <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="font-medium">{q.degree}</p>
                          <p className="text-sm text-gray-500">{q.institute} ({q.year})</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'workplace' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic Name</label>
                    <input
                      name="workplaceName"
                      value={formData.workplaceName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      name="workplaceCity"
                      value={formData.workplaceCity}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="workplaceAddress"
                      value={formData.workplaceAddress}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={2}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      name="workplacePhone"
                      value={formData.workplacePhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'banking' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-green-600" />
                    Bank Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                      <input
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-green-600" />
                    Mobile Banking
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
                      <input
                        name="bkashNumber"
                        value={formData.bkashNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Number</label>
                      <input
                        name="nagadNumber"
                        value={formData.nagadNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isEditing && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}