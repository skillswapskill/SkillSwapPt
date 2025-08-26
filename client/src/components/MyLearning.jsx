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

  useEffect(() => {
    if (!user) return;

    if (!user.publicMetadata?.mongoId) {
      syncUserMetadata();
    } else {
      fetchAllSessions(user.publicMetadata.mongoId);
    }
  }, [user]);

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

  const handleJoinMeeting = (session) => {
    const now = new Date();
    const scheduledTime = new Date(session.dateTime);
    if (now >= scheduledTime) {
      navigate(`/join-room/${session._id}`);
    } else {
      alert("Meeting not yet started. Please wait until the scheduled time.");
    }
  };

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

      {/* Debug Info (for development) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg max-w-4xl mx-auto">
          <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Info:</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>User MongoDB ID: {user.publicMetadata?.mongoId || 'Not set'}</p>
            <p>Learning Sessions: {learningSessions.length}</p>
            <p>Teaching Sessions: {teachingSessions.length}</p>
            <p>Active Tab: {activeTab}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Error: {error || 'None'}</p>
          </div>
          <button 
            onClick={() => fetchAllSessions(user.publicMetadata?.mongoId)}
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
          >
            🔄 Refetch Sessions
          </button>
        </div>
      )} */}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">⚠️ Error Loading Sessions</h3>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => fetchAllSessions(user.publicMetadata?.mongoId)}
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
            
            return (
              <div
                key={session._id}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
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
                </div>

                {/* Action Button */}
                <button
                  onClick={buttonConfig.handler}
                  className={`w-full text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:translate-y-[-1px] shadow-md hover:shadow-lg ${buttonConfig.className}`}
                >
                  {buttonConfig.text}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
