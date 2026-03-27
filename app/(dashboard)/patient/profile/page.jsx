'use client'

import { useState, useEffect } from 'react'
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
  ChevronRight
} from 'lucide-react'
import Button from '@/app/components/ui/Button'
import Input from '@/app/components/ui/Input'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [activeTab, setActiveTab] = useState('personal') // personal, medical, preferences

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await patientAPI.getProfile()
      if (response.success) {
        setProfileData(response.data)
        reset({
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          bloodGroup: response.data.patient?.bloodGroup,
          allergies: response.data.patient?.allergies?.join(', '),
          chronicDiseases: response.data.patient?.chronicDiseases?.join(', '),
          emergencyContact: response.data.patient?.emergencyContact?.name,
          emergencyPhone: response.data.patient?.emergencyContact?.phone,
          address: response.data.user.address?.street,
          city: response.data.user.address?.city,
          ...response.data.patient?.preferences
        })
      }
    } catch (error) {
      showToast.error('Failed to load profile')
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await patientAPI.updateProfile({
        fullName: data.fullName,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies?.split(',').map(item => item.trim()),
        chronicDiseases: data.chronicDiseases?.split(',').map(item => item.trim()),
        emergencyContact: {
          name: data.emergencyContact,
          phone: data.emergencyPhone
        },
        address: {
          street: data.address,
          city: data.city
        },
        preferences: {
          language: data.language,
          notification: {
            email: data.emailNotifications,
            sms: data.smsNotifications
          }
        }
      })

      if (response.success) {
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

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'preferences', label: 'Preferences', icon: AlertCircle }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
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
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-primary-600 to-purple-600"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full p-1">
                <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                  {profileData?.user?.profileImage ? (
                    <img
                      src={profileData.user.profileImage}
                      alt={profileData?.user?.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-primary-600" />
                  )}
                </div>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {profileData?.user?.fullName}
              </h2>
              <p className="text-gray-500">Patient ID: {profileData?.user?.id}</p>
            </div>
            {!isEditing && (
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-green-100 text-green-600 rounded-lg">
                  Verified Account
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
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
                  <Input
                    label="Full Name"
                    icon={<User className="w-4 h-4" />}
                    {...register('fullName')}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Email"
                    type="email"
                    icon={<Mail className="w-4 h-4" />}
                    {...register('email')}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Phone"
                    icon={<Phone className="w-4 h-4" />}
                    {...register('phone')}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    icon={<Calendar className="w-4 h-4" />}
                    {...register('dateOfBirth')}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Address"
                    icon={<MapPin className="w-4 h-4" />}
                    {...register('address')}
                    disabled={!isEditing}
                    className="md:col-span-2"
                  />
                  <Input
                    label="City"
                    {...register('city')}
                    disabled={!isEditing}
                  />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      {...register('bloodGroup')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Emergency Contact Name"
                    icon={<User className="w-4 h-4" />}
                    {...register('emergencyContact')}
                    disabled={!isEditing}
                  />

                  <Input
                    label="Emergency Contact Phone"
                    icon={<Phone className="w-4 h-4" />}
                    {...register('emergencyPhone')}
                    disabled={!isEditing}
                  />

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergies (comma separated)
                    </label>
                    <textarea
                      {...register('allergies')}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language
                    </label>
                    <select
                      {...register('language')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                    >
                      <option value="bangla">Bangla</option>
                      <option value="english">English</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('emailNotifications')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Email Notifications</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('smsNotifications')}
                        disabled={!isEditing}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm text-gray-700">SMS Notifications</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {isEditing && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}