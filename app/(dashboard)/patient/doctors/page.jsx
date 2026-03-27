'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Award,
  ChevronRight,
  X,
  Heart,
  User
} from 'lucide-react'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function FindDoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minFee: '',
    maxFee: '',
    rating: '',
    availableToday: false,
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1
  })
  const [favorites, setFavorites] = useState([])

  // Specializations list
  const specializations = [
    'Cardiology',
    'Neurology', 
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Dentistry',
    'Psychiatry',
    'General Physician'
  ]

  // Cities in Bangladesh
  const cities = [
    'Dhaka',
    'Chittagong',
    'Sylhet', 
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
    'Mymensingh'
  ]

  useEffect(() => {
    searchDoctors()
    loadFavorites()
  }, [filters])

  const searchDoctors = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.searchDoctors({
        ...filters,
        name: searchQuery
      })
      if (response.success) {
        setDoctors(response.data.doctors)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      showToast.error('Failed to load doctors')
    } finally {
      setIsLoading(false)
    }
  }

  const loadFavorites = async () => {
    try {
      const response = await patientAPI.getFavorites()
      if (response.success) {
        setFavorites(response.data.map(fav => fav._id))
      }
    } catch (error) {
      console.error('Failed to load favorites')
    }
  }

  const toggleFavorite = async (doctorId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      if (favorites.includes(doctorId)) {
        await patientAPI.removeFavorite(doctorId)
        setFavorites(favorites.filter(id => id !== doctorId))
        showToast.success('Removed from favorites')
      } else {
        await patientAPI.addFavorite(doctorId)
        setFavorites([...favorites, doctorId])
        showToast.success('Added to favorites')
      }
    } catch (error) {
      showToast.error('Failed to update favorites')
    }
  }

  const clearFilters = () => {
    setFilters({
      specialization: '',
      city: '',
      minFee: '',
      maxFee: '',
      rating: '',
      availableToday: false,
      page: 1,
      limit: 10
    })
    setSearchQuery('')
  }

  const handleDoctorClick = (doctorId) => {
    router.push(`/patient/doctors/${doctorId}`)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name, specialization, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchDoctors()}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
          </div>
          <button
            onClick={searchDoctors}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block w-80 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4">
              {/* Specialization Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <select
                  value={filters.specialization}
                  onChange={(e) => setFilters({ ...filters, specialization: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Specializations</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Fee Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consultation Fee
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minFee}
                    onChange={(e) => setFilters({ ...filters, minFee: e.target.value, page: 1 })}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxFee}
                    onChange={(e) => setFilters({ ...filters, maxFee: e.target.value, page: 1 })}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              {/* Available Today */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.availableToday}
                  onChange={(e) => setFilters({ ...filters, availableToday: e.target.checked, page: 1 })}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Available Today</span>
              </label>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Same filters as desktop */}
                <div className="space-y-4">
                  {/* Copy all filter inputs from desktop version here */}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doctors List */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {doctors.map((doctor) => (
                <motion.div
                  key={doctor._id}
                  variants={itemVariants}
                  onClick={() => handleDoctorClick(doctor._id)}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
                >
                  <button
                    onClick={(e) => toggleFavorite(doctor._id, e)}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(doctor._id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>

                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      {doctor.user?.profileImage ? (
                        <img
                          src={doctor.user.profileImage}
                          alt={doctor.user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-primary-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Dr. {doctor.user?.fullName}
                      </h3>
                      <p className="text-primary-600 font-medium">{doctor.specialization}</p>
                      
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Award className="w-4 h-4" />
                          {doctor.experienceYears} years exp.
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {doctor.currentWorkplace?.address || 'Dhaka'}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {doctor.rating} ({doctor.totalReviews})
                        </div>
                        <div className="flex items-center gap-1 text-sm font-semibold text-primary-600">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(doctor.consultationFee)}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {doctor.consultationTypes?.map((type) => (
                          <span
                            key={type}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      {doctor.availableDays?.some(d => d.isAvailable) && (
                        <div className="mt-3 flex items-center gap-1 text-sm text-green-600">
                          <Clock className="w-4 h-4" />
                          Available today
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.div>
              ))}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                      className={`w-10 h-10 rounded-lg ${
                        filters.page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}