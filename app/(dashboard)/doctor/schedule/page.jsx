'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  Plus,
  X,
  Save,
  Trash2,
  Calendar,
  Video,
  Phone,
  MapPin
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function DoctorSchedulePage() {
  const [schedule, setSchedule] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingDay, setEditingDay] = useState(null)

  const days = [
    { value: 'sunday', label: 'Sunday', short: 'Sun' },
    { value: 'monday', label: 'Monday', short: 'Mon' },
    { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { value: 'thursday', label: 'Thursday', short: 'Thu' },
    { value: 'friday', label: 'Friday', short: 'Fri' },
    { value: 'saturday', label: 'Saturday', short: 'Sat' }
  ]

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    setIsLoading(true)
    try {
      const response = await doctorAPI.getProfile()
      const doctorData = response.data?.doctor
      if (doctorData?.availableDays && doctorData.availableDays.length > 0) {
        setSchedule(doctorData.availableDays)
      } else {
        // Initialize empty schedule
        setSchedule(days.map(day => ({
          day: day.value,
          isAvailable: false,
          slots: []
        })))
      }
    } catch (error) {
      showToast.error('Failed to load schedule')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleDayAvailability = (dayIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].isAvailable = !newSchedule[dayIndex].isAvailable
    if (!newSchedule[dayIndex].isAvailable) {
      newSchedule[dayIndex].slots = []
    }
    setSchedule(newSchedule)
  }

  const addSlot = (dayIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots.push({
      startTime: '09:00',
      endTime: '09:30',
      type: 'in-person',
      maxPatients: 1
    })
    setSchedule(newSchedule)
  }

  const removeSlot = (dayIndex, slotIndex) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots.splice(slotIndex, 1)
    setSchedule(newSchedule)
  }

  const updateSlot = (dayIndex, slotIndex, field, value) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex].slots[slotIndex][field] = value
    
    // Auto-calculate end time if start time changes (30 min slots)
    if (field === 'startTime') {
      const [hours, minutes] = value.split(':')
      const endDate = new Date()
      endDate.setHours(parseInt(hours), parseInt(minutes) + 30, 0)
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
      newSchedule[dayIndex].slots[slotIndex].endTime = endTime
    }
    
    setSchedule(newSchedule)
  }

  const saveSchedule = async () => {
    setIsSaving(true)
    try {
      const response = await doctorAPI.updateSchedule({ availableDays: schedule })
      if (response.success) {
        showToast.success('Schedule updated successfully')
        setEditingDay(null)
      }
    } catch (error) {
      showToast.error('Failed to save schedule')
    } finally {
      setIsSaving(false)
    }
  }

  const timeSlots = []
  for (let i = 8; i <= 20; i++) {
    timeSlots.push(`${i.toString().padStart(2, '0')}:00`)
    timeSlots.push(`${i.toString().padStart(2, '0')}:30`)
  }

  const slotTypes = [
    { value: 'in-person', label: 'In-Person', icon: MapPin, color: 'text-purple-600' },
    { value: 'video', label: 'Video', icon: Video, color: 'text-blue-600' },
    { value: 'phone', label: 'Phone', icon: Phone, color: 'text-green-600' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-500 mt-1">Set your weekly availability for appointments</p>
        </div>
        <button
          onClick={saveSchedule}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="divide-y">
          {schedule.map((day, dayIndex) => {
            const dayInfo = days.find(d => d.value === day.day)
            
            return (
              <div key={day.day} className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={() => toggleDayAvailability(dayIndex)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="font-semibold text-gray-900">{dayInfo?.label}</span>
                    </label>
                    {day.isAvailable && (
                      <button
                        onClick={() => addSlot(dayIndex)}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Add Slot
                      </button>
                    )}
                  </div>
                </div>

                {day.isAvailable && (
                  <div className="space-y-3">
                    {day.slots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {/* Start Time */}
                        <select
                          value={slot.startTime}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, 'startTime', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>

                        <span className="text-gray-400">to</span>

                        {/* End Time (auto-calculated, read-only) */}
                        <input
                          type="text"
                          value={slot.endTime}
                          readOnly
                          className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                        />

                        {/* Consultation Type */}
                        <select
                          value={slot.type}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, 'type', e.target.value)}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                          {slotTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>

                        {/* Max Patients */}
                        <select
                          value={slot.maxPatients}
                          onChange={(e) => updateSlot(dayIndex, slotIndex, 'maxPatients', parseInt(e.target.value))}
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        >
                          {[1, 2, 3, 4, 5].map(num => (
                            <option key={num} value={num}>{num} patient{num > 1 ? 's' : ''}</option>
                          ))}
                        </select>

                        <button
                          onClick={() => removeSlot(dayIndex, slotIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {day.slots.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No time slots added. Click "Add Slot" to set availability.
                      </div>
                    )}
                  </div>
                )}

                {!day.isAvailable && (
                  <div className="text-sm text-gray-400 italic">Not available on {dayInfo?.label}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-blue-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">About Schedule</h3>
            <p className="text-sm text-blue-700 mt-1">
              • Each slot is 30 minutes long<br />
              • Patients can book appointments only during your available slots<br />
              • You can set different consultation types for each slot
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}