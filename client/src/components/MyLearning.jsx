import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from '../config/api';

const MyLearning = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [learningSessions, setLearningSessions] = useState([]);
  const [teachingSessions, setTeachingSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("learning");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [deletingSession, setDeletingSession] = useState(null);
  const [meetingTimers, setMeetingTimers] = useState(new Map());

  useEffect(() => {
    if (!user) return;

    if (!user.publicMetadata?.mongoId) {
      syncUserMetadata();
    } else {
      fetchAllSessions(user.publicMetadata.mongoId);
    }

    // Check for any meetings that were left while app was closed
    checkForMissedMeetingEnds();
  }, [user]);

  // Check for missed meeting ends on app load
  const checkForMissedMeetingEnds = () => {
    const keys = Object.keys(localStorage);
    const meetingLeftKeys = keys.filter(key => key.startsWith('meeting-left-'));
    
    meetingLeftKeys.forEach(key => {
      const sessionId = key.replace('meeting-left-', '');
      const leftTime = parseInt(localStorage.getItem(key));
      const now = Date.now();
      const timeSinceLeft = now - leftTime;
      
      if (timeSinceLeft >= 5 * 60 * 1000) { // 5 minutes passed
        // Delete immediately
        console.log("🗑️ Auto-deleting missed session:", sessionId);
        deleteCompletedSession(sessionId);
        localStorage.removeItem(key);
      } else {
        // Schedule deletion for remaining time
        const remainingTime = (5 * 60 * 1000) - timeSinceLeft;
        console.log(`⏰ Scheduling deletion for session ${sessionId} in ${remainingTime/1000}s`);
        setTimeout(() => {
          deleteCompletedSession(sessionId);
          localStorage.removeItem(key);
        }, remainingTime);
      }
    });
  };

  const syncUserMetadata = async () => {
    try {
      setSyncing(true);
      console.log("🔄 Syncing user metadata for:", user.id);
      
      await apiClient.post("/api/users/sync-metadata", {
        clerkId: user.id
      });
      
      window.location.reload();
    } catch (error) {
      console.error("❌ Metadata sync failed:", error);
      setError("Failed to sync user metadata");
      setLoading(false);
      setSyncing(false);
    }
  };

  // Enhanced fetch function with better error handling and logging
  const fetchAllSessions = async (mongoUserId) => {
    try {
      console.log("✅ Fetching all sessions for Mongo ID:", mongoUserId);
      setLoading(true);
      setError(null);
      
      // Fetch learning sessions
      try {
        console.log("📚 Fetching learning sessions...");
        const learningRes = await apiClient.get(`/api/sessions/subscribed-by-mongo/${mongoUserId}`);
        
        console.log("📚 Learning sessions response:", learningRes.data);
        
        // Handle both array and object responses
        let learningData = [];
        if (Array.isArray(learningRes.data)) {
          learningData = learningRes.data;
        } else if (learningRes.data?.sessions && Array.isArray(learningRes.data.sessions)) {
          learningData = learningRes.data.sessions;
        } else if (learningRes.data?.success && Array.isArray(learningRes.data?.data)) {
          learningData = learningRes.data.data;
        }
        
        const sortedLearning = learningData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        setLearningSessions(sortedLearning);
        console.log("✅ Learning sessions set:", sortedLearning.length);
      } catch (learningError) {
        console.error("❌ Failed to fetch learning sessions:", learningError);
        setLearningSessions([]);
      }
      
      // Fetch teaching sessions with enhanced error handling
      try {
        console.log("🎯 Fetching teaching sessions...");
        const teachingRes = await apiClient.get(`/api/sessions/teaching/${mongoUserId}`);
        
        console.log("🎯 Teaching sessions response:", teachingRes);
        console.log("🎯 Teaching sessions data:", teachingRes.data);
        
        // Handle both array and object responses
        let teachingData = [];
        if (Array.isArray(teachingRes.data)) {
          teachingData = teachingRes.data;
        } else if (teachingRes.data?.sessions && Array.isArray(teachingRes.data.sessions)) {
          teachingData = teachingRes.data.sessions;
        } else if (teachingRes.data?.success && Array.isArray(teachingRes.data?.data)) {
          teachingData = teachingRes.data.data;
        }
        
        const sortedTeaching = teachingData.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        setTeachingSessions(sortedTeaching);
        console.log("✅ Teaching sessions set:", sortedTeaching.length);
      } catch (teachingError) {
        console.error("❌ Failed to fetch teaching sessions:", teachingError);
        console.error("Teaching error details:", {
          status: teachingError.response?.status,
          statusText: teachingError.response?.statusText,
          data: teachingError.response?.data,
          url: teachingError.config?.url,
          message: teachingError.message
        });
        setTeachingSessions([]);
      }
      
    } catch (error) {
      console.error("❌ Failed to load sessions:", error);
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  // Session deletion function - matches your backend route
  const deleteCompletedSession = async (sessionId) => {
    try {
      setDeletingSession(sessionId);
      console.log("🗑️ Deleting completed session:", sessionId);
      
      // API call matching your backend route: /delete/:sessionId
      const response = await apiClient.delete(`/api/sessions/delete/${sessionId}`);
      
      if (response.status === 200) {
        console.log("✅ Session deleted successfully");
        
        // Remove the session from local state
        setLearningSessions(prev => prev.filter(session => session._id !== sessionId));
        setTeachingSessions(prev => prev.filter(session => session._id !== sessionId));
        
        // Clean up any related localStorage
        localStorage.removeItem(`meeting-left-${sessionId}`);
        
        console.log("Session removed from UI");
        
      } else {
        throw new Error('Failed to delete session');
      }
      
    } catch (error) {
      console.error("❌ Failed to delete session:", error);
      setError("Failed to delete session. Please try again.");
    } finally {
      setDeletingSession(null);
    }
  };

  // Alternative: Mark session as completed instead of deleting
  const markSessionAsCompleted = async (sessionId) => {
    try {
      setDeletingSession(sessionId);
      console.log("✅ Marking session as completed:", sessionId);
      
      // Update session status to completed
      const response = await apiClient.patch(`/api/sessions/${sessionId}`, {
        status: 'Completed'
      });
      
      if (response.status === 200) {
        console.log("✅ Session marked as completed");
        
        // Update local state
        setLearningSessions(prev => 
          prev.map(session => 
            session._id === sessionId 
              ? { ...session, status: 'Completed' }
              : session
          )
        );
        setTeachingSessions(prev => 
          prev.map(session => 
            session._id === sessionId 
              ? { ...session, status: 'Completed' }
              : session
          )
        );
      }
      
    } catch (error) {
      console.error("❌ Failed to mark session as completed:", error);
      setError("Failed to update session status.");
    } finally {
      setDeletingSession(null);
    }
  };

  // Start monitoring for when user leaves meeting
  const startMeetingEndMonitoring = (sessionId) => {
    console.log("🔍 Starting meeting end monitoring for:", sessionId);
    
    let meetingEndTimer = null;
    let isInMeeting = true;
    let checkInterval = null;
    
    const checkIfUserLeftMeeting = () => {
      const isOnMeetingPage = window.location.pathname.includes(`/join-room/${sessionId}`);
      
      if (!isOnMeetingPage && isInMeeting) {
        console.log("👋 User left meeting:", sessionId);
        onUserLeftMeeting(sessionId);
        isInMeeting = false;
        
        // Clean up interval
        if (checkInterval) {
          clearInterval(checkInterval);
        }
      }
    };
    
    const onUserLeftMeeting = (sessionId) => {
      console.log("⏰ Starting 5-minute deletion timer for:", sessionId);
      
      // Store in localStorage for persistence across browser closes
      localStorage.setItem(`meeting-left-${sessionId}`, Date.now().toString());
      
      // Start 5-minute deletion timer
      meetingEndTimer = setTimeout(async () => {
        try {
          await deleteCompletedSession(sessionId);
          console.log("✅ Session auto-deleted after 5 minutes");
        } catch (error) {
          console.error("❌ Failed to auto-delete session:", error);
        }
      }, 5 * 60 * 1000); // 5 minutes
      
      // Clean up listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    
    const handleVisibilityChange = () => {
      // Check when page becomes visible again
      if (!document.hidden) {
        checkIfUserLeftMeeting();
      }
    };
    
    const handleBeforeUnload = () => {
      if (isInMeeting) {
        console.log("👋 User leaving meeting via browser close/navigate");
        // Store the time when user left
        localStorage.setItem(`meeting-left-${sessionId}`, Date.now().toString());
      }
    };
    
    // Set up monitoring
    checkInterval = setInterval(checkIfUserLeftMeeting, 5000); // Check every 5 seconds
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Store timer info
    setMeetingTimers(prev => new Map(prev.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      checkInterval,
      meetingEndTimer
    })));
  };

  const handleJoinMeeting = async (session) => {
    const now = new Date();
    const scheduledTime = new Date(session.dateTime);
    
    if (now >= scheduledTime) {
      try {
        // Navigate to the meeting room first
        navigate(`/join-room/${session._id}`);
        
        // Mark as completed when joining
        await markSessionAsCompleted(session._id);
        
        // Start monitoring for when user leaves meeting
        startMeetingEndMonitoring(session._id);
        
      } catch (error) {
        console.error("❌ Error handling meeting join:", error);
      }
    } else {
      const timeUntilStart = scheduledTime.getTime() - now.getTime();
      const minutesUntilStart = Math.ceil(timeUntilStart / (1000 * 60));
      alert(`Meeting hasn't started yet. Please wait ${minutesUntilStart} more minutes until ${scheduledTime.toLocaleTimeString()}.`);
    }
  };

  // Clean up timers on component unmount
  useEffect(() => {
    return () => {
      meetingTimers.forEach(timer => {
        if (timer.checkInterval) {
          clearInterval(timer.checkInterval);
        }
        if (timer.meetingEndTimer) {
          clearTimeout(timer.meetingEndTimer);
        }
      });
    };
  }, [meetingTimers]);

  // Get current tab data
  const getCurrentSessions = () => {
    return activeTab === "learning" ? learningSessions : teachingSessions;
  };

  // Get appropriate button text and styling
  const getSessionButton = (session) => {
    if (activeTab === "learning") {
      return {
        text: "🚀 Join Meeting",
        handler: () => handleJoinMeeting(session),
        className: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
      };
    } else {
      return {
        text: "👥 Start Teaching",
        handler: () => handleJoinMeeting(session),
        className: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
      };
    }
  };

  // Get appropriate participant info
  const getParticipantInfo = (session) => {
    if (activeTab === "learning") {
      return {
        label: "Instructor",
        name: session.teacher?.name || "Unknown Instructor",
        icon: "👨‍🏫"
      };
    } else {
      return {
        label: "Student",
        name: session.learner?.name || "Unknown Student",
        icon: "👨‍🎓"
      };
    }
  };

  // Check if session is past due
  const isSessionPastDue = (session) => {
    const now = new Date();
    const scheduledTime = new Date(session.dateTime);
    return now >= scheduledTime;
  };

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <br />
        <br />
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📘 My Sessions</h1>
        <p className="text-center text-gray-500">Loading user...</p>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <br />
        <br />
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📘 My Sessions</h1>
        <p className="text-center text-blue-500">🔄 Syncing user profile...</p>
      </div>
    );
  }

  const currentSessions = getCurrentSessions();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <br />
      <br />
      <h1 className="text-2xl font-bold mb-8 text-center text-blue-600">📘 My Sessions</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">⚠️ Error</h3>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => {
                setError(null);
                fetchAllSessions(user.publicMetadata?.mongoId);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setActiveTab("learning")}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "learning"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            📚 My Learning ({learningSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("teaching")}
            className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
              activeTab === "teaching"
                ? "bg-green-600 text-white shadow-md"
                : "text-gray-600 hover:text-green-600"
            }`}
          >
            🎯 My Teaching ({teachingSessions.length})
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading sessions...</p>
      ) : currentSessions.length === 0 ? (
        <div className="text-center text-gray-500">
          <p className="text-lg mb-4">
            {activeTab === "learning" 
              ? "No learning sessions yet." 
              : "No teaching sessions booked yet."
            }
          </p>
          <p className="text-sm">
            {activeTab === "learning" 
              ? "Book a session from the dashboard to start learning!" 
              : "Students will appear here when they book your sessions."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {currentSessions.map((session) => {
            const buttonConfig = getSessionButton(session);
            const participantInfo = getParticipantInfo(session);
            const isDeleting = deletingSession === session._id;
            const isPastDue = isSessionPastDue(session);
            const hasScheduledDeletion = localStorage.getItem(`meeting-left-${session._id}`);
            
            return (
              <div
                key={session._id}
                className={`bg-white rounded-lg shadow-lg p-6 border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  isDeleting ? 'opacity-50' : ''
                } ${session.status === 'Completed' ? 'border-l-4 border-l-blue-500' : ''} ${
                  hasScheduledDeletion ? 'border-l-4 border-l-orange-500' : ''
                }`}
              >
                {/* Session Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-blue-900 mb-2">
                    {session.skill || session.name || 'Unknown Session'}
                  </h2>
                  <div className={`w-full h-1 rounded-full ${
                    activeTab === "learning" 
                      ? "bg-gradient-to-r from-blue-500 to-green-500"
                      : "bg-gradient-to-r from-green-500 to-blue-500"
                  }`}></div>
                </div>

                {/* Session Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <span className="text-blue-500 mr-2">📅</span>
                    <span className="text-sm">
                      {new Date(session.dateTime).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <span className="text-green-500 mr-2">⏰</span>
                    <span className="text-sm">
                      {new Date(session.dateTime).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <span className="text-purple-500 mr-2">{participantInfo.icon}</span>
                    <span className="text-sm">
                      {participantInfo.label}: {participantInfo.name}
                    </span>
                  </div>

                  {session.creditsUsed && (
                    <div className="flex items-center text-gray-600">
                      <span className="text-orange-500 mr-2">💰</span>
                      <span className="text-sm">
                        Credits: {session.creditsUsed}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    session.status === 'Scheduled' 
                      ? 'bg-green-100 text-green-800' 
                      : session.status === 'Completed' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {session.status || 'Scheduled'}
                  </span>
                  
                  {/* Role indicator */}
                  <span className={`ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === "learning"
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {activeTab === "learning" ? "Student" : "Teacher"}
                  </span>

                  {/* Time indicator */}
                  {isPastDue && session.status !== 'Completed' && (
                    <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      Ready to Join
                    </span>
                  )}

                  {/* Auto-delete indicator */}
                  {hasScheduledDeletion && (
                    <span className="ml-2 inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      🗑️ Auto-Delete Scheduled
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {/* Main Action Button */}
                  <button
                    onClick={buttonConfig.handler}
                    disabled={isDeleting || session.status === 'Completed'}
                    className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] shadow-md hover:shadow-lg ${
                      session.status === 'Completed' 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : !isPastDue 
                        ? 'bg-gray-500 cursor-not-allowed'
                        : buttonConfig.className
                    } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isDeleting ? '⏳ Processing...' : 
                     session.status === 'Completed' ? '✅ Completed' :
                     !isPastDue ? '⏳ Not Started' : 
                     buttonConfig.text}
                  </button>
                  
                  {/* Manual Delete Button for completed sessions */}
                  {session.status === 'Completed' && (
                    <button
                      onClick={() => deleteCompletedSession(session._id)}
                      disabled={isDeleting}
                      className="w-full text-red-600 font-medium py-2 px-4 rounded-lg border border-red-300 hover:bg-red-50 transition-all duration-300 disabled:opacity-50"
                    >
                      {isDeleting ? '⏳ Deleting...' : '🗑️ Remove Session'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
