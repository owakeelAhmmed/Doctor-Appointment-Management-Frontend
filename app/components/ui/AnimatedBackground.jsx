'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const floatingShapeVariants = {
    animate: (i) => ({
      x: [0, 30, 0, -30, 0],
      y: [0, -30, 0, 30, 0],
      rotate: [0, 90, 180, 270, 360],
      transition: {
        duration: 20 + i * 2,
        repeat: Infinity,
        ease: "linear"
      }
    })
  }

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a8e6cf', '#d4a5a5']

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={floatingShapeVariants}
          animate="animate"
          className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-20"
          style={{
            width: `${150 + i * 50}px`,
            height: `${150 + i * 50}px`,
            left: `${10 + i * 12}%`,
            top: `${5 + i * 15}%`,
            background: `radial-gradient(circle, ${colors[i]} 0%, transparent 70%)`,
          }}
        />
      ))}

      <motion.div
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 blur-3xl opacity-20"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
      />

      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 2px, transparent 0)',
        backgroundSize: '50px 50px'
      }} />
    </div>
  )
}