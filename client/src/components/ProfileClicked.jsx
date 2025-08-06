import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";

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

  const fetchSessions = async (mongoUserId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/sessions/${mongoUserId}`
      );
      
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
              User Rating : 4.5
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
            className="text-sm mt-2 text-blue-600 underline"
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
            <p className="text-gray-400 italic">No sessions available yet.</p>
          ) : (
            sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between border p-4 rounded-md hover:shadow-md transition-shadow"
              >
                <div>
                  <h4 className="text-lg font-medium text-blue-900">
                    {session.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Requires {session.credits} credits
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.dateTime && new Date(session.dateTime).toLocaleString()}
                  </p>
                  {session.learner && (
                    <p className="text-xs text-red-500">Already booked</p>
                  )}
                </div>
                <button
                  className={`px-4 py-2 rounded-md transition-colors ${
                    session.learner 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  disabled={!!session.learner}
                  onClick={() => {
                    if (session.learner) return;
                    
                    console.log(`Booking session: ${session.name}`);
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileClicked;
