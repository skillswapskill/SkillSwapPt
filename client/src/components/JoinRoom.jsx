import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import VideoCall from './VideoCall'
import { useApi } from '../hooks/useApi'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{this.state.error?.message || "An unexpected error occurred"}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const JoinRoom = () => {
  const { sessionId } = useParams()
  const { user } = useUser()
  const navigate = useNavigate()

  const { get } = useApi()

  const [sessionData, setSessionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      navigate('/sign-in')
      return
    }

    if (!sessionId) {
      setError('Invalid session ID')
      setLoading(false)
      return
    }

    fetchSessionData()
  }, [user, sessionId, navigate])

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      console.log('Fetching session data for:', sessionId)

      // Try to fetch session data
      const response = await get(`/api/sessions/session/${sessionId}`)
      const session = response.data

      console.log('Session data loaded:', session)

      if (!session) {
        setError('Session not found. Please check if the session ID is correct.')
        setLoading(false)
        return
      }

      // ✅ SIMPLIFIED: Just allow access without complex authentication
      const sessionWithRole = {
        ...session,
        userRole: 'participant',
        canJoin: true
      }

      console.log('✅ Direct access granted')
      setSessionData(sessionWithRole)
      setLoading(false)

    } catch (error) {
      console.error('Failed to fetch session data:', error)

      if (error.response?.status === 404) {
        setError('Session not found.')
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again.')
      } else {
        setError('Failed to load meeting data. Please try again.')
      }

      setLoading(false)
    }
  }

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/my-learning')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2">Authenticating...</h2>
          <p className="text-gray-300">Please wait while we verify your identity</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-white text-center">
          <div className="animate-pulse mb-6">
            <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm3 2h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3">Loading Meeting Room</h2>
          <p className="text-gray-300 mb-2">Preparing your session...</p>
          <div className="flex justify-center">
            <div className="animate-bounce text-purple-400">●</div>
            <div className="animate-bounce text-purple-400 mx-1" style={{ animationDelay: '0.1s' }}>●</div>
            <div className="animate-bounce text-purple-400" style={{ animationDelay: '0.2s' }}>●</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-xl shadow-2xl border border-gray-200">
          <div className="text-red-500 text-8xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Unable to Load Meeting</h2>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 text-left">
            <p className="text-red-700 leading-relaxed">{error}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={fetchSessionData}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              🔄 Try Again
            </button>
            <button
              onClick={goBack}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="meeting-page relative">
        {/* Meeting Header - Repositioned to top-center to avoid logo conflict */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black bg-opacity-70 backdrop-blur-sm text-white px-6 py-3 rounded-xl shadow-lg border border-white border-opacity-20">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold text-lg">{sessionData?.skill || 'Meeting Room'}</h3>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span>Welcome: {user.firstName || user.username || "User"}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Video Call Component */}
        <VideoCall
          sessionId={sessionId}
          userId={user.id}
          userName={user.firstName || user.username || "User"}
          sessionData={sessionData}
        />

        {/* Exit Button */}
        <div className="absolute bottom-6 left-6 z-50">
          <button
            onClick={goBack}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🚪 Exit Meeting
          </button>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default JoinRoom
