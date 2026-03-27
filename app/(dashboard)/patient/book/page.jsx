'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  User,
  Search,
  ChevronLeft,
  Video,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import Button from '@/app/components/ui/Button'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function BookAppointmentPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: select doctor, 2: select slot, 3: confirm
  const [searchQuery, setSearchQuery] = useState('')
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchFilters, setSearchFilters] = useState({
    specialization: '',
    city: '',
    page: 1,
    limit: 10
  })

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      symptoms: '',
      type: 'video'
    }
  })

  // Search doctors
  useEffect(() => {
    if (step === 1) {
      searchDoctors()
    }
  }, [searchFilters])

  const searchDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.searchDoctors(searchFilters)
      if (response.success) {
        setDoctors(response.data.doctors)
      }
    } catch (error) {
      showToast.error('Failed to load doctors')
    } finally {
      setIsLoading(false)
    }
  }

  // Get available slots when doctor selected
  useEffect(() => {
    if (selectedDoctor) {
      fetchAvailableSlots()
    }
  }, [selectedDoctor])

  const fetchAvailableSlots = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.getDoctorSlots(selectedDoctor._id)
      if (response.success) {
        setAvailableSlots(response.data)
      }
    } catch (error) {
      showToast.error('Failed to load available slots')
    } finally {
      setIsLoading(false)
    }
  }

  // Book appointment
  const onSubmit = async (data) => {
    if (!selectedDoctor || !selectedSlot) {
      showToast.error('Please select doctor and time slot')
      return
    }

    setIsLoading(true)
    try {
      const response = await patientAPI.bookAppointment({
        doctorId: selectedDoctor._id,
        appointmentDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        symptoms: data.symptoms,
        type: data.type,
        paymentMethod: 'bKash'
      })

      if (response.success) {
        showToast.success('Appointment booked successfully!')
        setTimeout(() => {
          router.push(`/patient/appointments/${response.data.appointment._id}`)
        }, 2000)
      }
    } catch (error) {
      showToast.error('Failed to book appointment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-2 rounded-full ${
              s <= step ? 'bg-primary-600' : 'bg-gray-200'
            }`} />
          </div>
        ))}
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Search Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Find a Doctor</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Doctor name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              
              <select
                value={searchFilters.specialization}
                onChange={(e) => setSearchFilters({ ...searchFilters, specialization: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">All Specializations</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Pediatrics">Pediatrics</option>
              </select>

              <select
                value={searchFilters.city}
                onChange={(e) => setSearchFilters({ ...searchFilters, city: e.target.value })}
                className="px-4 py-2 border border-gray-200 rounded-lg"
              >
                <option value="">All Cities</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
              </select>
            </div>
          </div>

          {/* Doctors List */}
          <div className="space-y-4">
            {doctors.map((doctor) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedDoctor(doctor)
                  setStep(2)
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {doctor.user?.fullName}
                        </h3>
                        <p className="text-sm text-gray-500">{doctor.specialization}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-600">৳{doctor.consultationFee}</p>
                        <p className="text-xs text-gray-500">per consultation</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {doctor.experienceYears} years exp.
                      </span>
                      <span className="flex items-center gap-1 text-gray-600">
                        <User className="w-4 h-4" />
                        {doctor.totalPatients}+ patients
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500">
                        ⭐ {doctor.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Select Time Slot */}
      {step === 2 && selectedDoctor && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Selected Doctor Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Dr. {selectedDoctor.user?.fullName}</h2>
                <p className="text-gray-500">{selectedDoctor.specialization}</p>
              </div>
            </div>
          </div>

          {/* Available Slots */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
            
            <div className="space-y-4">
              {availableSlots.map((slot) => (
                <div key={slot.date} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    {format(new Date(slot.date), 'EEEE, MMMM dd, yyyy')}
                  </h4>
                  
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {slot.slots.map((time) => (
                      <button
                        key={time.startTime}
                        onClick={() => {
                          setSelectedSlot({
                            date: slot.date,
                            startTime: time.startTime
                          })
                          setStep(3)
                        }}
                        className="px-3 py-2 text-sm bg-gray-50 hover:bg-primary-50 border border-gray-200 rounded-lg transition-colors"
                      >
                        {time.startTime}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Confirm & Book */}
      {step === 3 && selectedDoctor && selectedSlot && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Appointment Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Appointment Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Doctor</span>
                  <span className="font-medium">Dr. {selectedDoctor.user?.fullName}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Specialization</span>
                  <span className="font-medium">{selectedDoctor.specialization}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Date</span>
                  <span className="font-medium">
                    {format(new Date(selectedSlot.date), 'MMMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium">{selectedSlot.startTime}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-bold text-primary-600">৳{selectedDoctor.consultationFee}</span>
                </div>
              </div>
            </div>

            {/* Consultation Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Consultation Type</h3>
              
              <div className="grid grid-cols-3 gap-3">
                {['in-person', 'video', 'phone'].map((type) => (
                  <label
                    key={type}
                    className={`
                      flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer
                      ${watch('type') === type 
                        ? 'border-primary-600 bg-primary-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      value={type}
                      {...register('type')}
                      className="hidden"
                    />
                    {type === 'in-person' && <MapPin className="w-6 h-6" />}
                    {type === 'video' && <Video className="w-6 h-6" />}
                    {type === 'phone' && <Phone className="w-6 h-6" />}
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Symptoms (Optional)</h3>
              
              <textarea
                rows={4}
                placeholder="Describe your symptoms or reason for visit..."
                {...register('symptoms')}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="flex-1"
              >
                Confirm & Pay
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}