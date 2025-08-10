import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";

// ✅ Import the dynamic API client
import { apiClient } from '../config/api';

const ProfileClicked = () => {
  const { user: currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.selectedUser;

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user && user?._id) {
      fetchSessions(user._id);
    }
  }, [user]);

  // ✅ Updated to use dynamic API client
  const fetchSessions = async (mongoUserId) => {
    try {
      // ✅ Using apiClient instead of hardcoded localhost URL
      const res = await apiClient.get(`/api/sessions/${mongoUserId}`);
      
      console.log("Raw sessions data:", res.data);
      
      // Show all sessions offered by this teacher
      const fetched = res.data.map((s) => ({
        _id: s._id?.$oid || s._id,
        name: s.skill,
        credits: s.creditsUsed,
        dateTime: s.dateTime,
        teacher: s.teacher,
        learner: s.learner,
        description: s.description,
        subscribed: s.subscribed,
        status: s.status
      }));
      
      console.log("Processed sessions:", fetched);
      setSessions(fetched);
    } catch (error) {
      console.error("❌ Failed to fetch sessions:", error.message);
      // ✅ Added toast notification for better user feedback
      toast.error("Failed to load sessions. Please try again.");
    }
  };

  if (!user?.name) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        No user selected. Go back and click on a user profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <br />
      <br />

      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={user.profilePic || "/user.png"}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover mr-6"
          />
          <div>
            <h2 className="text-2xl font-bold text-blue-800">{user.name}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.skills?.length > 0 ? (
                user.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No skills listed</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-blue-800">
              User Rating : 4.5 ⭐
            </h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-blue-700 font-semibold">Credits</p>
          <p className="text-3xl text-green-600 font-bold">
            {user.totalCredits || 300}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm mt-2 text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
          >
            ⬅ Back
          </button>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          📚 Sessions offered by {user.name}
        </h3>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400 italic">No sessions available yet.</p>
              <p className="text-sm text-gray-500 mt-2">
                This instructor hasn't created any sessions yet.
              </p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-gray-200 p-4 rounded-lg hover:shadow-md transition-all duration-300 hover:border-blue-200"
              >
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-blue-900 mb-1">
                    {session.name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm">
                    <p className="text-gray-600 flex items-center">
                      <span className="text-green-600 mr-1">💰</span>
                      Requires {session.credits} credits
                    </p>
                    {session.dateTime && (
                      <p className="text-gray-500 flex items-center">
                        <span className="text-blue-500 mr-1">📅</span>
                        {new Date(session.dateTime).toLocaleDateString()}
                      </p>
                    )}
                    {session.dateTime && (
                      <p className="text-gray-500 flex items-center">
                        <span className="text-purple-500 mr-1">⏰</span>
                        {new Date(session.dateTime).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  {session.learner && (
                    <p className="text-xs text-red-500 mt-2 flex items-center">
                      <span className="mr-1">🔒</span>
                      Already booked
                    </p>
                  )}
                </div>
                
                <div className="ml-4">
                  <button
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform ${
                      session.learner 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                    disabled={!!session.learner}
                    onClick={() => {
                      if (session.learner) return;
                      
                      console.log(`Booking session: ${session.name}`);
                      
                      // ✅ Enhanced navigation with better user data handling
                      navigate("/book-session", {
                        state: {
                          session: {
                            _id: session._id,
                            name: session.name,
                            dateTime: session.dateTime,
                            description: session.description || `Brief Explanation on ${session.name}`,
                            teacher: session.teacher,
                            creditsUsed: session.credits
                          },
                          user: currentUser?.publicMetadata?.mongoId ? {
                            _id: currentUser.publicMetadata.mongoId,
                            name: currentUser.fullName,
                            email: currentUser.primaryEmailAddress?.emailAddress
                          } : {
                            _id: "temp_id", // fallback
                            name: currentUser?.fullName || "Guest",
                            email: currentUser?.primaryEmailAddress?.emailAddress || ""
                          },
                        },
                      });
                      console.log("Session to book:", session._id);
                    }}
                  >
                    {session.learner ? "Already Booked" : "Book Session"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ProfileClicked;
