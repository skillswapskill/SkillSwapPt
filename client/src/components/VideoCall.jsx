import React, { useState, useRef, useEffect } from "react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useApi } from '../hooks/useApi'

const VideoCall = ({ sessionId, userId, userName, sessionData }) => {
  const [jitsiApi, setJitsiApi] = useState(null)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const jitsiContainerRef = useRef(null)
  const { post } = useApi()

  useEffect(() => {
    // Load Jitsi Script
    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve()
          return
        }
        const script = document.createElement('script')
        script.src = 'https://meet.ffmuc.net/external_api.js'
        script.async = true
        script.onload = resolve
        document.body.appendChild(script)
      })
    }

    loadJitsiScript().then(() => {
      initializeJitsi()
    })

    return () => {
      if (jitsiApi) {
        jitsiApi.dispose()
      }
    }
  }, [])

  const initializeJitsi = () => {
    if (!jitsiContainerRef.current) return

    const domain = 'meet.ffmuc.net' // Using a community instance to avoid the 'Moderator Login' requirement of meet.jit.si
    const sanitizedSessionId = sessionId.replace(/\s+/g, '_')
    const options = {
      roomName: `SkillSwap_Session_${sanitizedSessionId}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      userInfo: {
        displayName: userName || 'Skill Swapper',
      },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        p2p: { enabled: true }, // Optimization for 1-on-1 calls
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'desktop', 'fullscreen',
          'hangup', 'videoquality', 'participants-pane',
          'chat', 'raisehand', 'settings', 'tileview'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Learner',
        RECENT_LIST_ENABLED: false,
        SETTINGS_SECTIONS: ['devices', 'language', 'profile'],
      },
    }

    const api = new window.JitsiMeetExternalAPI(domain, options)

    // Event Listeners with spam protection
    let lastLeftTime = 0
    api.addEventListeners({
      videoConferenceJoined: () => {
        console.log("✅ Joined Jitsi Meeting")
        handleMeetingStart()
      },
      videoConferenceLeft: () => {
        console.log("🚪 Left Jitsi Meeting")
        handleMeetingEnd()
      },
      participantJoined: (participant) => {
        // Only one join message
        toast.info(`${participant.displayName || 'Someone'} joined the session`, { toastId: 'join-alert' })
      },
      participantLeft: (participant) => {
        const now = Date.now()
        // Prevent multiple "left" alerts within a short window
        if (now - lastLeftTime > 5000) {
          toast.info(`${participant.displayName || 'Someone'} left the session`, { toastId: 'left-alert' })
          lastLeftTime = now
        }
      },
      screenSharingStatusChanged: (data) => {
        if (data.on) {
          toast.success("Screen sharing active")
        }
      }
    })

    setJitsiApi(api)
  }

  const handleMeetingStart = async () => {
    if (meetingStarted) return
    try {
      await post('/api/sessions/start-meeting', { sessionId })
      setMeetingStarted(true)
      toast.success("Session started - Learning in progress!", {
        position: "top-right",
        autoClose: 3000
      })
    } catch (error) {
      console.error("Error starting meeting tracking:", error)
    }
  }

  const handleMeetingEnd = async () => {
    try {
      await post('/api/sessions/end-meeting', { sessionId })
      toast.success("Session completed and credits processed!")
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 2000)
    } catch (error) {
      console.error("Error ending meeting tracking:", error)
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="video-call-container" style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <ToastContainer position="top-center" />
      <div
        ref={jitsiContainerRef}
        style={{ width: '100%', height: '100%' }}
      />


    </div>
  )
}

export default VideoCall
