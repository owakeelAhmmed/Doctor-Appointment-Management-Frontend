'use client'

import { useState, useRef, useEffect } from 'react'
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ModernDatePicker({ value, onChange, error, label }) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [viewMode, setViewMode] = useState('days') // 'days', 'months', 'years'
  const [inputValue, setInputValue] = useState('')
  const pickerRef = useRef(null)
  const inputRef = useRef(null)

  // Generate years (1900 to current year)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse()

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // ফাংশনগুলো প্রথমে ডিফাইন করুন
  const formatDateForInput = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const parseInputDate = (input) => {
    // Try DD/MM/YYYY format
    const parts = input.split(/[/\-.]/)
    if (parts.length === 3) {
      let day, month, year
      if (parts[0].length === 4) { // YYYY-MM-DD
        [year, month, day] = parts
      } else { // DD/MM/YYYY
        [day, month, year] = parts
      }
      
      day = parseInt(day)
      month = parseInt(month) - 1
      year = parseInt(year)
      
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        const date = new Date(year, month, day)
        if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
          return date
        }
      }
    }
    return null
  }

  // এখন useState-এ value সেট করুন
  useEffect(() => {
    if (value) {
      setInputValue(formatDateForInput(value))
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    const parsedDate = parseInputDate(newValue)
    if (parsedDate) {
      onChange(parsedDate.toISOString().split('T')[0])
    }
  }

  const handleInputBlur = () => {
    if (!value && inputValue) {
      const parsedDate = parseInputDate(inputValue)
      if (!parsedDate) {
        setInputValue('')
      }
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleYearSelect = (year) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1))
    setViewMode('months')
  }

  const handleMonthSelect = (monthIndex) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), monthIndex, 1))
    setViewMode('days')
  }

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selectedDate.toISOString().split('T')[0])
    setIsOpen(false)
  }

  const handleQuickSelect = (type) => {
    const today = new Date()
    let selectedDate
    
    switch (type) {
      case 'today':
        selectedDate = today
        break
      case 'yesterday':
        selectedDate = new Date(today)
        selectedDate.setDate(today.getDate() - 1)
        break
      case '18-years':
        selectedDate = new Date(today)
        selectedDate.setFullYear(today.getFullYear() - 18)
        break
      case '21-years':
        selectedDate = new Date(today)
        selectedDate.setFullYear(today.getFullYear() - 21)
        break
      default:
        return
    }
    
    onChange(selectedDate.toISOString().split('T')[0])
    setCurrentMonth(selectedDate)
    setIsOpen(false)
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const renderDaysView = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isSelected = value === dateStr
      const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={`w-8 h-8 rounded-full text-sm flex items-center justify-center cursor-pointer transition-all
            ${isSelected 
              ? 'bg-pink-500 text-white' 
              : isToday
                ? 'bg-pink-500/20 text-white border border-pink-500/50'
                : 'hover:bg-white/10 text-white/70'
            }`}
        >
          {day}
        </motion.button>
      )
    }

    return days
  }

  const renderMonthsView = () => {
    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((month, index) => (
          <motion.button
            key={month}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMonthSelect(index)}
            className={`p-2 text-sm rounded-lg transition-all ${
              currentMonth.getMonth() === index
                ? 'bg-pink-500 text-white'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            {month.slice(0, 3)}
          </motion.button>
        ))}
      </div>
    )
  }

  const renderYearsView = () => {
    return (
      <div className="h-64 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {years.map((year) => (
          <motion.button
            key={year}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleYearSelect(year)}
            className={`w-full p-2 text-sm rounded-lg transition-all ${
              currentMonth.getFullYear() === year
                ? 'bg-pink-500 text-white'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            {year}
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="relative" ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-1">
          {label}
        </label>
      )}
      
      {/* Input field with calendar icon */}
      <div className="relative group">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-pink-400 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          placeholder="DD/MM/YYYY"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all text-sm"
        />
      </div>

      {/* Calendar Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 mt-2 p-4 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl w-72"
          >
            {/* Quick Select Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickSelect('today')}
                className="px-2 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                Today
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickSelect('yesterday')}
                className="px-2 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                Yesterday
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickSelect('18-years')}
                className="px-2 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                18+ (Adult)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickSelect('21-years')}
                className="px-2 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
              >
                21+ (US)
              </motion.button>
            </div>

            {/* Header with navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setViewMode('years')}
                  className="px-2 py-1 hover:bg-white/10 rounded-lg text-white font-medium text-sm flex items-center gap-1"
                >
                  {currentMonth.getFullYear()}
                  <ChevronDown className="w-3 h-3" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setViewMode('months')}
                  className="px-2 py-1 hover:bg-white/10 rounded-lg text-white font-medium text-sm flex items-center gap-1"
                >
                  {months[currentMonth.getMonth()]}
                  <ChevronDown className="w-3 h-3" />
                </motion.button>
              </div>

              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Calendar View */}
            {viewMode === 'days' && (
              <>
                {/* Days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {days.map(day => (
                    <div key={day} className="w-8 h-8 flex items-center justify-center text-xs text-white/50">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {renderDaysView()}
                </div>
              </>
            )}

            {viewMode === 'months' && renderMonthsView()}
            {viewMode === 'years' && renderYearsView()}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-xs text-pink-300 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  )
}