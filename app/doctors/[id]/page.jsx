'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Star,
  MapPin,
  Clock,
  Video,
  Phone,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Users,
  MessageCircle,
  ChevronLeft,
  X,
  Building,
  CreditCard,
  Smartphone
} from 'lucide-react'

export default function DoctorDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
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
    const response = await publicAPI.getDoctorDetails(params.id)
    if (response.data.success) {
      setDoctor(response.data.data)
    }
  } catch (error) {
    console.error('Error fetching doctor:', error)
    showToast.error('Failed to load doctor details')
  } finally {
    setLoading(false)
  }
}

const fetchAvailableSlots = async () => {
  try {
    const dateStr = selectedDate.toISOString().split('T')[0]
    const response = await publicAPI.getDoctorSlots(params.id, dateStr)
    if (response.data.success) {
      setAvailableSlots(response.data.data.slots)
    }
  } catch (error) {
    console.error('Error fetching slots:', error)
  }
}

  const handleBooking = async () => {
    if (!session) {
      router.push('/login')
      return
    }

    if (session.user.role !== 'patient') {
      alert('Only patients can book appointments')
      return
    }

    if (!selectedSlot) {
      alert('Please select a time slot')
      return
    }

    setBookingLoading(true)
    try {
      const response = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor._id,
          appointmentDate: selectedDate,
          startTime: selectedSlot.time,
          symptoms,
          type: selectedType,
          paymentMethod: 'bKash'
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowBookingModal(false)
        router.push(`/payment?appointmentId=${data.data.appointment._id}`)
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to book appointment')
    } finally {
      setBookingLoading(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Doctor not found</h2>
        <Link href="/doctors" className="text-blue-600 mt-4 inline-block">
          ← Back to Doctors
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/doctors" className="text-white/80 hover:text-white inline-flex items-center gap-2 mb-6">
            <ChevronLeft className="w-4 h-4" />
            Back to Doctors
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
              {doctor.user?.profileImage ? (
                <Image
                  src={doctor.user.profileImage}
                  alt={doctor.user.fullName}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-4xl text-white font-bold">
                    {doctor.user?.fullName?.charAt(0) || 'D'}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">
                Dr. {doctor.user?.fullName}
              </h1>
              <p className="text-blue-100 text-lg mb-3">{doctor.specialization}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  {renderStars(doctor.rating)}
                  <span>({doctor.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{doctor.totalPatients}+ patients</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{doctor.experienceYears}+ years experience</span>
                </div>
              </div>
            </div>
            
            {/* Fee Card */}
            <div className="bg-white rounded-xl p-4 text-center min-w-[180px]">
              <p className="text-sm text-gray-500">Consultation Fee</p>
              <p className="text-2xl font-bold text-gray-900">৳{doctor.consultationFee}</p>
              <p className="text-xs text-gray-500 mt-1">Follow-up: ৳{doctor.followUpFee}</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
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
            {/* About */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600">
                {doctor.user?.bio || `Dr. ${doctor.user?.fullName} is a renowned ${doctor.specialization} specialist with over ${doctor.experienceYears} years of experience.`}
              </p>
            </div>
            
            {/* Qualifications */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Qualifications
              </h2>
              <div className="space-y-4">
                {doctor.qualifications?.map((qual, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
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
            
            {/* Workplace */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                Current Workplace
              </h2>
              <div className="space-y-3">
                <p className="font-medium text-gray-900">{doctor.currentWorkplace?.name}</p>
                <p className="text-gray-600">{doctor.currentWorkplace?.address}</p>
                <p className="text-gray-600">{doctor.currentWorkplace?.city}, {doctor.currentWorkplace?.district}</p>
                <p className="text-gray-600">📞 {doctor.currentWorkplace?.contactNumber}</p>
              </div>
            </div>
            
            {/* Reviews */}
            {doctor.reviews && doctor.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Patient Reviews ({doctor.totalReviews})
                </h2>
                <div className="space-y-4">
                  {doctor.reviews.slice(0, 5).map((review) => (
                    <div key={review._id} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.patient?.user?.profileImage ? (
                            <Image
                              src={review.patient.user.profileImage}
                              alt={review.patient.user.fullName}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {review.patient?.user?.fullName?.charAt(0) || 'P'}
                            </span>
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
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar - Schedule */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Available Schedule
              </h2>
              
              {/* Day Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Time Slots */}
              {availableSlots.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Available Time Slots</p>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 text-sm rounded-lg border transition ${
                          selectedSlot?.time === slot.time
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:border-blue-400'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No available slots for this date</p>
                  <p className="text-sm">Please select another date</p>
                </div>
              )}
              
              {/* Consultation Type */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {doctor.consultationTypes?.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`p-2 text-sm rounded-lg border transition flex items-center justify-center gap-2 ${
                        selectedType === type
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {type === 'video' && <Video className="w-4 h-4" />}
                      {type === 'phone' && <Phone className="w-4 h-4" />}
                      {type === 'in-person' && <Building className="w-4 h-4" />}
                      {type === 'video' ? 'Video Call' : type === 'phone' ? 'Phone Call' : 'In-Person'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Steps */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-1 text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      bookingStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <p className="text-xs text-gray-500">
                      {step === 1 ? 'Select Slot' : step === 2 ? 'Details' : 'Confirm'}
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
                    <p className="text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
                          className={`p-2 text-sm rounded-lg border ${
                            selectedSlot?.time === slot.time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setBookingStep(2)}
                    disabled={!selectedSlot}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className={`p-2 text-sm rounded-lg border ${
                            selectedType === type
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {type === 'video' ? 'Video Call' : type === 'phone' ? 'Phone Call' : 'In-Person'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symptoms / Reason for Visit
                    </label>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Please describe your symptoms or reason for consultation..."
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Appointment Summary</h3>
                    <div className="space-y-1 text-sm">
                      <p className="flex justify-between">
                        <span className="text-gray-500">Doctor:</span>
                        <span>Dr. {doctor.user?.fullName}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Date & Time:</span>
                        <span>{selectedDate.toLocaleDateString()} at {selectedSlot?.time}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span>{selectedType}</span>
                      </p>
                      <p className="flex justify-between font-medium pt-2 border-t">
                        <span>Fee:</span>
                        <span>৳{doctor.consultationFee}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(1)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setBookingStep(3)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Review & Confirm
                    </button>
                  </div>
                </div>
              )}
              
              {bookingStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900">Review Your Appointment</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctor.user?.fullName}</p>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{selectedSlot?.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedType === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                        {selectedType === 'phone' && <Phone className="w-4 h-4 text-gray-400" />}
                        {selectedType === 'in-person' && <MapPin className="w-4 h-4 text-gray-400" />}
                        <span>{selectedType === 'video' ? 'Video Consultation' : selectedType === 'phone' ? 'Phone Consultation' : 'In-Person Visit'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    <p className="font-medium mb-1">Payment Information</p>
                    <p>You will be redirected to complete payment after confirmation. Total amount: ৳{doctor.consultationFee}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setBookingStep(2)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleBooking}
                      disabled={bookingLoading}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Confirm & Proceed to Payment'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}