// app/(dashboard)/patient/profile/page.jsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  AlertCircle,
  Droplet,
  Edit2,
  Save,
  X,
  Camera,
  ChevronDown,
  Bell,
  Globe,
  Shield,
  Upload,
  Trash2
} from 'lucide-react'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

// Custom Select Component
const CustomSelect = ({ options, value, onChange, placeholder, disabled, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex items-center justify-between ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer'
          }`}
        disabled={disabled}
      >
        <span>{selectedOption?.label || placeholder || 'Select option'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-4 py-2 text-left hover:bg-green-50 transition-colors ${value === option.value ? 'bg-green-50 text-green-600 font-medium' : 'text-gray-700'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Blood Group Options
const BLOOD_GROUPS = [
  { value: 'A+', label: 'A Positive (A+)' },
  { value: 'A-', label: 'A Negative (A-)' },
  { value: 'B+', label: 'B Positive (B+)' },
  { value: 'B-', label: 'B Negative (B-)' },
  { value: 'AB+', label: 'AB Positive (AB+)' },
  { value: 'AB-', label: 'AB Negative (AB-)' },
  { value: 'O+', label: 'O Positive (O+)' },
  { value: 'O-', label: 'O Negative (O-)' }
]

// Language Options
const LANGUAGE_OPTIONS = [
  { value: 'bangla', label: 'Bangla' },
  { value: 'english', label: 'English' }
]

// Relation Options
const RELATION_OPTIONS = [
  { value: 'Family', label: 'Family Member' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Parent', label: 'Parent' },
  { value: 'Sibling', label: 'Sibling' },
  { value: 'Friend', label: 'Friend' }
]

export default function ProfilePage() {
  const { user } = useAuth()  // 🔥 Use useAuth instead of useSession
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [activeTab, setActiveTab] = useState('personal')
  const fileInputRef = useRef(null)

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await patientAPI.getProfile()
      console.log('Profile response:', response)

      let userData = null
      let patientData = null

      if (response?.data?.success) {
        userData = response.data.data.user
        patientData = response.data.data.patient
      } else if (response?.success) {
        userData = response.data.user
        patientData = response.data.patient
      } else if (response?.data?.user) {
        userData = response.data.user
        patientData = response.data.patient
      }

      if (userData) {
        setProfileData({ user: userData, patient: patientData })
        reset({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
          bloodGroup: patientData?.bloodGroup || '',
          allergies: patientData?.allergies?.join(', ') || '',
          chronicDiseases: patientData?.chronicDiseases?.join(', ') || '',
          emergencyContactName: patientData?.emergencyContact?.name || '',
          emergencyContactPhone: patientData?.emergencyContact?.phone || '',
          emergencyContactRelation: patientData?.emergencyContact?.relation || 'Family',
          street: userData.address?.street || '',
          city: userData.address?.city || '',
          language: patientData?.preferences?.language || 'bangla',
          emailNotifications: patientData?.preferences?.notification?.email !== false,
          smsNotifications: patientData?.preferences?.notification?.sms !== false,
          pushNotifications: patientData?.preferences?.notification?.push !== false,
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      showToast.error('Failed to load profile')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast.error('Please select an image file')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Image size should be less than 2MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('ownerType', 'users')
      formData.append('ownerId', profileData?.user?._id || user?.id)
      formData.append('folder', 'profile-images')
      formData.append('tag', 'profile')

      // First upload to media endpoint
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      const uploadResult = await uploadResponse.json()

      if (uploadResult.success) {
        // Then update profile with image URL
        const updateResponse = await patientAPI.updateProfile({
          profileImage: {
            url: uploadResult.media.url,
            public_id: uploadResult.media.public_id
          }
        })

        if (updateResponse?.data?.success || updateResponse?.success) {
          showToast.success('Profile picture updated successfully')
          fetchProfile()
        }
      } else {
        showToast.error(uploadResult.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      showToast.error('Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Validate phone number format for Bangladesh
      const bdPhoneRegex = /^(?:\+88|88)?01[3-9]\d{8}$/

      // Build update data dynamically
      const updateData = {
        fullName: data.fullName,
        address: {
          street: data.street || '',
          city: data.city || '',
          country: 'Bangladesh'
        }
      }

      // Only add bloodGroup if selected
      if (data.bloodGroup) {
        updateData.bloodGroup = data.bloodGroup
      }

      // Only add allergies if has content
      const allergies = data.allergies?.split(',').map(item => item.trim()).filter(Boolean) || []
      if (allergies.length > 0) {
        updateData.allergies = allergies
      }

      // Only add chronicDiseases if has content
      const chronicDiseases = data.chronicDiseases?.split(',').map(item => item.trim()).filter(Boolean) || []
      if (chronicDiseases.length > 0) {
        updateData.chronicDiseases = chronicDiseases
      }

      // Only add emergencyContact if name and valid phone number
      if (data.emergencyContactName && data.emergencyContactName.trim().length >= 3) {
        // Format phone number to match Bangladesh format
        let phoneNumber = data.emergencyContactPhone || ''
        // Remove any non-digit characters
        phoneNumber = phoneNumber.replace(/\D/g, '')
        // Ensure it starts with 01 and has 11 digits
        if (phoneNumber.length === 11 && phoneNumber.startsWith('01')) {
          updateData.emergencyContact = {
            name: data.emergencyContactName.trim(),
            phone: phoneNumber,
            relation: data.emergencyContactRelation || 'Family'
          }
        } else if (phoneNumber.length === 13 && phoneNumber.startsWith('8801')) {
          // Handle 8801 format
          updateData.emergencyContact = {
            name: data.emergencyContactName.trim(),
            phone: phoneNumber,
            relation: data.emergencyContactRelation || 'Family'
          }
        }
        // If phone number is invalid, don't send it
      }

      // Add preferences
      updateData.preferences = {
        language: data.language || 'bangla',
        notification: {
          email: data.emailNotifications === true,
          sms: data.smsNotifications === true,
          push: data.pushNotifications === true
        }
      }

      console.log('Sending update data:', JSON.stringify(updateData, null, 2))

      const response = await patientAPI.updateProfile(updateData)

      if (response?.data?.success || response?.success) {
        showToast.success('Profile updated successfully')
        setIsEditing(false)
        fetchProfile()
      } else {
        showToast.error(response?.data?.message || response?.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile'
      showToast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'preferences', label: 'Preferences', icon: Bell }
  ]

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false)
                reset()
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-300 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-green-600 to-green-700"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
                  {profileData?.user?.profileImage?.url ? (
                    <img
                      src={profileData.user.profileImage.url}
                      alt={profileData?.user?.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-green-600" />
                  )}
                </div>
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-all cursor-pointer"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData?.user?.fullName}
              </h2>
              <p className="text-sm text-gray-500">
                Member since {new Date(profileData?.user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Verified Account
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-gray-200 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative cursor-pointer ${activeTab === tab.id
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
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'personal' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('fullName')}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                          }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('email')}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('phone')}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        {...register('dateOfBirth')}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                          }`}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        {...register('street')}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                          }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      {...register('city')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'medical' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CustomSelect
                      label="Blood Group"
                      options={BLOOD_GROUPS}
                      value={watch('bloodGroup')}
                      onChange={(val) => setValue('bloodGroup', val)}
                      disabled={!isEditing}
                      placeholder="Select Blood Group"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Name
                    </label>
                    <input
                      {...register('emergencyContactName')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact Phone
                    </label>
                    <input
                      {...register('emergencyContactPhone')}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Relation"
                      options={RELATION_OPTIONS}
                      value={watch('emergencyContactRelation')}
                      onChange={(val) => setValue('emergencyContactRelation', val)}
                      disabled={!isEditing}
                      placeholder="Select Relation"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma separated)
                    </label>
                    <textarea
                      {...register('allergies')}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      placeholder="e.g., Penicillin, Dust, Pollen"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chronic Diseases (comma separated)
                    </label>
                    <textarea
                      {...register('chronicDiseases')}
                      disabled={!isEditing}
                      rows={3}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${isEditing ? 'bg-white text-gray-900' : 'bg-gray-50 text-gray-500'
                        }`}
                      placeholder="e.g., Diabetes, Hypertension, Asthma"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CustomSelect
                      label="Preferred Language"
                      options={LANGUAGE_OPTIONS}
                      value={watch('language')}
                      onChange={(val) => setValue('language', val)}
                      disabled={!isEditing}
                      placeholder="Select Language"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('emailNotifications')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('smsNotifications')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('pushNotifications')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </label>
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