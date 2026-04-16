// app/(dashboard)/doctor/documents/page.jsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Upload, FileText, CheckCircle, AlertCircle, X,
  Camera, Shield, Award, Building, Phone, Mail, MapPin,
  Send
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorDocumentsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [doctor, setDoctor] = useState(null)
  const [documents, setDocuments] = useState({
    bmdcCertificate: null,
    nid: null,
    basicDegree: null,
    specializationCertificate: null,
    tradeLicense: null,
    profilePhoto: null,
    chamberPhoto: null
  })
  const [uploadStatus, setUploadStatus] = useState({})

  const requiredDocuments = [
    { key: 'bmdcCertificate', label: 'BMDC Certificate', required: true, accept: '.pdf,.jpg,.png' },
    { key: 'nid', label: 'National ID Card', required: true, accept: '.pdf,.jpg,.png' },
    { key: 'basicDegree', label: 'MBBS/BDS Certificate', required: true, accept: '.pdf,.jpg,.png' },
    { key: 'profilePhoto', label: 'Profile Photo', required: true, accept: '.jpg,.png' },
    { key: 'specializationCertificate', label: 'Specialization Certificate', required: false, accept: '.pdf,.jpg,.png' },
    { key: 'tradeLicense', label: 'Trade License', required: false, accept: '.pdf,.jpg,.png' },
    { key: 'chamberPhoto', label: 'Chamber Photo', required: false, accept: '.jpg,.png' }
  ]

  useEffect(() => {
    fetchDoctorProfile()
  }, [])

  const fetchDoctorProfile = async () => {
    try {
      const response = await doctorAPI.getProfile()
      
      let doctorData = null
      if (response?.data?.success) {
        doctorData = response.data.data.doctor
      } else if (response?.success) {
        doctorData = response.data.doctor
      }
      
      setDoctor(doctorData)
      
      // Check existing documents
      const existingDocs = doctorData?.documents || {}
      setUploadStatus(existingDocs)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const handleFileChange = (key, file) => {
    if (file) {
      setDocuments(prev => ({ ...prev, [key]: file }))
    }
  }

  const uploadDocument = async (key) => {
    const file = documents[key]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append(key, file)
      
      const response = await doctorAPI.uploadDocuments(formData)
      
      if (response?.success || response?.data?.success) {
        // Create a local URL for preview
        const localUrl = URL.createObjectURL(file)
        setUploadStatus(prev => ({ 
          ...prev, 
          [key]: { 
            verified: false, 
            url: localUrl,
            uploadedAt: new Date().toISOString()
          } 
        }))
        showToast.success(`${requiredDocuments.find(d => d.key === key)?.label} uploaded successfully`)
        setDocuments(prev => ({ ...prev, [key]: null }))
      } else {
        showToast.error(response?.message || `Failed to upload ${requiredDocuments.find(d => d.key === key)?.label}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast.error(`Failed to upload ${requiredDocuments.find(d => d.key === key)?.label}`)
    } finally {
      setIsLoading(false)
    }
  }

  const submitAllDocuments = async () => {
    // Check if all required documents are uploaded
    const missingDocs = requiredDocuments
      .filter(doc => doc.required && !uploadStatus[doc.key]?.url)
      .map(doc => doc.label)
    
    if (missingDocs.length > 0) {
      showToast.error(`Please upload: ${missingDocs.join(', ')}`)
      return
    }

    setIsLoading(true)
    try {
      const response = await doctorAPI.updateProfile({ 
        documentsSubmitted: true,
        verificationStatus: 'document_verification'
      })
      
      if (response?.success || response?.data?.success) {
        showToast.success('Documents submitted successfully! Waiting for verification.')
        setTimeout(() => router.push('/doctor'), 2000)
      } else {
        showToast.error(response?.message || 'Failed to submit documents')
      }
    } catch (error) {
      console.error('Submit error:', error)
      showToast.error('Failed to submit documents')
    } finally {
      setIsLoading(false)
    }
  }

  const getDocumentStatusIcon = (key) => {
    if (uploadStatus[key]?.verified) {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
    if (uploadStatus[key]?.url) {
      return <FileText className="w-5 h-5 text-yellow-500" />
    }
    return <Upload className="w-5 h-5 text-gray-400" />
  }

  // Check if all required documents are uploaded
  const allRequiredUploaded = requiredDocuments
    .filter(doc => doc.required)
    .every(doc => uploadStatus[doc.key]?.url)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Documents</h1>
        <p className="text-gray-500 mt-1">Upload required documents for BMDC verification</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Document Verification Process</h3>
            <p className="text-sm text-blue-700 mt-1">
              All documents will be verified by our admin team. Please ensure all documents are clear and valid.
              Verification usually takes 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredDocuments.map((doc) => (
          <motion.div
            key={doc.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{doc.label}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {doc.required ? 'Required' : 'Optional'} • {doc.accept}
                </p>
              </div>
              {getDocumentStatusIcon(doc.key)}
            </div>

            {uploadStatus[doc.key]?.url ? (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm">
                  {uploadStatus[doc.key]?.verified ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Verified ✓
                    </span>
                  ) : (
                    <span className="text-yellow-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Pending Verification
                    </span>
                  )}
                </div>
                {uploadStatus[doc.key]?.url && (
                  <a 
                    href={uploadStatus[doc.key].url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 hover:underline mt-1 inline-block"
                  >
                    View Document
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-3">
                <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all
                  ${documents[doc.key] ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'}`}
                >
                  <input
                    type="file"
                    accept={doc.accept}
                    onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                    className="hidden"
                  />
                  <div className="text-center">
                    {documents[doc.key] ? (
                      <>
                        <FileText className="w-8 h-8 text-green-500 mx-auto mb-1" />
                        <p className="text-sm text-green-600 font-medium">{documents[doc.key].name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(documents[doc.key].size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </div>
                </label>
                
                {documents[doc.key] && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setDocuments(prev => ({ ...prev, [doc.key]: null }))}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => uploadDocument(doc.key)}
                      disabled={isLoading}
                      className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      Upload
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Upload Progress</span>
          <span className="text-sm font-medium text-green-600">
            {requiredDocuments.filter(doc => doc.required && uploadStatus[doc.key]?.url).length} / {requiredDocuments.filter(doc => doc.required).length} Required
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(requiredDocuments.filter(doc => doc.required && uploadStatus[doc.key]?.url).length / requiredDocuments.filter(doc => doc.required).length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={submitAllDocuments}
          disabled={isLoading || !allRequiredUploaded}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 cursor-pointer ${
            allRequiredUploaded
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Documents for Verification
            </>
          )}
        </button>
      </div>

      {/* Info Box */}
      {!allRequiredUploaded && (
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
          <div className="flex items-center gap-2 text-sm text-yellow-700">
            <AlertCircle className="w-4 h-4" />
            <span>Please upload all required documents before submitting.</span>
          </div>
        </div>
      )}
    </div>
  )
}