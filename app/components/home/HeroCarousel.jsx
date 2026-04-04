'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, 
  Search, 
  Clock, 
  Star, 
  Shield, 
  Video, 
  ArrowRight,
  Stethoscope,
  MapPin,
  Phone,
  Award,
  Users,
  Headphones
} from 'lucide-react'

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        <div className="absolute bottom-40 right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-6000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Glassmorphism Content */}
          <div className="space-y-8">
            {/* Glass Trust Badge */}
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/30 shadow-lg">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-800">Trusted by 50,000+ patients</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            </div>

            {/* Main Heading with Glass Effect */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Find & Book
                </span>
                <br />
                <span className="text-gray-800">Doctor Appointments</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
                  Instantly
                </span>
              </h1>
              <p className="text-lg text-gray-700 max-w-lg backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                Connect with top-rated doctors, book same-day appointments, 
                and get quality healthcare from the comfort of your home.
              </p>
            </div>

            {/* Glass Search Bar */}
            <div className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Search doctors, specialties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-gray-500"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
                  <input
                    type="text"
                    placeholder="Your location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/30 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all placeholder:text-gray-500"
                  />
                </div>
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2">
                  Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Glass Quick Actions */}
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/appointments/book"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full font-medium text-gray-800 border border-white/30 hover:bg-white/30 transition-all hover:scale-105"
              >
                <Calendar className="w-4 h-4" />
                Schedule Appointment
              </Link>
              <Link 
                href="/video-consult"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full font-medium text-gray-800 border border-white/30 hover:bg-white/30 transition-all hover:scale-105"
              >
                <Video className="w-4 h-4" />
                Video Consult
              </Link>
              <Link 
                href="/emergency"
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md rounded-full font-medium text-gray-800 border border-white/30 hover:bg-white/30 transition-all hover:scale-105"
              >
                <Phone className="w-4 h-4" />
                24/7 Emergency
              </Link>
            </div>

            {/* Glass Stats */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/30">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-2xl font-bold text-gray-800">500+</p>
                <p className="text-sm text-gray-700">Expert Doctors</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-2xl font-bold text-gray-800">50K+</p>
                <p className="text-sm text-gray-700">Happy Patients</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                <p className="text-2xl font-bold text-gray-800">24/7</p>
                <p className="text-sm text-gray-700">Online Support</p>
              </div>
            </div>
          </div>

          {/* Right Side - Glassmorphism Image Cards */}
          <div className="relative">
            {/* Main Glass Card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
              <div className="relative h-[500px]">
                <Image
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&h=500&fit=crop"
                  alt="Doctor consultation"
                  fill
                  className="object-cover opacity-90"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              
              {/* Glass Floating Appointment Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500/30 backdrop-blur rounded-full flex items-center justify-center border border-green-500/50">
                      <Clock className="w-4 h-4 text-green-700" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">Next Available</span>
                  </div>
                  <span className="text-xs text-green-700 bg-green-500/30 backdrop-blur px-2 py-1 rounded-full border border-green-500/50">Today</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">Dr. Sarah Johnson</p>
                    <p className="text-xs text-gray-700">Cardiologist • 15 min wait</p>
                  </div>
                  <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition">
                    Book Now
                  </button>
                </div>
              </div>
            </div>

            {/* Glass Floating Elements */}
            <div className="absolute -top-8 -right-8 bg-white/20 backdrop-blur-xl rounded-2xl p-4 border border-white/30 shadow-xl">
              <div className="text-gray-800">
                <p className="text-2xl font-bold">98%</p>
                <p className="text-xs">Satisfaction Rate</p>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 bg-white/20 backdrop-blur-xl rounded-2xl p-3 border border-white/30 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/40 backdrop-blur border-2 border-white/60" />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-800">2,500+ booked</p>
                  <p className="text-xs text-gray-700">today</p>
                </div>
              </div>
            </div>

            {/* Small Glass Badge */}
            <div className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white/20 backdrop-blur-xl rounded-full px-4 py-2 border border-white/30 shadow-lg hidden lg:flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-medium text-gray-800">Top Rated Doctors</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  )
}