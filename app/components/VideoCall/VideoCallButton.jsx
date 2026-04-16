// app/components/VideoCall/VideoCallButton.jsx
'use client'

import { useState } from 'react'
import { Video } from 'lucide-react'
import dynamic from 'next/dynamic'

const JitsiMeeting = dynamic(() => import('./JitsiMeeting'), { 
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4" />
        <p>Loading video call...</p>
      </div>
    </div>
  )
})

export default function VideoCallButton({ appointment, userName, userRole }) {
  const [showCall, setShowCall] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const startCall = () => {
    setIsLoading(true)
    try {
      setShowCall(true)
    } catch (error) {
      console.error('Failed to start call:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canStartCall = () => {
    // Check if meeting link exists
    if (!appointment.meetingLink) return false
    
    const appointmentTime = new Date(appointment.appointmentDate)
    const [hours, minutes] = appointment.startTime.split(':')
    appointmentTime.setHours(parseInt(hours), parseInt(minutes), 0)
    
    const now = new Date()
    const timeDiff = (appointmentTime - now) / (1000 * 60)
    
    // Can join 10 minutes before and 30 minutes after appointment time
    return timeDiff <= 10 && timeDiff >= -30
  }

  const isCallAvailable = canStartCall()
  const meetingLink = appointment.meetingLink
  
  // Extract room name from meeting link
  const getRoomNameFromLink = (link) => {
    if (!link) return ''
    const parts = link.split('/')
    return parts[parts.length - 1]
  }

  const roomName = getRoomNameFromLink(meetingLink)

  if (!meetingLink) {
    return null
  }

  return (
    <>
      <button
        onClick={startCall}
        disabled={isLoading || !isCallAvailable || !meetingLink}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          isCallAvailable && meetingLink
            ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        title={!meetingLink ? 'Video link not available' : !isCallAvailable ? 'Call available 10 minutes before appointment' : ''}
      >
        <Video className="w-4 h-4" />
        {isLoading ? 'Starting...' : 'Join Video Call'}
      </button>

      {showCall && meetingLink && (
        <JitsiMeeting
          roomName={roomName}
          displayName={userName}
          meetingLink={meetingLink}
          onClose={() => setShowCall(false)}
        />
      )}
    </>
  )
}