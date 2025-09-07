import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import VideoCall from './VideoCall';

// Import the dynamic API client
import { apiClient } from '../config/api';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const JoinRoom = () => {
  const { sessionId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
      return;
    }

    if (!sessionId) {
      setError('Invalid session ID');
      setLoading(false);
      return;
    }

    fetchSessionData();
  }, [user, sessionId, navigate]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching session data for:', sessionId);
      
      // Using apiClient instead of hardcoded localhost URL
      const response = await apiClient.get(`/api/sessions/${sessionId}`);
      const session = response.data;
      
      console.log('✅ Session data loaded:', session);
      
      // Check if meeting time is valid
      const now = new Date();
      const scheduledTime = new Date(session.dateTime);
      const meetingEndTime = new Date(scheduledTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours after start
      
      if (now < scheduledTime) {
        setError('Meeting has not started yet. Please join at the scheduled time.');
        setLoading(false);
        return;
      }
      
      if (now > meetingEndTime) {
        setError('This meeting has ended.');
        setLoading(false);
        return;
      }
      
      setSessionData(session);
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch session data:', error);
      setError(`Failed to load meeting data: ${error.message || 'Please try again.'}`);
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/my-learning');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading user...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Join Meeting</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={fetchSessionData}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              🔄 Retry
            </button>
            <button
              onClick={goBack}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              ← Back to My Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="meeting-page">
        {/* Optional: Meeting Header */}
        {/* <div className="absolute top-6 left-6 z-50 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
          <h3 className="font-semibold">{sessionData?.skill}</h3>
          <p className="text-sm opacity-75">
            Teacher: {sessionData?.teacher?.name || 'Unknown'}
          </p>
        </div> */}

        {/* Video Call Component */}
        <VideoCall 
          sessionId={sessionId}
          userId={user.id}
          userName={user.firstName || user.username || 'Student'}
          sessionData={sessionData}
        />
      </div>
    </ErrorBoundary>
  );
};

export default JoinRoom;
