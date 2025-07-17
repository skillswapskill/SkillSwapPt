import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null); // 🌟 Popup state

  const [selectedClerkData, setSelectedClerkData] = useState(null);

  useEffect(() => {
    const fetchClerkData = async () => {
      if (!selectedUser?.clerkId) return;

      try {
        const res = await axios.get(
          `http://localhost:5000/api/clerk/user/${selectedUser.clerkId}`
        );
        setSelectedClerkData(res.data); // this will contain profile_image_url, first_name etc.
      } catch (err) {
        console.error("❌ Error fetching Clerk user data:", err);
      }
    };

    fetchClerkData();
  }, [selectedUser]);

  // Helper function to extract profile pic URL from Clerk user object or DB field
  const getProfilePic = (userObj) => {
    if (!userObj) return "/user.png";

    // 1. Primary Clerk profile image (usually the most reliable)
    if (userObj.profile_image_url) return userObj.profile_image_url;

    // 2. Loop through external accounts to find the first valid avatar or image
    if (userObj.external_accounts && Array.isArray(userObj.external_accounts)) {
      for (const account of userObj.external_accounts) {
        if (account.avatar_url) return account.avatar_url;
        if (account.image_url) return account.image_url;
      }
    }

    // 3. Other possible fields (from your DB maybe)
    if (userObj.image_url) return userObj.image_url;
    if (userObj.profilePic) return userObj.profilePic;

    // 4. Final fallback
    return "/user.png";
  };

  const syncLoggedInUser = async () => {
    try {
      if (!user?.id) return;

      // Extract profile pic URL from Clerk user object
      const profilePic = getProfilePic(user);

      await axios.post(
        "http://localhost:5000/api/users/sync",
        {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          profilePic: profilePic,
        },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("❌ Error syncing logged-in user:", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/all", {
        withCredentials: true,
      });
      setAllUsers(res.data.users || []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTreesPlanted((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      syncLoggedInUser();
      fetchAllUsers();
    }
  }, [isSignedIn]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return "Good Night 🌙";
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon 🌇";
    return "Good Evening 🌃";
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-br from-purple-100 via-white to-blue-100">
      {/* Greeting */}
      <br />
      <br />
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">
        {getTimeGreeting()}, {user?.firstName || "Learner"}
      </h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md w-full max-w-md">
          <FaSearch className="text-blue-700 mr-3" />
          <input
            type="text"
            placeholder="Dive into your Skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full bg-transparent text-blue-700"
          />
        </div>
      </div>

      {/* User Avatars */}
      <div className="flex flex-wrap justify-center gap-9">
        {allUsers
          .filter(
            (u) =>
              u.name.toLowerCase().includes(search.toLowerCase()) ||
              (u.skills &&
                u.skills.some((skill) =>
                  skill.toLowerCase().includes(search.toLowerCase())
                ))
          )
          .map((u, idx) => (
            <div key={idx} className="flex flex-col items-center w-24">
              <div
                className="w-20 h-20 rounded-full overflow-hidden shadow-md hover:scale-110 transition border border-blue-300"
                title={u.name}
              >
                <img
                  src={getProfilePic(u)}
                  alt={u.name}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setSelectedUser(u)} // 👈 Show popup
                />
              </div>
              <p className="mt-2 text-sm text-center font-medium text-blue-800 truncate max-w-[5rem]">
                {u.name}
              </p>
            </div>
          ))}
      </div>

      {/* Tree Counter */}
      <div className="text-center text-green-800 mt-12">
        <p className="text-lg font-medium">Number of Trees Planted 🌱</p>
        <p className="text-3xl font-bold">{treesPlanted.toLocaleString()}</p>
      </div>

      {/* 🚀 Popup Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/30 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl w-[90%] max-w-sm relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-2 right-3 text-2xl font-bold text-gray-500 hover:text-red-600"
            >
              &times;
            </button>
            <div className="flex flex-col items-center">
              <img
                src={getProfilePic(selectedUser)}
                alt={selectedUser.name}
                
                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-blue-500"
              />
              <h2 className="text-xl font-semibold text-blue-800 mb-2">
                {selectedUser.name}
              </h2>
              {/* 🧠 Skills Display */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {selectedUser.skills && selectedUser.skills.length > 0 ? (
                  selectedUser.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full shadow-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed</p>
                )}
              </div>
              <button
                onClick={() =>
                  navigate("/profileclicked", { state: { selectedUser } })
                }
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
