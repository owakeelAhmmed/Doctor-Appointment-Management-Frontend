'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn, 
  FaYoutube,
  FaApple, 
  FaGooglePlay,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaArrowRight,
  FaHeart,
  FaShieldAlt,
  FaStethoscope
} from 'react-icons/fa'
import { MdVerified, MdLocalHospital } from 'react-icons/md'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Doctors', href: '/doctors' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'Specialties', href: '/specialties' },
    { name: 'Health Blog', href: '/blog' },
    { name: 'Contact Us', href: '/contact' },
  ]

  const services = [
    { name: 'Cardiology', href: '/specialties/cardiology' },
    { name: 'Neurology', href: '/specialties/neurology' },
    { name: 'Orthopedics', href: '/specialties/orthopedics' },
    { name: 'Pediatrics', href: '/specialties/pediatrics' },
    { name: 'Dentistry', href: '/specialties/dentistry' },
    { name: 'Emergency Care', href: '/emergency' },
  ]

  const socialIcons = [
    { icon: FaFacebookF, href: 'https://facebook.com', color: 'hover:bg-blue-600' },
    { icon: FaTwitter, href: 'https://twitter.com', color: 'hover:bg-blue-400' },
    { icon: FaInstagram, href: 'https://instagram.com', color: 'hover:bg-pink-600' },
    { icon: FaLinkedinIn, href: 'https://linkedin.com', color: 'hover:bg-blue-700' },
    { icon: FaYoutube, href: 'https://youtube.com', color: 'hover:bg-red-600' },
  ]

  return (
    <footer className="relative pt-20 pb-8 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1 - Brand & Description */}
          <div className="lg:col-span-4 space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaStethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Doccure</h2>
                <p className="text-xs text-white/60">Healthcare Simplified</p>
              </div>
            </div>

            <p className="text-white/70 text-sm leading-relaxed">
              Your trusted partner in healthcare. We connect you with top-rated doctors, 
              provide quality medical services, and make healthcare accessible to everyone.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                <MdVerified className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white/80">ISO Certified</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
                <FaShieldAlt className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-white/80">HIPAA Compliant</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/80">Follow Us</p>
              <div className="flex gap-3">
                {socialIcons.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`
                        w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm 
                        flex items-center justify-center text-white/70
                        hover:text-white transition-all duration-300 hover:scale-110
                        ${social.color}
                      `}
                    >
                      <Icon className="w-4 h-4" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Quick Links
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-all duration-300 flex items-center gap-2 group"
                  >
                    <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Services */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-white relative inline-block">
              Our Services
              <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            </h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link 
                    href={service.href}
                    className="text-white/60 hover:text-white text-sm transition-all duration-300 flex items-center gap-2 group"
                  >
                    <MdLocalHospital className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact & Newsletter */}
          <div className="lg:col-span-4 space-y-6">
            {/* Contact Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white relative inline-block">
                Get in Touch
                <div className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <FaMapMarkerAlt className="w-4 h-4" />
                  </div>
                  <span>123 Healthcare Ave, Medical District, NY 10001</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <FaPhoneAlt className="w-4 h-4" />
                  </div>
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <FaEnvelope className="w-4 h-4" />
                  </div>
                  <span>support@doccure.com</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <FaClock className="w-4 h-4" />
                  </div>
                  <span>24/7 Emergency Support</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Newsletter</h3>
              <p className="text-white/60 text-sm">Subscribe for health tips & updates</p>
              
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-3 pr-28 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-blue-400 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                >
                  Subscribe
                </button>
              </form>
              
              {subscribed && (
                <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-2 text-center animate-fade-in">
                  <p className="text-green-400 text-xs">✓ Subscribed successfully!</p>
                </div>
              )}
            </div>

            {/* App Download Buttons */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/80">Download App</p>
              <div className="flex flex-wrap gap-3">
                <Link 
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-black/60 transition-all group"
                >
                  <FaApple className="text-white text-xl" />
                  <div>
                    <p className="text-[10px] text-white/60">Download on</p>
                    <p className="text-xs font-semibold text-white">App Store</p>
                  </div>
                </Link>
                <Link 
                  href="#"
                  className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-black/60 transition-all group"
                >
                  <FaGooglePlay className="text-white text-lg" />
                  <div>
                    <p className="text-[10px] text-white/60">GET IT ON</p>
                    <p className="text-xs font-semibold text-white">Google Play</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} Doccure. All rights reserved.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center">
            <Link href="/privacy" className="text-white/50 hover:text-white text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/50 hover:text-white text-xs transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-white/50 hover:text-white text-xs transition-colors">
              Cookie Policy
            </Link>
            <Link href="/sitemap" className="text-white/50 hover:text-white text-xs transition-colors">
              Sitemap
            </Link>
          </div>
          
          <p className="text-white/40 text-xs flex items-center gap-1">
            Made with <FaHeart className="w-3 h-3 text-red-400 animate-pulse" /> for better health
          </p>
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
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </footer>
  )
}