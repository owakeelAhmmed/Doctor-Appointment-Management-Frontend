// app/(public)/doctors/[id]/page.jsx

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/app/lib/hooks/useAuth'
import {
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  Calendar as CalendarIcon,
  Award,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Users,
  MessageCircle,
  ChevronLeft,
  X,
  Building,
  Stethoscope,
  UserCheck,
  Shield,
  ChevronRight
} from 'lucide-react'
import { publicAPI, paymentAPI } from '@/app/lib/api/client'

const showToast = {
  error: (message) => {
    console.error('Error:', message)
    alert(message)
  },
  success: (message) => {
    console.log('Success:', message)
    alert(message)
  }
}

// Helper function to format dates
const formatDate = (date, type = 'full') => {
  if (type === 'full') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  if (type === 'short') {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  if (type === 'monthDay') {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }
  return date.toLocaleDateString()
}

export default function DoctorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [selectedType, setSelectedType] = useState('video')
  const [symptoms, setSymptoms] = useState('')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchDoctorDetails()
  }, [params.id])

  useEffect(() => {
    if (doctor && selectedDate) {
      fetchAvailableSlots()
    }
  }, [doctor, selectedDate])

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true)
      const response = await publicAPI.getDoctorDetails(params.id)
      
      let doctorData = null
      if (response?.data?.success) {
        doctorData = response.data.data
      } else if (response?.success) {
        doctorData = response.data
      } else if (response?.data) {
        doctorData = response.data
      }
      
      if (doctorData) {
        // 🔥 ডক্টর আইডি চেক করুন
        console.log('Doctor ID from API:', doctorData._id)
        console.log('Doctor user ID:', doctorData.user?._id)
        setDoctor(doctorData)
      } else {
        showToast.error('Failed to load doctor details')
      }
    } catch (error) {
      console.error('Error fetching doctor:', error)
      showToast.error(error?.message || 'Failed to load doctor details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await publicAPI.getDoctorSlots(params.id, dateStr)
      
      let slots = []
      if (response?.data?.success) {
        slots = response.data.data.slots || []
      } else if (response?.success) {
        slots = response.data.slots || []
      } else if (response?.data?.slots) {
        slots = response.data.slots
      }
      
      const formattedSlots = slots.map(slot => ({
        time: slot.time || slot.startTime,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type,
        maxPatients: slot.maxPatients
      }))
      
      setAvailableSlots(formattedSlots)
    } catch (error) {
      console.error('Error fetching slots:', error)
      setAvailableSlots([])
    }
  }
  
  // 🔥 বুকিং হ্যান্ডলার - সঠিক ডক্টর আইডি সহ
  const handleBooking = async () => {
    // চেক করুন ইউজার লগইন করেছে কিনা
    if (!isAuthenticated) {
      const currentUrl = `/doctors/${params.id}`
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    // চেক করুন ইউজার পেশেন্ট কিনা
    if (user?.role !== 'patient') {
      alert('Only patients can book appointments')
      return
    }

    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }

    setBookingLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      // 🔥 গুরুত্বপূর্ণ: doctor._id ব্যবহার করুন, doctor.user?._id না
      // ডাটাবেসে doctorId ফিল্ডে ইউজার আইডি স্টোর হয়
      const doctorUserId = doctor.user?._id || doctor._id
      console.log('Using doctor ID for booking:', doctorUserId)
      
      const appointmentData = {
        doctorId: doctorUserId,  // 🔥 এটা সঠিক হতে হবে
        appointmentDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedSlot.time,
        symptoms: symptoms,
        type: selectedType,
        paymentMethod: 'card',
        fee: doctor.consultationFee
      }
      
      console.log('Booking appointment:', appointmentData)
      
      const appointmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/v1/appointments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      })

      const appointmentResult = await appointmentResponse.json()
      console.log('Appointment response:', appointmentResult)
      
      if (appointmentResult.success) {
        const appointmentId = appointmentResult.data.appointment._id
        
        const paymentResponse = await paymentAPI.initiateSSLCommerzPayment({
          appointmentId,
          paymentMethod: 'card'
        })
        
        if (paymentResponse.data.success && paymentResponse.data.data.redirectURL) {
          setShowBookingModal(false)
          window.location.href = paymentResponse.data.data.redirectURL
        } else {
          alert(paymentResponse.data.message || 'Payment initiation failed')
        }
      } else {
        alert(appointmentResult.message || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert(error.message || 'Failed to book appointment')
    } finally {
      setBookingLoading(false)
    }
  }

  const openBookingModal = () => {
    if (!isAuthenticated) {
      const currentUrl = `/doctors/${params.id}`
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }
    
    if (user?.role !== 'patient') {
      alert('Only patients can book appointments')
      return
    }
    
    setShowBookingModal(true)
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= (rating || 0)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-300 p-12">
            <Stethoscope className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor not found</h2>
            <p className="text-gray-500 mb-6">The doctor you're looking for doesn't exist or is not verified.</p>
            <Link href="/doctors" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <ChevronLeft className="w-4 h-4" />
              Back to Doctors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/doctors" className="text-green-100 hover:text-white inline-flex items-center gap-2 mb-6 transition">
            <ChevronLeft className="w-4 h-4" />
            Back to Doctors
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Profile Section */}
            <div className="flex items-start gap-5 flex-1">
              <div className="relative">
                <div className="w-28 h-28 lg:w-36 lg:h-36 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                  {doctor.user?.profileImage ? (
                    <Image
                      src={doctor.user.profileImage}
                      alt={doctor.user.fullName}
                      width={144}
                      height={144}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-5xl text-white font-bold">
                      {doctor.user?.fullName?.charAt(0) || 'D'}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 shadow-md">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Dr. {doctor.user?.fullName}
                  </h1>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white">BMDC Verified</span>
                </div>
                <p className="text-green-100 text-base lg:text-lg mb-3">{doctor.specialization}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-green-100">
                  <div className="flex items-center gap-1.5">
                    {renderStars(doctor.rating)}
                    <span className="text-sm">({doctor.totalReviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{doctor.totalPatients || 0}+ patients</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">{doctor.experienceYears || 0}+ years exp</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fee Card */}
            <div className="bg-white rounded-2xl p-5 text-center min-w-[200px] shadow-lg border border-gray-300">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-3xl font-bold text-gray-900">৳{doctor.consultationFee || 0}</p>
              <p className="text-xs text-gray-400 mt-1">Follow-up: ৳{doctor.followUpFee || 0}</p>
              <button
                onClick={openBookingModal}
                className="mt-4 w-full px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-2xl border border-gray-300 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-green-600" />
                About
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {doctor.user?.bio || `Dr. ${doctor.user?.fullName} is a renowned ${doctor.specialization} specialist with over ${doctor.experienceYears} years of experience. Dedicated to providing quality healthcare with compassion and expertise.`}
              </p>
            </div>
            
            {/* Qualifications Card */}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                  Qualifications & Education
                </h2>
                <div className="space-y-4">
                  {doctor.qualifications.map((qual, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{qual.degree}</p>
                        <p className="text-sm text-gray-500">
                          {qual.institute}, {qual.country} ({qual.year})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Workplace Card */}
            {doctor.currentWorkplace && (
              <div className="bg-white rounded-2xl border border-gray-300 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-green-600" />
                  Current Workplace
                </h2>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 text-lg">{doctor.currentWorkplace.name}</p>
                  {doctor.currentWorkplace.address && (
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {doctor.currentWorkplace.address}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm">{doctor.currentWorkplace.city}</p>
                  {doctor.currentWorkplace.contactNumber && (
                    <p className="text-gray-500 text-sm">📞 {doctor.currentWorkplace.contactNumber}</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Reviews Card */}
            {doctor.reviews && doctor.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    Patient Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(doctor.rating)}
                      <span className="text-sm font-medium text-gray-900 ml-1">{doctor.rating}/5</span>
                    </div>
                    <span className="text-sm text-gray-500">({doctor.totalReviews} reviews)</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {doctor.reviews.slice(0, 3).map((review) => (
                    <div key={review._id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {review.patient?.user?.profileImage ? (
                            <Image
                              src={review.patient.user.profileImage}
                              alt={review.patient.user.fullName}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <UserCheck className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.patient?.user?.fullName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {formatDate(new Date(review.createdAt), 'short')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
                {doctor.totalReviews > 3 && (
                  <button className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                    View all {doctor.totalReviews} reviews
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar - Schedule Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-300 p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                Available Schedule
              </h2>
              
              {/* Date Picker */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
              
              {/* Time Slots */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Available Time Slots
                  {availableSlots.length > 0 && (
                    <span className="ml-2 text-xs text-green-600">({availableSlots.length} slots)</span>
                  )}
                </p>
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2.5 text-sm rounded-xl border transition-all cursor-pointer ${
                          selectedSlot?.time === slot.time
                            ? 'bg-green-600 text-white border-green-600 shadow-md'
                            : 'border-gray-300 text-gray-700 hover:border-green-400 hover:bg-green-50'
                        }`}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-300">
                    <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm text-gray-500">No available slots</p>
                    <p className="text-xs text-gray-400 mt-1">Please select another date</p>
                  </div>
                )}
              </div>
              
              {/* Consultation Type */}
              {doctor.consultationTypes && doctor.consultationTypes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Consultation Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {doctor.consultationTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`p-2.5 text-sm rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer ${
                          selectedType === type
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-gray-300 text-gray-700 hover:border-green-400'
                        }`}
                      >
                        {type === 'video' && <Video className="w-4 h-4" />}
                        {type === 'phone' && <Phone className="w-4 h-4" />}
                        {type === 'in-person' && <Building className="w-4 h-4" />}
                        {type === 'video' ? 'Video' : type === 'phone' ? 'Phone' : 'In-Person'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Verified Doctor</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    This doctor is BMDC verified and has completed all verification processes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Steps */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-medium ${
                      bookingStep >= step ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <p className="text-xs text-gray-500">
                      {step === 1 ? 'Slot' : step === 2 ? 'Details' : 'Confirm'}
                    </p>
                  </div>
                ))}
              </div>
              
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Date
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedDate, 'full')}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2 text-sm rounded-xl border transition cursor-pointer ${
                            selectedSlot?.time === slot.time
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {formatTime(slot.time)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!selectedSlot}
                    className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              )}
              
              {bookingStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Consultation Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {doctor.consultationTypes?.map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-2 text-sm rounded-xl border transition cursor-pointer ${
                            selectedType === type
                              ? 'bg-green-600 text-white border-green-600'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {type === 'video' ? 'Video Call' : type === 'phone' ? 'Phone Call' : 'In-Person'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms / Reason
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                      placeholder="Please describe your symptoms..."
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Doctor:</span>
                        <span className="text-gray-900">Dr. {doctor.user?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900">{formatDate(selectedDate, 'short')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Time:</span>
                        <span className="text-gray-900">{selectedSlot?.time}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-gray-500">Fee:</span>
                        <span className="font-medium text-gray-900">৳{doctor.consultationFee}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setBookingStep(3)}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                </div>
              )}
              
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirm Appointment</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctor.user?.fullName}</p>
                        <p className="text-xs text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(selectedDate, 'full')}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{formatTime(selectedSlot?.time)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedType === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                        {selectedType === 'phone' && <Phone className="w-4 h-4 text-gray-400" />}
                        {selectedType === 'in-person' && <MapPin className="w-4 h-4 text-gray-400" />}
                        <span className="capitalize">{selectedType} Consultation</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                    <p className="font-medium mb-1">Payment</p>
                    <p>Total amount: ৳{doctor.consultationFee}</p>
                    <p className="text-xs mt-1">You will be redirected to SSLCommerz secure payment gateway</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(2)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm & Pay'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}