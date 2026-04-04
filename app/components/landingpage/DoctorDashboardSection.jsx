'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function DoctorDashboardSection() {
  const [searchLocation, setSearchLocation] = useState('')
  const [searchHospital, setSearchHospital] = useState('')

  const specialties = [
    { name: 'Cardiology', icon: '❤️', color: 'from-rose-500 to-pink-500' },
    { name: 'Neurology', icon: '🧠', color: 'from-purple-500 to-indigo-500' },
    { name: 'Orthopedics', icon: '🦴', color: 'from-blue-500 to-cyan-500' },
    { name: 'Pediatrics', icon: '👶', color: 'from-green-500 to-emerald-500' },
    { name: 'Dentistry', icon: '🦷', color: 'from-yellow-500 to-orange-500' },
    { name: 'Ophthalmology', icon: '👁️', color: 'from-cyan-500 to-blue-500' },
  ]

  return (
    <div className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      
      {/* Background Glass Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Working for Your Better Health
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Get connected with top healthcare professionals and manage your health journey
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Left Column - App Download & Doctor Card */}
          <div className="space-y-6">
            
            {/* App Download Card - Glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">📱</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Download the Doccure App today!
                  </h3>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <button className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-xl text-white hover:bg-black transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.25-1.73 4-3.74 4.25z"/>
                      </svg>
                      <div className="text-left">
                        <p className="text-xs">Download on</p>
                        <p className="text-sm font-semibold">App Store</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-xl text-white hover:bg-black transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zM14.5 12.5l-9.5 9.5L17.5 12zM14.5 11.5L5 2l12.5 9.5z"/>
                      </svg>
                      <div className="text-left">
                        <p className="text-xs">GET IT ON</p>
                        <p className="text-sm font-semibold">Google Play</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Dashboard Card - Glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-3xl">👨‍⚕️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">Doctor Dashboard</h3>
                  <p className="text-sm text-gray-700 font-semibold">Dr. Darren Elder</p>
                  <p className="text-xs text-gray-600">BDS, MDs - Oral & Maxillofacial Surgery</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-yellow-500/20 text-yellow-700 px-2 py-0.5 rounded-full">Dentist</span>
                    <span className="text-xs bg-green-500/20 text-green-700 px-2 py-0.5 rounded-full">$+ Exp</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-white/20">
                <div>
                  <p className="text-2xl font-bold text-gray-800">1300+</p>
                  <p className="text-xs text-gray-600">Total Patients</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">📅 March 16, 2023</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Search & Specialties */}
          <div className="space-y-6">
            
            {/* Search Card - Glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="text-center mb-4">
                <span className="text-3xl">🔍</span>
                <h3 className="text-xl font-bold text-gray-800 mt-2">Find Doctor</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Location (Ex: Chennai, etc)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city name..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital / Clinic
                  </label>
                  <input
                    type="text"
                    placeholder="GKN Hospital, Bangalore"
                    value={searchHospital}
                    onChange={(e) => setSearchHospital(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                  SEARCH NOW
                </button>
              </div>
            </div>

            {/* Specialties Card - Glassmorphism */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Specialties</h3>
                <Link 
                  href="/specialties"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  View All
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specialties.map((specialty, index) => (
                  <Link
                    key={index}
                    href={`/specialties/${specialty.name.toLowerCase()}`}
                    className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all hover:scale-105"
                  >
                    <span className="text-xl">{specialty.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{specialty.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/30">
            <p className="text-2xl font-bold text-gray-800">1,200+</p>
            <p className="text-xs text-gray-600">Expert Doctors</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/30">
            <p className="text-2xl font-bold text-gray-800">50+</p>
            <p className="text-xs text-gray-600">Specialties</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/30">
            <p className="text-2xl font-bold text-gray-800">24/7</p>
            <p className="text-xs text-gray-600">Availability</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/30">
            <p className="text-2xl font-bold text-gray-800">10K+</p>
            <p className="text-xs text-gray-600">Happy Patients</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}