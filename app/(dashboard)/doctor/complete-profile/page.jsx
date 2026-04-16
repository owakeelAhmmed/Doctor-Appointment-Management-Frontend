// app/(dashboard)/doctor/complete-profile/page.jsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/lib/hooks/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  DollarSign,
  Upload,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Camera,
  Shield,
  ArrowRight,
  ArrowLeft,
  Save,
  Building,
  MapPin,
  Phone,
  User,
  Stethoscope,
  Briefcase,
  GraduationCap,
  X
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

// Specializations List
const specializations = [
  { value: "", label: "Select Specialization" },
  { value: "Cardiology", label: "Cardiology" },
  { value: "Neurology", label: "Neurology" },
  { value: "Dermatology", label: "Dermatology" },
  { value: "Pediatrics", label: "Pediatrics" },
  { value: "Orthopedics", label: "Orthopedics" },
  { value: "Gynecology & Obstetrics", label: "Gynecology & Obstetrics" },
  { value: "Ophthalmology", label: "Ophthalmology" },
  { value: "ENT", label: "Ear, Nose & Throat (ENT)" },
  { value: "Dentistry", label: "Dentistry" },
  { value: "Psychiatry", label: "Psychiatry" },
  { value: "General Medicine", label: "General Medicine" },
  { value: "Gastroenterology", label: "Gastroenterology" },
  { value: "Nephrology", label: "Nephrology" },
  { value: "Urology", label: "Urology" },
  { value: "Radiology", label: "Radiology" }
]

// Cities in Bangladesh
const cities = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", 
  "Barisal", "Rangpur", "Mymensingh", "Comilla", "Narayanganj"
]

