// app/components/VideoCall/JitsiMeeting.jsx
'use client'

import { useEffect, useRef } from 'react'

export default function JitsiMeeting({ roomName, displayName, meetingLink, onClose }) {
  const containerRef = useRef(null)
  const apiRef = useRef(null)

  useEffect(() => {
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve()
          return
        }
        
        const script = document.createElement('script')
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }

    const initJitsi = async () => {
      try {
        await loadJitsiScript()
        
        const domain = 'meet.jit.si'
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: containerRef.current,
          userInfo: {
            displayName: displayName,
          },
          configOverwrite: {
            startWithAudioMuted: true,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
          },
        }
        
        const api = new window.JitsiMeetExternalAPI(domain, options)
        apiRef.current = api
        
        api.addEventListener('videoConferenceLeft', () => {
          onClose()
        })
        
        api.addEventListener('videoConferenceJoined', () => {
          console.log(`${displayName} joined the conference`)
        })
        
      } catch (error) {
        console.error('Failed to load Jitsi:', error)
      }
    }

    if (roomName) {
      initJitsi()
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose()
      }
    }
  }, [roomName, displayName, onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
        >
          End Call
        </button>
      </div>
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}