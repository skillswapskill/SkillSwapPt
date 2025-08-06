import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const MyLearning = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!user) return;

    // If mongoId missing, try to sync it
    if (!user.publicMetadata?.mongoId) {
      syncUserMetadata();
    } else {
      fetchSessions(user.publicMetadata.mongoId);
    }
  }, [user]);

  const syncUserMetadata = async () => {
    try {
      setSyncing(true);
      console.log("🔄 Syncing user metadata for:", user.id);
      
      await axios.post("http://localhost:5000/api/users/sync-metadata", {
        clerkId: user.id
      });
      
      // Force reload user data
      window.location.reload();
    } catch (error) {
      console.error("❌ Metadata sync failed:", error);
      setLoading(false);
      setSyncing(false);
    }
  };

  const fetchSessions = async (mongoUserId) => {
    try {
      console.log("✅ Fetching sessions for Mongo ID:", mongoUserId);
      setLoading(true);
      
      const res = await axios.get(
        `http://localhost:5000/api/sessions/subscribed/${mongoUserId}`
      );
      
      console.log("📡 Sessions found:", res.data);
      
      // Sort sessions by dateTime in descending order (newest first)
      const sortedSessions = Array.isArray(res.data) 
        ? res.data.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        : [];
      
      setSessions(sortedSessions);
    } catch (error) {
      console.error("❌ Failed to load sessions:", error);
      setSessions([]);
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

  if (!user) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <br></br>
        <br></br>
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📘 My Learning</h1>
        <p className="text-center text-gray-500">Loading user...</p>
      </div>
    );
  }

  if (syncing) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📘 My Learning</h1>
        <p className="text-center text-blue-500">🔄 Syncing user profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <br></br>
      <br></br>
      <h1 className="text-2xl font-bold mb-8 text-center text-blue-600">📘 My Learning</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 italic text-center">No sessions subscribed yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              {/* Session Header */}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  {session.skill}
                </h2>
                <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
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
                  <span className="text-purple-500 mr-2">👨‍🏫</span>
                  <span className="text-sm">
                    {session.teacher?.name || "Unknown Instructor"}
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
              </div>

              {/* Join Button */}
              <button
                onClick={() => handleJoinMeeting(session)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:translate-y-[-1px] shadow-md hover:shadow-lg"
              >
                🚀 Join Meeting
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
