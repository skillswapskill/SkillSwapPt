import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import VideoCall from './VideoCall';

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
      const response = await axios.get(`http://localhost:5000/api/sessions/${sessionId}`);
      const session = response.data;
      
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
      setError('Failed to load meeting data. Please try again.');
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
          <button
            onClick={goBack}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            ← Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meeting-page">
      {/* Meeting Header - Optional overlay */}
      <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
        <h3 className="font-semibold">{sessionData?.skill}</h3>
        <p className="text-sm opacity-75">
          Teacher: {sessionData?.teacher?.name || 'Unknown'}
        </p>
        <button
          onClick={goBack}
          className="mt-2 text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
        >
          Leave Meeting
        </button>
      </div>

      {/* Video Call Component */}
      <VideoCall 
        sessionId={sessionId}
        userId={user.id}
        userName={user.firstName || user.username || 'Student'}
      />
    </div>
  );
};

export default JoinRoom;
