// app/(dashboard)/doctor/schedule/page.jsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/lib/hooks/useAuth'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock,
  Plus,
  Trash2,
  Save,
  Video,
  Phone,
  MapPin,
  AlertCircle,
  Calendar,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

const DAYS = [
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' }
]

const SLOT_TYPES = [
  { value: 'in-person', label: 'In-Person', icon: MapPin, color: 'bg-purple-100 text-purple-600' },
  { value: 'video', label: 'Video Call', icon: Video, color: 'bg-blue-100 text-blue-600' },
  { value: 'phone', label: 'Phone Call', icon: Phone, color: 'bg-green-100 text-green-600' }
]

// Generate time options (00:00 to 23:30)
const generateTimeOptions = () => {
  const times = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourStr = hour.toString().padStart(2, '0')
      const minuteStr = minute.toString().padStart(2, '0')
      times.push({
        value: `${hourStr}:${minuteStr}`,
        label: `${hourStr}:${minuteStr}`,
        hour,
        minute
      })
    }
  }
  return times
}

const TIME_OPTIONS = generateTimeOptions()

// Custom Time Picker Component
const CustomTimePicker = ({ value, onChange, placeholder = "Select time" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState(null)
  const [selectedMinute, setSelectedMinute] = useState(null)
  const dropdownRef = useRef(null)

  // Parse current value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number)
      setSelectedHour(hour)
      setSelectedMinute(minute)
    }
  }, [value])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = [0, 30]

  const formatDisplayTime = (hour, minute) => {
    if (hour === null || minute === null) return ''
    const hour12 = hour % 12 || 12
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
  }

  const handleTimeSelect = (hour, minute) => {
    setSelectedHour(hour)
    setSelectedMinute(minute)
    const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    onChange(timeValue)
    setIsOpen(false)
  }

  const getDisplayValue = () => {
    if (selectedHour !== null && selectedMinute !== null) {
      return formatDisplayTime(selectedHour, selectedMinute)
    }
    return placeholder
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white flex items-center justify-between cursor-pointer"
      >
        <span className={selectedHour !== null ? 'text-gray-900' : 'text-gray-400'}>
          {getDisplayValue()}
        </span>
        <Clock className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="flex divide-x divide-gray-200">
            {/* Hours Column */}
            <div className="flex-1">
              <div className="p-2 bg-gray-50 border-b border-gray-200 text-center text-xs font-medium text-gray-600">
                Hour
              </div>
              <div className="max-h-48 overflow-y-auto">
                {hours.map((hour) => {
                  const hour12 = hour % 12 || 12
                  const ampm = hour >= 12 ? 'PM' : 'AM'
                  return (
                    <button
                      key={hour}
                      onClick={() => handleTimeSelect(hour, selectedMinute !== null ? selectedMinute : 0)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-green-50 transition-colors cursor-pointer ${
                        selectedHour === hour ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {hour12.toString().padStart(2, '0')} {ampm}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div className="flex-1">
              <div className="p-2 bg-gray-50 border-b border-gray-200 text-center text-xs font-medium text-gray-600">
                Minute
              </div>
              <div className="max-h-48 overflow-y-auto">
                {minutes.map((minute) => (
                  <button
                    key={minute}
                    onClick={() => handleTimeSelect(selectedHour !== null ? selectedHour : 9, minute)}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-green-50 transition-colors cursor-pointer ${
                      selectedMinute === minute ? 'bg-green-100 text-green-700 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Function to add minutes to a time
const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + mins + minutes
  const newHours = Math.floor(totalMinutes / 60) % 24
  const newMins = totalMinutes % 60
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
}

// Validate time format
const isValidTime = (time) => {
  return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)
}

export default function DoctorSchedulePage() {
  const { user } = useAuth()  // 🔥 useAuth ব্যবহার করুন
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState([])
  const [selectedDay, setSelectedDay] = useState(null)
  const [slotForm, setSlotForm] = useState({
    startTime: '09:00',
    endTime: '09:30',
    type: 'in-person',
    maxPatients: 5
  })

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await doctorAPI.getProfile()
      if (response?.data?.success) {
        const doctorData = response.data.data.doctor
        setSchedule(doctorData.availableDays || [])
      } else if (response?.success) {
        const doctorData = response.data.doctor
        setSchedule(doctorData.availableDays || [])
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
      showToast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const getDaySchedule = (dayValue) => {
    return schedule.find(d => d.day === dayValue) || { day: dayValue, slots: [], isAvailable: false }
  }

  const updateDaySchedule = (dayValue, updates) => {
    const existingIndex = schedule.findIndex(d => d.day === dayValue)
    
    if (existingIndex >= 0) {
      const newSchedule = [...schedule]
      newSchedule[existingIndex] = { ...newSchedule[existingIndex], ...updates }
      setSchedule(newSchedule)
    } else {
      setSchedule([...schedule, { day: dayValue, slots: [], isAvailable: false, ...updates }])
    }
  }

  // Check if time slot overlaps with existing slots
  const isOverlapping = (dayValue, startTime, endTime, excludeIndex = null) => {
    const daySchedule = getDaySchedule(dayValue)
    const slots = daySchedule.slots || []
    
    return slots.some((slot, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false
      return (startTime < slot.endTime && endTime > slot.startTime)
    })
  }

  const addSlot = (dayValue) => {
    // Validate time format
    if (!isValidTime(slotForm.startTime)) {
      showToast.error('Invalid start time format')
      return
    }
    if (!isValidTime(slotForm.endTime)) {
      showToast.error('Invalid end time format')
      return
    }

    if (slotForm.startTime >= slotForm.endTime) {
      showToast.error('End time must be after start time')
      return
    }

    // Validate maxPatients (1-10)
    if (slotForm.maxPatients < 1 || slotForm.maxPatients > 10) {
      showToast.error('Max patients must be between 1 and 10')
      return
    }

    // Check for overlapping slots
    if (isOverlapping(dayValue, slotForm.startTime, slotForm.endTime)) {
      showToast.error('This time slot overlaps with an existing slot')
      return
    }

    const daySchedule = getDaySchedule(dayValue)
    const newSlot = {
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      type: slotForm.type,
      maxPatients: slotForm.maxPatients,
      isBooked: false
    }

    const updatedSlots = [...(daySchedule.slots || []), newSlot]
    updatedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    
    updateDaySchedule(dayValue, { slots: updatedSlots, isAvailable: true })
    
    setSelectedDay(null)
    setSlotForm({ startTime: '09:00', endTime: '09:30', type: 'in-person', maxPatients: 5 })
    
    showToast.success('Slot added successfully')
  }

  const removeSlot = (dayValue, slotIndex) => {
    const daySchedule = getDaySchedule(dayValue)
    const updatedSlots = daySchedule.slots.filter((_, idx) => idx !== slotIndex)
    updateDaySchedule(dayValue, { 
      slots: updatedSlots,
      isAvailable: updatedSlots.length > 0
    })
    showToast.success('Slot removed')
  }

  const toggleDayAvailability = (dayValue) => {
    const daySchedule = getDaySchedule(dayValue)
    updateDaySchedule(dayValue, { isAvailable: !daySchedule.isAvailable })
  }

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const cleanSchedule = schedule
        .filter(day => day.isAvailable && day.slots && day.slots.length > 0)
        .map(day => ({
          day: day.day,
          isAvailable: day.isAvailable,
          slots: day.slots
            .filter(slot => {
              const isValid = isValidTime(slot.startTime) && 
                             isValidTime(slot.endTime) && 
                             slot.startTime < slot.endTime &&
                             slot.maxPatients >= 1 && 
                             slot.maxPatients <= 10
              if (!isValid) {
                console.warn('Invalid slot filtered out:', slot)
              }
              return isValid
            })
            .map(slot => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              type: slot.type,
              maxPatients: Math.min(Math.max(slot.maxPatients, 1), 10),
              isBooked: false
            }))
        }))
        .filter(day => day.slots.length > 0)
      
      if (cleanSchedule.length === 0) {
        showToast.warning('No valid slots to save')
        setSaving(false)
        return
      }
      
      console.log('Saving schedule:', JSON.stringify(cleanSchedule, null, 2))
      
      const response = await doctorAPI.updateSchedule({ availableDays: cleanSchedule })
      if (response?.data?.success || response?.success) {
        showToast.success('Schedule saved successfully')
        await fetchSchedule()
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save schedule'
      const errors = error.response?.data?.errors
      if (errors && errors.length > 0) {
        errors.forEach(err => {
          showToast.error(`${err.field}: ${err.message}`)
        })
      } else {
        showToast.error(errorMsg)
      }
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (time) => {
    if (!time || !isValidTime(time)) return time
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-sm text-gray-500 mt-1">Set your weekly availability for patient appointments</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/doctor/schedule/view"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            View Schedule
          </Link>
          <button
            onClick={saveSchedule}
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Schedule
              </>
            )}
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {DAYS.map((day, index) => {
          const daySchedule = getDaySchedule(day.value)
          const isAvailable = daySchedule.isAvailable
          const slots = daySchedule.slots || []
          
          return (
            <motion.div
              key={day.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-xl border ${
                isAvailable ? 'border-green-200 shadow-sm' : 'border-gray-300'
              }`}
            >
              <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${
                isAvailable ? 'bg-green-50' : 'bg-gray-50'
              } rounded-t-xl`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isAvailable ? 'bg-green-100' : 'bg-gray-200'
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      isAvailable ? 'text-green-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{day.label}</h3>
                    {isAvailable && slots.length > 0 && (
                      <p className="text-xs text-gray-500">{slots.length} slot{slots.length > 1 ? 's' : ''} available</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDayAvailability(day.value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isAvailable ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAvailable ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                  
                  {isAvailable && (
                    <button
                      onClick={() => setSelectedDay(selectedDay === day.value ? null : day.value)}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {isAvailable && (
                <div className="p-4 space-y-3">
                  {slots.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No time slots added</p>
                      <p className="text-xs">Click + to add availability</p>
                    </div>
                  ) : (
                    slots.map((slot, idx) => {
                      const SlotIcon = SLOT_TYPES.find(t => t.value === slot.type)?.icon || Clock
                      const slotTypeColor = SLOT_TYPES.find(t => t.value === slot.type)?.color || 'bg-gray-100 text-gray-600'
                      
                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-300">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${slotTypeColor}`}>
                              <SlotIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 capitalize">{slot.type}</span>
                                <span className="text-xs text-gray-500">Max: {slot.maxPatients} patients</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSlot(day.value, idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {selectedDay === day.value && isAvailable && (
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Time Slot</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                      <CustomTimePicker
                        value={slotForm.startTime}
                        onChange={(newStart) => {
                          const newEnd = addMinutes(newStart, 30)
                          setSlotForm({ ...slotForm, startTime: newStart, endTime: newEnd })
                        }}
                        placeholder="Select start time"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                      <CustomTimePicker
                        value={slotForm.endTime}
                        onChange={(newEnd) => setSlotForm({ ...slotForm, endTime: newEnd })}
                        placeholder="Select end time"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Consultation Type</label>
                      <div className="flex gap-2">
                        {SLOT_TYPES.map(type => {
                          const Icon = type.icon
                          return (
                            <button
                              key={type.value}
                              onClick={() => setSlotForm({ ...slotForm, type: type.value })}
                              className={`flex-1 p-2 rounded-lg border transition-all cursor-pointer ${
                                slotForm.type === type.value
                                  ? `${type.color} border-green-500 ring-1 ring-green-500`
                                  : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              <Icon className="w-4 h-4 mx-auto mb-1" />
                              <span className="text-xs">{type.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Patients</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            let newVal = slotForm.maxPatients - 1
                            if (newVal < 1) newVal = 1
                            setSlotForm({ ...slotForm, maxPatients: newVal })
                          }}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <span className="flex-1 text-center text-lg font-medium text-gray-900">
                          {slotForm.maxPatients}
                        </span>
                        <button
                          onClick={() => {
                            let newVal = slotForm.maxPatients + 1
                            if (newVal > 10) newVal = 10
                            setSlotForm({ ...slotForm, maxPatients: newVal })
                          }}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-1">Min: 1, Max: 10</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => addSlot(day.value)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all cursor-pointer"
                    >
                      Add Slot
                    </button>
                    <button
                      onClick={() => setSelectedDay(null)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Schedule Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              • Each slot is 30 minutes duration by default<br />
              • Max patients per slot: 1-10 only<br />
              • Use the custom time picker to select start and end times<br />
              • Click on consultation type icons to change the type<br />
              • Make sure to save your schedule after making changes
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}