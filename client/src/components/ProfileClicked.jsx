import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProfileClicked = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = "John Doe"; // Placeholder for user data, replace with actual user data from context or props  

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        No user selected. Go back and click on a user profile.
      </div>
    );
  }

  const mockSessions = [
    { title: "Intro to AI", credits: 50 },
    { title: "Learn DSA", credits: 40 },
    { title: "Quantum Physics Basics", credits: 60 },
  ];

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <br></br>
      <br></br>
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={user.profilePic || "/user.png"}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-blue-500 object-cover mr-6"
          />
          <div>
            {/* {user.name} in down */}
            <h2 className="text-2xl font-bold text-blue-800">{user}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.skills && user.skills.length > 0 ? (
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
          {mockSessions.map((session, index) => (
            <div
              key={index}
              className="flex items-center justify-between border p-4 rounded-md"
            >
              <div>
                <h4 className="text-lg font-medium text-blue-900">
                  {session.title}
                </h4>
                <p className="text-sm text-gray-500">
                  Requires {session.credits} credits
                </p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Book Session
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileClicked;
