'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Stethoscope, 
  Star, 
  MapPin, 
  Clock, 
  Video, 
  Phone,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [specializations, setSpecializations] = useState([])
  const [cities, setCities] = useState([])

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    fetchDoctors()
  }, [searchTerm, selectedSpecialization, selectedCity, sortBy, currentPage])

  useEffect(() => {
    fetchFilters()
  }, [])

  const fetchDoctors = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedSpecialization && { specialization: selectedSpecialization }),
        ...(selectedCity && { city: selectedCity }),
        sortBy,
      })
      
      const response = await fetch(`${API_URL}/api/v1/doctors/public?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDoctors(data.data.doctors || [])
        setTotalPages(data.data.pagination?.pages || 1)
      } else {
        setError(data.message || 'Failed to fetch doctors')
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchFilters = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/doctors/public/filters`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.success) {
        setSpecializations(data.data.specializations || [])
        setCities(data.data.cities || [])
      }
    } catch (error) {
      console.error('Error fetching filters:', error)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-green-500 fill-green-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Green Theme */}
      <div className="bg-gradient-to-r from-green-700 to-green-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Find the Best Doctors in Bangladesh
          </h1>
          <p className="text-green-100 text-center text-lg mb-8">
            Book appointments with verified doctors online
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-lg focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Dark Theme */}
          <div className="lg:w-80 space-y-6">
            <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-white">Filters</h3>
              </div>
              
              {/* Specialization Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Specialization
                </label>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              
              {/* City Filter */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-green-500 focus:border-green-500 text-white"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                  <option value="fee_low">Fee: Low to High</option>
                  <option value="fee_high">Fee: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Doctors Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 bg-gray-800 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                        <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Error loading doctors</h3>
                <p className="text-gray-400">{error}</p>
                <button
                  onClick={fetchDoctors}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Try Again
                </button>
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
                <Stethoscope className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No doctors found</h3>
                <p className="text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <Link
                      key={doctor._id}
                      href={`/doctors/${doctor._id}`}
                      className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 hover:border-green-500 transition-all duration-300 group"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Profile Image */}
                          <div className="w-20 h-20 bg-gradient-to-br from-green-700 to-green-900 rounded-full flex items-center justify-center overflow-hidden">
                            {doctor.user?.profileImage ? (
                              <Image
                                src={doctor.user.profileImage}
                                alt={doctor.user.fullName}
                                width={80}
                                height={80}
                                className="object-cover"
                              />
                            ) : (
                              <Stethoscope className="w-8 h-8 text-white" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold text-white group-hover:text-green-400 transition">
                              Dr. {doctor.user?.fullName}
                            </h3>
                            <p className="text-sm text-green-400 font-medium mt-0.5">
                              {doctor.specialization}
                            </p>
                            
                            {/* Rating */}
                            <div className="flex items-center gap-2 mt-2">
                              {renderStars(doctor.rating || 0)}
                              <span className="text-xs text-gray-500">
                                ({doctor.totalReviews || 0} reviews)
                              </span>
                            </div>
                            
                            {/* Experience */}
                            <p className="text-xs text-gray-500 mt-2">
                              {doctor.experienceYears || 0}+ years experience
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          {/* Location */}
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <MapPin className="w-4 h-4" />
                            <span>{doctor.currentWorkplace?.name}, {doctor.currentWorkplace?.city}</span>
                          </div>
                          
                          {/* Consultation Types */}
                          <div className="flex items-center gap-3 mb-3">
                            {doctor.consultationTypes?.includes('video') && (
                              <span className="flex items-center gap-1 text-xs text-green-400">
                                <Video className="w-3 h-3" /> Video
                              </span>
                            )}
                            {doctor.consultationTypes?.includes('phone') && (
                              <span className="flex items-center gap-1 text-xs text-blue-400">
                                <Phone className="w-3 h-3" /> Phone
                              </span>
                            )}
                            {doctor.consultationTypes?.includes('in-person') && (
                              <span className="flex items-center gap-1 text-xs text-purple-400">
                                <MapPin className="w-3 h-3" /> In-Person
                              </span>
                            )}
                          </div>
                          
                          {/* Fee and Book Button */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-lg font-bold text-white">
                                ৳{doctor.consultationFee || 0}
                              </span>
                              <span className="text-xs text-gray-500"> / visit</span>
                            </div>
                            <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-gray-300">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 text-white"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}