export default function CompleteDoctorProfile() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [activeSection, setActiveSection] = useState('professional')
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [formData, setFormData] = useState({
    specialization: '',
    experienceYears: '',
    consultationFee: '',
    workplaceName: '',
    workplaceCity: '',
    workplaceAddress: '',
    workplacePhone: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    checkProfileStatus()
  }, [])

  const checkProfileStatus = async () => {
    setIsFetching(true)
    try {
      const response = await doctorAPI.getProfile()
      
      let doctorData = null
      if (response?.data?.success) {
        doctorData = response.data.data.doctor
      } else if (response?.success) {
        doctorData = response.data.doctor
      }
      
      const status = doctorData?.verificationStatus
      setVerificationStatus(status)

      // 🔥 DEBUG: Console log to see the status
      console.log('Doctor verification status:', status)

      // Pre-fill form if data exists
      if (doctorData) {
        setFormData({
          specialization: doctorData.specialization || '',
          experienceYears: doctorData.experienceYears || '',
          consultationFee: doctorData.consultationFee || '',
          workplaceName: doctorData.currentWorkplace?.name || '',
          workplaceCity: doctorData.currentWorkplace?.city || '',
          workplaceAddress: doctorData.currentWorkplace?.address || '',
          workplacePhone: doctorData.currentWorkplace?.contactNumber || ''
        })
      }

      // 🔥 FIXED: Proper redirect logic
      // Only redirect if we're NOT supposed to be on this page
      
      if (status === 'verified') {
        // Already verified - redirect to dashboard
        console.log('Doctor verified, redirecting to dashboard')
        router.replace('/doctor')
        return
      } 
      else if (status === 'profile_submitted') {
        // Profile submitted but waiting for documents
        console.log('Profile submitted, redirecting to documents')
        router.replace('/doctor/documents')
        return
      }
      else if (status === 'document_verification' || status === 'under_review') {
        // Under review - redirect to pending page
        console.log('Under review, redirecting to verification pending')
        router.replace('/doctor/verification-pending')
        return
      }
      else if (status === 'rejected') {
        // Show rejected message
        console.log('Application rejected')
        // Stay on page or show rejection message
      }
      else {
        // status === 'pending' - stay on this page to complete profile
        console.log('Profile pending, staying on complete-profile page')
      }
      
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.specialization) newErrors.specialization = 'Specialization is required'
    if (!formData.experienceYears) newErrors.experienceYears = 'Experience is required'
    if (formData.experienceYears < 0) newErrors.experienceYears = 'Experience cannot be negative'
    if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required'
    if (formData.consultationFee < 0) newErrors.consultationFee = 'Fee cannot be negative'
    if (!formData.workplaceName) newErrors.workplaceName = 'Workplace name is required'
    if (!formData.workplaceCity) newErrors.workplaceCity = 'City is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast.error('Please fill all required fields')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        specialization: formData.specialization,
        experienceYears: parseInt(formData.experienceYears),
        consultationFee: parseInt(formData.consultationFee),
        consultationTypes: ["in-person", "video"],
        currentWorkplace: {
          name: formData.workplaceName,
          city: formData.workplaceCity,
          address: formData.workplaceAddress || "",
          contactNumber: formData.workplacePhone || "",
          isPrimary: true
        }
      }

      console.log('Submitting profile:', payload)

      const response = await doctorAPI.updateProfile(payload)
      
      console.log('Update profile response:', response)
      
      if (response?.data?.success || response?.success) {
        showToast.success("Professional info saved successfully!", {
          description: "Now please upload your documents."
        })
        // Redirect to documents page after successful submission
        router.push('/doctor/documents')
      } else {
        showToast.error(response?.data?.message || response?.message || "Failed to save profile")
      }
    } catch (error) {
      console.error('Error:', error)
      showToast.error(error.response?.data?.message || "Failed to save profile")
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { id: "professional", label: "Professional Info", icon: Award },
    { id: "workplace", label: "Workplace Info", icon: Building }
  ]

  // Show loading state
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // If already verified, don't render the form (will redirect anyway)
  if (verificationStatus === 'verified') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Already Verified!</h2>
          <p className="text-gray-500 mb-4">Your profile is already verified.</p>
          <button
            onClick={() => router.push('/doctor')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // If profile already submitted
  if (verificationStatus === 'profile_submitted') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Upload className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Submitted!</h2>
          <p className="text-gray-500 mb-4">Please upload your documents to continue.</p>
          <button
            onClick={() => router.push('/doctor/documents')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Upload Documents
          </button>
        </div>
      </div>
    )
  }

  // If under review
  if (verificationStatus === 'document_verification' || verificationStatus === 'under_review') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Under Review</h2>
          <p className="text-gray-500 mb-4">Your application is being reviewed by our admin team.</p>
          <p className="text-sm text-gray-400">You will receive an email once verified.</p>
        </div>
      </div>
    )
  }

  // Main form - only for 'pending' status
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
            <Award className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Complete Your Doctor Profile
          </h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Please provide your professional and workplace information for verification
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {sections.map((section, idx) => (
            <div key={section.id} className="flex items-center">
              <button
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${activeSection === section.id
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white text-gray-600 border border-gray-300 hover:border-green-300 hover:text-green-600"}
                `}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
              {idx < sections.length - 1 && (
                <div className="w-8 h-px bg-gray-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Professional Information Section */}
        <AnimatePresence mode="wait">
          {activeSection === "professional" && (
            <motion.div
              key="professional"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden"
            >
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  Professional Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tell us about your medical expertise and practice
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Specialization */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.specialization
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                    }`}
                  >
                    {specializations.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.specialization && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.specialization}
                    </p>
                  )}
                </div>

                {/* Experience Years */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="experienceYears"
                      placeholder="e.g., 5"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.experienceYears
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                      }`}
                    />
                  </div>
                  {errors.experienceYears && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.experienceYears}
                    </p>
                  )}
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Consultation Fee (BDT) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="consultationFee"
                      placeholder="e.g., 1000"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.consultationFee
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                      }`}
                    />
                  </div>
                  {errors.consultationFee && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.consultationFee}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    Recommended: 800 - 3000 BDT based on specialization
                  </p>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveSection("workplace")}
                  className="w-full px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Next: Workplace Info
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Workplace Information Section */}
          {activeSection === "workplace" && (
            <motion.div
              key="workplace"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-300 overflow-hidden"
            >
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-white">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-600" />
                  Workplace Information
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tell us about your current workplace
                </p>
              </div>

              <div className="p-6 space-y-5">
                {/* Workplace Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Workplace/Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="workplaceName"
                      placeholder="e.g., Dhaka Medical College Hospital"
                      value={formData.workplaceName}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.workplaceName
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                      }`}
                    />
                  </div>
                  {errors.workplaceName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.workplaceName}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      name="workplaceCity"
                      value={formData.workplaceCity}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                        errors.workplaceCity
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-100'
                      }`}
                    >
                      <option value="">Select City</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  {errors.workplaceCity && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.workplaceCity}
                    </p>
                  )}
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      name="workplaceAddress"
                      placeholder="e.g., House #12, Road #5, Dhanmondi"
                      value={formData.workplaceAddress}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contact Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="workplacePhone"
                      placeholder="e.g., 02-1234567"
                      value={formData.workplacePhone}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={() => setActiveSection("professional")}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save & Continue
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-800">Next Steps</h3>
              <p className="text-xs text-blue-700 mt-1">
                After submitting your profile, you will need to upload verification documents.
                Our admin team will review your application within 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}