'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CategorySection() {
  const [hoveredCard, setHoveredCard] = useState(null)

  const categories = [
    {
      id: 1,
      name: 'Cardiology',
      bnName: 'কার্ডিওলজি',
      icon: '❤️',
      doctors: 124,
      color: 'from-rose-500 to-pink-500',
      lightColor: 'text-rose-600',
      description: 'Heart specialists for cardiovascular care'
    },
    {
      id: 2,
      name: 'Neurology',
      bnName: 'নিউরোলজি',
      icon: '🧠',
      doctors: 89,
      color: 'from-purple-500 to-indigo-500',
      lightColor: 'text-purple-600',
      description: 'Brain and nervous system experts'
    },
    {
      id: 3,
      name: 'Orthopedics',
      bnName: 'অর্থোপেডিক্স',
      icon: '🦴',
      doctors: 156,
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'text-blue-600',
      description: 'Bone, joint & muscle specialists'
    },
    {
      id: 4,
      name: 'Pediatrics',
      bnName: 'পেডিয়াট্রিক্স',
      icon: '👶',
      doctors: 112,
      color: 'from-green-500 to-emerald-500',
      lightColor: 'text-green-600',
      description: 'Child healthcare specialists'
    },
    {
      id: 5,
      name: 'Ophthalmology',
      bnName: 'চক্ষু বিশেষজ্ঞ',
      icon: '👁️',
      doctors: 78,
      color: 'from-cyan-500 to-blue-500',
      lightColor: 'text-cyan-600',
      description: 'Eye care and vision specialists'
    },
    {
      id: 6,
      name: 'Dentistry',
      bnName: 'ডেন্টিস্ট্রি',
      icon: '🦷',
      doctors: 145,
      color: 'from-yellow-500 to-orange-500',
      lightColor: 'text-yellow-600',
      description: 'Dental care and oral health'
    },
    {
      id: 7,
      name: 'ENT',
      bnName: 'ইএনটি',
      icon: '👂',
      doctors: 67,
      color: 'from-indigo-500 to-purple-500',
      lightColor: 'text-indigo-600',
      description: 'Ear, nose & throat specialists'
    },
    {
      id: 8,
      name: 'General Medicine',
      bnName: 'জেনারেল মেডিসিন',
      icon: '🩺',
      doctors: 203,
      color: 'from-teal-500 to-emerald-500',
      lightColor: 'text-teal-600',
      description: 'Primary care & family medicine'
    }
  ]

  return (
    <div className="relative py-20 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      
      {/* Background Glass Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Glass Effect */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30 shadow-lg mb-4">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-semibold text-gray-700">Medical Specialties</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Browse by Category
            </span>
          </h2>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find the right specialist for your health needs from our network of expert doctors
          </p>
        </div>

        {/* Categories Grid - Glassmorphism Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const isHovered = hoveredCard === category.id
            
            return (
              <div
                key={category.id}
                className="group relative"
                onMouseEnter={() => setHoveredCard(category.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Glass Card */}
                <div className={`
                  relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 
                  border border-white/30 shadow-lg transition-all duration-500
                  hover:shadow-2xl hover:scale-105 cursor-pointer
                  ${isHovered ? 'bg-white/20 border-white/40' : ''}
                `}>
                  
                  {/* Icon Container with Glass Effect */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                    bg-gradient-to-br ${category.color} bg-opacity-20
                    transition-all duration-300 group-hover:scale-110
                    shadow-lg backdrop-blur-sm
                  `}>
                    <span className="text-3xl">{category.icon}</span>
                  </div>

                  {/* Category Info */}
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {category.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-2">
                    {category.bnName}
                  </p>
                  
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  
                  {/* Doctor Count Badge */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white/60"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-700 ml-2">
                        {category.doctors}+ Doctors
                      </span>
                    </div>
                    
                    <Link 
                      href={`/specialties/${category.name.toLowerCase()}`}
                      className={`
                        flex items-center gap-1 text-sm font-medium
                        ${category.lightColor} hover:gap-2 transition-all duration-300
                      `}
                    >
                      Browse
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className={`
                    absolute inset-0 rounded-2xl bg-gradient-to-r ${category.color} 
                    opacity-0 transition-opacity duration-500 -z-10 blur-xl
                    ${isHovered ? 'opacity-20' : ''}
                  `} />
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link 
            href="/all-specialties"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white/20 backdrop-blur-md rounded-full font-semibold text-gray-800 border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 group"
          >
            View All Specialties
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
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
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .group {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}