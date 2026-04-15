'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Heart,
  User,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Award,
  ChevronRight,
  Search,
  X
} from 'lucide-react'
// import { formatCurrency } from '@/lib/utils/helpers'
import { patientAPI } from '@/app/lib/api/client'
import { showToast } from '@/app/lib/utils/toast'

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setIsLoading(true)
    try {
      const response = await patientAPI.getFavorites()
      if (response.success) {
        setFavorites(response.data)
      }
    } catch (error) {
      showToast.error('Failed to load favorites')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (doctorId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await patientAPI.removeFavorite(doctorId)
      setFavorites(favorites.filter(doc => doc._id !== doctorId))
      showToast.success('Removed from favorites')
    } catch (error) {
      showToast.error('Failed to remove from favorites')
    }
  }

  const filteredFavorites = favorites.filter(doctor =>
    doctor.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <h1 className="text-2xl font-bold text-gray-900">Favorite Doctors</h1>
        <Link
          href="/patient/doctors"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Search className="w-4 h-4" />
          <span>Find More Doctors</span>
        </Link>
      </div>

      {/* Search */}
      {favorites.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search in favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Favorites List */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {favorites.length === 0 ? 'No favorites yet' : 'No matching doctors'}
          </h3>
          <p className="text-gray-500 mb-6">
            {favorites.length === 0 
              ? 'Start adding doctors to your favorites list'
              : 'Try adjusting your search'
            }
          </p>
          {favorites.length === 0 && (
            <Link
              href="/patient/doctors"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Doctors
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {filteredFavorites.map((doctor) => (
            <motion.div
              key={doctor._id}
              variants={itemVariants}
              onClick={() => router.push(`/patient/doctors/${doctor._id}`)}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer relative"
            >
              <button
                onClick={(e) => removeFavorite(doctor._id, e)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  {doctor.user?.profileImage ? (
                    <img
                      src={doctor.user.profileImage}
                      alt={doctor.user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-600" />
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Dr. {doctor.user?.fullName}
                  </h3>
                  <p className="text-primary-600 text-sm mb-2">{doctor.specialization}</p>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Award className="w-4 h-4" />
                      {doctor.experienceYears} years exp.
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {doctor.currentWorkplace?.address || 'Dhaka'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-900">{doctor.rating}</span>
                      <span className="text-gray-500">({doctor.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-primary-600">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(doctor.consultationFee)}
                    </div>
                  </div>

                  {doctor.availableDays?.some(d => d.isAvailable) && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-green-600">
                      <Clock className="w-3 h-3" />
                      Available today
                    </div>
                  )}

                  <Link
                    href={`/patient/doctors/${doctor._id}`}
                    className="mt-3 inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                  >
                    View Profile
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}