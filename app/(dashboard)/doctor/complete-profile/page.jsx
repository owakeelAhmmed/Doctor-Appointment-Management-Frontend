// app/doctor/complete-profile/page.jsx (Black & White with Green Theme)

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Award, DollarSign, Upload, FileText, 
  CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  GraduationCap, Building, Clock, Camera, Shield,
  ArrowRight, ArrowLeft, Save
} from 'lucide-react'
import Button from '@/app/components/ui/Button'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'
import { useAuth } from '@/app/lib/hooks/useAuth'

// Custom Dropdown Component
const CustomSelect = ({ options, value, onChange, placeholder, error, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} <span className="text-green-600">*</span>
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2.5 text-left bg-white border rounded-xl 
          flex items-center justify-between transition-all duration-200 cursor-pointer
          ${error 
            ? 'border-red-300 focus:ring-red-200' 
            : 'border-gray-200 hover:border-green-400 focus:border-green-500'
          }
          focus:outline-none focus:ring-2 focus:ring-green-100
        `}
      >
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors cursor-pointer
                  ${value === option.value 
                    ? 'bg-green-50 text-green-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// File Upload Component
const FileUpload = ({ label, accept, register, error, required }) => {
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setPreview(reader.result)
        reader.readAsDataURL(file)
      }
    } else {
      setFileName('')
      setPreview(null)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-green-600">*</span>}
      </label>
      <div className="relative">
        <input
          type="file"
          accept={accept}
          {...register}
          onChange={handleFileChange}
          className="hidden"
          id={`file-${label.replace(/\s/g, '')}`}
        />
        <label
          htmlFor={`file-${label.replace(/\s/g, '')}`}
          className={`
            flex items-center justify-between w-full px-4 py-2.5 
            border rounded-xl cursor-pointer transition-all duration-200
            ${error 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {fileName || `Click to upload ${label.toLowerCase()}`}
            </span>
          </div>
          <Camera className="w-4 h-4 text-gray-400" />
        </label>
      </div>
      
      {preview && (
        <div className="mt-2">
          <img src={preview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// Specializations List
const specializations = [
  { value: '', label: 'Select Specialization' },
  { value: 'Cardiology', label: 'Cardiology' },
  { value: 'Neurology', label: 'Neurology' },
  { value: 'Dermatology', label: 'Dermatology' },
  { value: 'Pediatrics', label: 'Pediatrics' },
  { value: 'Orthopedics', label: 'Orthopedics' },
  { value: 'Gynecology', label: 'Gynecology & Obstetrics' },
  { value: 'Ophthalmology', label: 'Ophthalmology' },
  { value: 'ENT', label: 'Ear, Nose & Throat (ENT)' },
  { value: 'Dentistry', label: 'Dentistry' },
  { value: 'Psychiatry', label: 'Psychiatry' },
  { value: 'General Medicine', label: 'General Medicine' },
  { value: 'Gastroenterology', label: 'Gastroenterology' },
  { value: 'Nephrology', label: 'Nephrology' },
  { value: 'Urology', label: 'Urology' },
  { value: 'Radiology', label: 'Radiology' }
]

export default function CompleteDoctorProfile() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [existingProfile, setExistingProfile] = useState(null)
  const [activeSection, setActiveSection] = useState('professional')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm()

  useEffect(() => {
    checkProfileStatus()
  }, [])

  const checkProfileStatus = async () => {
    setIsFetching(true)
    try {
      const response = await doctorAPI.getProfile()
      const doctorProfile = response.data?.doctor
      setExistingProfile(doctorProfile)
      
      if (doctorProfile?.specialization) setValue('specialization', doctorProfile.specialization)
      if (doctorProfile?.experienceYears) setValue('experienceYears', doctorProfile.experienceYears)
      if (doctorProfile?.consultationFee) setValue('consultationFee', doctorProfile.consultationFee)
      
      if (doctorProfile?.verificationStatus === 'profile_submitted') {
        router.push('/doctor/documents')
      }
      if (doctorProfile?.verificationStatus === 'verified') {
        router.push('/doctor/dashboard')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
    } finally {
      setIsFetching(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      const payload = {
        specialization: data.specialization,
        experienceYears: parseInt(data.experienceYears),
        consultationFee: parseInt(data.consultationFee),
        consultationTypes: ['in-person', 'video'],
        verificationStatus: 'profile_submitted'
      }
      
      const response = await doctorAPI.updateProfile(payload)
      
      if (response.success) {
        showToast.success('Profile completed successfully!', {
          description: 'Please upload your verification documents.'
        })
        setTimeout(() => {
          router.push('/doctor/documents')
        }, 2000)
      }
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { id: 'professional', label: 'Professional Info', icon: Award },
    { id: 'documents', label: 'Verification Documents', icon: Shield }
  ]

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

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
            Please provide your professional information for verification
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
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600'
                  }
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Professional Information Section */}
          <AnimatePresence mode="wait">
            {activeSection === 'professional' && (
              <motion.div
                key="professional"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
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
                  <CustomSelect
                    label="Specialization"
                    options={specializations}
                    value={watch('specialization')}
                    onChange={(value) => setValue('specialization', value, { shouldValidate: true })}
                    placeholder="Select your medical specialization"
                    error={errors.specialization?.message}
                  />

                  {/* Experience Years */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Years of Experience <span className="text-green-600">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="e.g., 5"
                        {...register('experienceYears', { 
                          required: 'Experience is required', 
                          min: { value: 0, message: 'Invalid years' },
                          max: { value: 70, message: 'Invalid years' }
                        })}
                        className={`
                          w-full pl-9 pr-4 py-2.5 border rounded-xl 
                          focus:outline-none focus:ring-2 transition-all
                          ${errors.experienceYears 
                            ? 'border-red-300 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                          }
                        `}
                      />
                    </div>
                    {errors.experienceYears && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.experienceYears.message}
                      </p>
                    )}
                  </div>

                  {/* Consultation Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Consultation Fee (BDT) <span className="text-green-600">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="e.g., 1000"
                        {...register('consultationFee', { 
                          required: 'Consultation fee is required', 
                          min: { value: 0, message: 'Fee must be positive' }
                        })}
                        className={`
                          w-full pl-9 pr-4 py-2.5 border rounded-xl 
                          focus:outline-none focus:ring-2 transition-all
                          ${errors.consultationFee 
                            ? 'border-red-300 focus:ring-red-200' 
                            : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                          }
                        `}
                      />
                    </div>
                    {errors.consultationFee && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.consultationFee.message}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      Recommended: 800 - 3000 BDT based on specialization
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b bg-gradient-to-r from-green-50 to-white">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    Verification Documents
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload required documents for BMDC verification
                  </p>
                </div>
                
                <div className="p-6 space-y-5">
                  {/* Info Banner */}
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-green-800 text-sm">Document Requirements</h3>
                        <p className="text-xs text-green-700 mt-1">
                          Please upload clear, high-quality scans or photos of your documents.
                          Accepted formats: PDF, JPG, PNG (Max 5MB per file)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BMDC Certificate */}
                  <FileUpload
                    label="BMDC Certificate"
                    accept=".pdf,.jpg,.png"
                    register={register('bmdcCertificate', { required: 'BMDC certificate is required' })}
                    error={errors.bmdcCertificate?.message}
                    required={true}
                  />

                  {/* NID Card */}
                  <FileUpload
                    label="National ID Card"
                    accept=".pdf,.jpg,.png"
                    register={register('nid', { required: 'NID is required' })}
                    error={errors.nid?.message}
                    required={true}
                  />

                  {/* MBBS Certificate */}
                  <FileUpload
                    label="MBBS/BDS Certificate"
                    accept=".pdf,.jpg,.png"
                    register={register('mbbsCertificate', { required: 'MBBS certificate is required' })}
                    error={errors.mbbsCertificate?.message}
                    required={true}
                  />

                  {/* Profile Photo */}
                  <FileUpload
                    label="Profile Photo"
                    accept="image/*"
                    register={register('profilePhoto', { required: 'Profile photo is required' })}
                    error={errors.profilePhoto?.message}
                    required={true}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {activeSection !== 'professional' && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setActiveSection('professional')}
                className="flex-1 border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-600 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 inline mr-2" />
                Previous
              </Button>
            )}
            
            {activeSection !== 'documents' ? (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => setActiveSection('documents')}
                className="flex-1 bg-green-600 hover:bg-green-700 cursor-pointer"
              >
                Next: Upload Documents
                <ArrowRight className="w-4 h-4 inline ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 cursor-pointer"
              >
                <Save className="w-4 h-4 inline mr-2" />
                {isLoading ? 'Submitting...' : 'Submit Profile for Verification'}
              </Button>
            )}
          </div>
        </form>

        {/* Info Card */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Next Steps</h3>
              <p className="text-xs text-gray-600 mt-1">
                After submitting your profile, you will need to upload verification documents.
                Our admin team will review your application within 24-48 hours.
                You will receive an email notification once your account is verified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}