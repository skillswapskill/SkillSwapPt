import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';


const ProfileClicked = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.selectedUser;

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    if (user&&user?._id) {
      fetchSessions(user._id);
    }
  }, [user]);

  const fetchSessions = async (mongoUserId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/sessions/${mongoUserId}`);
      const fetched = res.data.map((s) => ({
        name: s.skill,
        credits: s.creditsUsed,
      }));
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
            <h2 className="text-xl font-bold text-blue-800">User Rating : 4.5</h2>
          </div>
        </div>
        <div className="text-right">
          <p className="text-blue-700 font-semibold">Credits</p>
          <p className="text-3xl text-green-600 font-bold">{user.totalCredits || 300}</p>
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
          📚 Sessions taught by {user.name}
        </h3>
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-gray-400 italic">No sessions available yet.</p>
          ) : (
            sessions.map((session, index) => (
              <div
                key={index}
                className="flex items-center justify-between border p-4 rounded-md"
              >
                <div>
                  <h4 className="text-lg font-medium text-blue-900">{session.name}</h4>
                  <p className="text-sm text-gray-500">
                    Requires {session.credits} credits
                  </p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 " onClick={()=>{
                  // Handle booking session logic here
                  console.log(`Booking session: ${session.name}`);
                  navigate("/book-session", { state: { session, user } });
                }}>
                  Book Session
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
