'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaApple, FaGooglePlay, FaStar, FaShieldAlt, FaClock, FaDownload } from 'react-icons/fa'
import { MdVerified, MdSecurity } from 'react-icons/md'

export default function AppDownloadSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    { icon: FaStar, text: '4.9 Rating', color: 'text-yellow-400' },
    { icon: MdVerified, text: 'Trusted by 50K+', color: 'text-green-400' },
    { icon: FaClock, text: '24/7 Support', color: 'text-blue-400' },
    { icon: MdSecurity, text: 'Secure & Safe', color: 'text-purple-400' },
  ]

  return (
    <div className="relative py-24 overflow-hidden">
      
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
      
      {/* Animated Glass Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Glass Card Container */}
        <div className={`
          relative rounded-3xl overflow-hidden
          bg-white/10 backdrop-blur-xl 
          border border-white/30 shadow-2xl
          transition-all duration-700
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}>
          
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 pointer-events-none" />
          
          {/* Content Grid */}
          <div className="relative grid lg:grid-cols-2 gap-12 items-center p-8 md:p-12 lg:p-16">
            
            {/* LEFT CONTENT */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 w-fit">
                <FaDownload className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Mobile App Available</span>
              </div>

              {/* Heading */}
              <div>
                <p className="text-white/80 text-sm mb-2 tracking-wide">
                  Working for Your Better Health
                </p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Download the Doccure
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                    App today!
                  </span>
                </h2>
              </div>

              {/* Description */}
              <p className="text-white/80 text-base leading-relaxed">
                Get instant access to quality healthcare services. Book appointments, 
                consult with top doctors, and manage your health journey all in one place.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20"
                    >
                      <Icon className={`w-4 h-4 ${feature.color}`} />
                      <span className="text-sm font-medium text-white">{feature.text}</span>
                    </div>
                  )
                })}
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {/* App Store Button */}
                <Link 
                  href="#"
                  className="group relative overflow-hidden flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 hover:bg-black/80 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FaApple className="text-2xl text-white" />
                  <div className="text-left">
                    <p className="text-xs text-white/70">Download on</p>
                    <p className="text-base font-semibold text-white">App Store</p>
                  </div>
                </Link>

                {/* Google Play Button */}
                <Link 
                  href="#"
                  className="group relative overflow-hidden flex items-center gap-3 bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/30 hover:bg-black/80 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <FaGooglePlay className="text-xl text-white" />
                  <div className="text-left">
                    <p className="text-xs text-white/70">GET IT ON</p>
                    <p className="text-base font-semibold text-white">Google Play</p>
                  </div>
                </Link>
              </div>

              {/* QR Code Section */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">QR</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white/70">Scan to download</p>
                  <p className="text-sm font-medium text-white">Get the app in seconds</p>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT - Phone Images */}
            <div className="relative flex items-center justify-center">
              
              {/* Background Glow */}
              <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
              
              {/* Decorative Circles */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />

              {/* Phone Images Container */}
              <div className="relative flex gap-8 justify-center items-center">
                
                {/* Phone 1 - Left */}
                <div className="relative transform -rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl" />
                  <Image
                    src="/phone1.png"
                    alt="Doccure App Screen 1"
                    width={240}
                    height={480}
                    className="rounded-3xl shadow-2xl border border-white/30"
                    priority
                  />
                  {/* Glass Reflection */}
                  <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl" />
                </div>

                {/* Phone 2 - Right */}
                <div className="relative transform translate-y-8 rotate-6 hover:rotate-0 transition-all duration-500 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl" />
                  <Image
                    src="/phone2.png"
                    alt="Doccure App Screen 2"
                    width={240}
                    height={480}
                    className="rounded-3xl shadow-2xl border border-white/30"
                  />
                  {/* Glass Reflection */}
                  <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/20 to-transparent rounded-t-3xl" />
                </div>

              </div>

              {/* Floating Badge - Top */}
              <div className="absolute -top-6 -right-6 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg animate-bounce">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-semibold text-white">4.9/5 Rating</span>
                </div>
              </div>

              {/* Floating Badge - Bottom */}
              <div className="absolute -bottom-6 -left-6 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-sm font-semibold text-white">1M+ Downloads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
        </div>

        {/* Stats Section Below */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-white">50K+</p>
            <p className="text-xs text-white/70">Active Users</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-white">500+</p>
            <p className="text-xs text-white/70">Expert Doctors</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-white">24/7</p>
            <p className="text-xs text-white/70">Online Support</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
            <p className="text-2xl font-bold text-white">10K+</p>
            <p className="text-xs text-white/70">App Downloads</p>
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
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}