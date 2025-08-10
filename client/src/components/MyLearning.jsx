import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { apiClient } from '../config/api';


const MyLearning = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [learningSessions, setLearningSessions] = useState([]);
  const [teachingSessions, setTeachingSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("learning"); // "learning" or "teaching"
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
      setLoading(false);
      setSyncing(false);
    }
  };

  // Fetch both learning and teaching sessions
  const fetchAllSessions = async (mongoUserId) => {
    try {
      console.log("✅ Fetching all sessions for Mongo ID:", mongoUserId);
      setLoading(true);
      
      // Fetch sessions where user is LEARNER
      const learningRes = await apiClient.get(
        `/api/sessions/subscribed-by-mongo/${mongoUserId}`
      );
      
      // Fetch sessions where user is TEACHER (and session is booked)
      const teachingRes = await apiClient.get(
        `/api/sessions/teaching/${mongoUserId}`
      );
      
      console.log("📡 Learning sessions found:", learningRes.data);
      console.log("📡 Teaching sessions found:", teachingRes.data);
      
      // Sort both arrays by newest first
      const sortedLearning = Array.isArray(learningRes.data) 
        ? learningRes.data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        : [];
        
      const sortedTeaching = Array.isArray(teachingRes.data) 
        ? teachingRes.data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        : [];
      
      setLearningSessions(sortedLearning);
      setTeachingSessions(sortedTeaching);
    } catch (error) {
      console.error("❌ Failed to load sessions:", error);
      setLearningSessions([]);
      setTeachingSessions([]);
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
        <br></br>
        <br></br>
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📘 My Sessions</h1>
        <p className="text-center text-gray-500">Loading user...</p>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📘 My Sessions</h1>
        <p className="text-center text-blue-500">🔄 Syncing user profile...</p>
      </div>
    );
  }

  const currentSessions = getCurrentSessions();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <br></br>
      <br></br>
      <h1 className="text-2xl font-bold mb-8 text-center text-blue-600">📘 My Sessions</h1>

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
                    {session.skill}
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
                    {session.status}
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
