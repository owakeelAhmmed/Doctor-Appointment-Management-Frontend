// app/(dashboard)/doctor/schedule/view/page.jsx

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/lib/hooks/useAuth'
import Link from 'next/link'
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit2
} from 'lucide-react'
import { doctorAPI } from '@/app/lib/api/client'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = { sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' }

export default function ViewSchedulePage() {
  const { user } = useAuth()  // 🔥 useAuth ব্যবহার করুন
  const [schedule, setSchedule] = useState([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const response = await doctorAPI.getProfile()
      if (response?.data?.success) {
        const availableDays = response.data.data.doctor.availableDays || []
        setSchedule(availableDays)
      } else if (response?.success) {
        const availableDays = response.data.doctor.availableDays || []
        setSchedule(availableDays)
      }
    } catch (error) {
      console.error('Error fetching schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekDays = () => {
    const start = new Date(currentWeek)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(start.setDate(diff))
    
    const week = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      week.push(date)
    }
    return week
  }

  const getDayName = (date) => {
    return DAYS[date.getDay()]
  }

  const getDaySchedule = (dayName) => {
    return schedule.find(s => s.day === dayName) || { isAvailable: false, slots: [] }
  }

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const weekDays = getWeekDays()

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
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">View your weekly availability</p>
        </div>
        <Link
          href="/doctor/schedule"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Edit2 className="w-4 h-4" />
          Edit Schedule
        </Link>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-300 p-3">
        <button
          onClick={() => {
            const newWeek = new Date(currentWeek)
            newWeek.setDate(newWeek.getDate() - 7)
            setCurrentWeek(newWeek)
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium text-gray-900">
          {weekDays[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - 
          {weekDays[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          onClick={() => {
            const newWeek = new Date(currentWeek)
            newWeek.setDate(newWeek.getDate() + 7)
            setCurrentWeek(newWeek)
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((date) => {
          const dayName = getDayName(date)
          const daySchedule = getDaySchedule(dayName)
          const isToday = date.toDateString() === new Date().toDateString()
          
          return (
            <div
              key={dayName}
              className={`bg-white rounded-xl border ${
                isToday ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-300'
              } overflow-hidden`}
            >
              <div className={`p-3 text-center border-b border-gray-200 ${
                isToday ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                <p className="font-semibold text-gray-900">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className="text-sm text-gray-500">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              
              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {!daySchedule.isAvailable ? (
                  <div className="text-center py-6 text-gray-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Not Available</p>
                  </div>
                ) : daySchedule.slots?.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No slots added</p>
                  </div>
                ) : (
                  daySchedule.slots.map((slot, idx) => {
                    const getIcon = () => {
                      switch(slot.type) {
                        case 'video': return Video
                        case 'phone': return Phone
                        default: return MapPin
                      }
                    }
                    const Icon = getIcon()
                    return (
                      <div key={idx} className="p-2 bg-gray-50 rounded-lg text-center border border-gray-300">
                        <p className="text-sm font-medium text-gray-900">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <Icon className="w-3 h-3 text-gray-500" />
                          <span className="text-xs text-gray-500 capitalize">{slot.type}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Max: {slot.maxPatients} patients</p>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl border border-gray-300 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {schedule.filter(d => d.isAvailable && d.slots?.length > 0).length}
            </p>
            <p className="text-xs text-gray-500">Active Days</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {schedule.reduce((total, d) => total + (d.slots?.length || 0), 0)}
            </p>
            <p className="text-xs text-gray-500">Total Slots</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {schedule.filter(d => d.isAvailable && d.slots?.length > 0).length}
            </p>
            <p className="text-xs text-gray-500">Working Days</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">
              {schedule.filter(d => !d.isAvailable || d.slots?.length === 0).length}
            </p>
            <p className="text-xs text-gray-500">Off Days</p>
          </div>
        </div>
      </div>
    </div>
  )
}