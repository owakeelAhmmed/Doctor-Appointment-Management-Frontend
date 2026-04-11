// app/doctor/profile/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
  Calendar
} from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [activeTab, setActiveTab] = useState('personal')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await doctorAPI.getProfile()
      if (response.success) {
        setProfileData(response.data)
        reset({
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          specialization: response.data.doctor.specialization,
          experienceYears: response.data.doctor.experienceYears,
          consultationFee: response.data.doctor.consultationFee,
          bankName: response.data.doctor.bankInfo?.bankName,
          accountNumber: response.data.doctor.bankInfo?.accountNumber,
          accountHolderName: response.data.doctor.bankInfo?.accountHolderName,
          bkashNumber: response.data.doctor.mobileBanking?.bKash,
          nagadNumber: response.data.doctor.mobileBanking?.nagad
        })
      }
    } catch (error) {
      showToast.error('Failed to load profile')
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.updateProfile({
        specialization: data.specialization,
        experienceYears: data.experienceYears,
        consultationFee: data.consultationFee,
        bankInfo: {
          bankName: data.bankName,
          accountNumber: data.accountNumber,
          accountHolderName: data.accountHolderName
        },
        mobileBanking: {
          bKash: data.bkashNumber,
          nagad: data.nagadNumber
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
    { id: 'professional', label: 'Professional', icon: Award },
    { id: 'banking', label: 'Banking Info', icon: DollarSign }
  ]

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { user, doctor } = profileData

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
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false)
                reset()
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Cancel
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
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                Dr. {user.fullName}
              </h2>
              <p className="text-gray-500">{doctor.specialization || 'Not specified'}</p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm">
                {doctor.verificationStatus === 'verified' ? 'Verified' : 
                 doctor.verificationStatus === 'pending' ? 'Pending Verification' :
                 'Under Review'}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
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
              <p className="text-2xl font-bold text-gray-900">৳{doctor.consultationFee || 0}</p>
              <p className="text-xs text-gray-500">Consultation Fee</p>
            </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      {...register('fullName')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      {...register('email')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      {...register('phone')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">BMDC Reg No</label>
                    <input
                      value={doctor.bmdcRegNo}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
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
                    <input
                      {...register('specialization')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      {...register('experienceYears')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (BDT)</label>
                    <input
                      type="number"
                      {...register('consultationFee')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {/* Qualifications Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                  <div className="space-y-2">
                    {doctor.qualifications?.map((q, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{q.degree}</p>
                        <p className="text-sm text-gray-500">{q.institute} ({q.year})</p>
                      </div>
                    ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      {...register('bankName')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      {...register('accountNumber')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      {...register('accountHolderName')}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-3">Mobile Banking</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">bKash Number</label>
                      <input
                        {...register('bkashNumber')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Number</label>
                      <input
                        {...register('nagadNumber')}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-gray-50"
                      />
                    </div>
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