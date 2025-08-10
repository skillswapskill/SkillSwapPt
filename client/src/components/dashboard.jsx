import React, { useEffect, useState } from "react";
import { FaSearch, FaUserFriends, FaSeedling } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// ✅ Import the dynamic API client
import { apiClient } from '../config/api';

// Enhanced Sun/Moon illustrations with improved gradients and animations
const scenes = {
  morning: (
    <svg 
      width="350" 
      height="350" 
      viewBox="0 0 350 350" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse" 
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient id="sunrise" cx="0.5" cy="0.5" r="0.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE066" stopOpacity="1" />
          <stop offset="0.5" stopColor="#FF9A56" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FF6B6B" stopOpacity="0.3" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="175" cy="175" r="140" fill="url(#sunrise)" filter="url(#glow)" />
      <circle cx="175" cy="175" r="120" fill="url(#sunrise)" opacity="0.6" />
    </svg>
  ),
  afternoon: (
    <svg 
      width="350" 
      height="350" 
      viewBox="0 0 350 350" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse" 
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF59D" stopOpacity="1" />
          <stop offset="0.5" stopColor="#FFD54F" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFCA28" stopOpacity="0.4" />
        </radialGradient>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="175" cy="175" r="140" fill="url(#sun)" filter="url(#sunGlow)" />
      <circle cx="175" cy="175" r="120" fill="url(#sun)" opacity="0.7" />
    </svg>
  ),
  evening: (
    <svg 
      width="350" 
      height="350" 
      viewBox="0 0 350 350" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse" 
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient id="sunset" cx="0.5" cy="0.5" r="0.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFAB91" stopOpacity="1" />
          <stop offset="0.5" stopColor="#FF8A65" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FF7043" stopOpacity="0.3" />
        </radialGradient>
        <filter id="sunsetGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="175" cy="175" r="140" fill="url(#sunset)" filter="url(#sunsetGlow)" />
      <circle cx="175" cy="175" r="120" fill="url(#sunset)" opacity="0.6" />
    </svg>
  ),
  night: (
    <svg 
      width="350" 
      height="350" 
      viewBox="0 0 350 350" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse" 
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E3F2FD" stopOpacity="1" />
          <stop offset="0.5" stopColor="#BBDEFB" stopOpacity="0.8" />
          <stop offset="1" stopColor="#90CAF9" stopOpacity="0.3" />
        </radialGradient>
        <filter id="nightGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle cx="175" cy="175" r="140" fill="url(#moonGlow)" filter="url(#nightGlow)" />
      <circle cx="175" cy="175" r="120" fill="url(#moonGlow)" opacity="0.7" />
      <circle cx="100" cy="80" r="2" fill="#FFF" opacity="0.8" className="animate-ping" />
      <circle cx="280" cy="120" r="1.5" fill="#FFF" opacity="0.6" className="animate-ping" style={{animationDelay: '1s'}} />
      <circle cx="250" cy="60" r="1" fill="#FFF" opacity="0.7" className="animate-ping" style={{animationDelay: '2s'}} />
    </svg>
  ),
};

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [currentUserMongo, setCurrentUserMongo] = useState(null);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedClerkData, setSelectedClerkData] = useState(null);

  // Debug logs
  console.log("Current Clerk user:", user?.id);
  console.log("Current Mongo user:", currentUserMongo);
  console.log("All users:", allUsers);

  // Time logic: Night after 8 PM
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 20) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // ✅ Fixed Clerk data fetching using dynamic API
  useEffect(() => {
    const fetchClerkData = async () => {
      if (!selectedUser?.clerkId) return;
      try {
        // ✅ Fixed template literal syntax and using apiClient
        const res = await apiClient.get(`/api/clerk/user/${selectedUser.clerkId}`);
        setSelectedClerkData(res.data);
      } catch (err) {
        console.error("ERROR fetching Clerk user data", err);
      }
    };
    fetchClerkData();
  }, [selectedUser]);

  const getProfilePic = (userObj) => {
    if (!userObj) return "/user.png";
    if (userObj.profile_image_url) return userObj.profile_image_url;
    if (userObj.external_accounts && Array.isArray(userObj.external_accounts)) {
      for (const account of userObj.external_accounts) {
        if (account.avatar_url) return account.avatar_url;
        if (account.image_url) return account.image_url;
      }
    }
    if (userObj.image_url) return userObj.image_url;
    if (userObj.profilePic) return userObj.profilePic;
    return "/user.png";
  };

  // ✅ Sync user using dynamic API
  const syncLoggedInUser = async () => {
    try {
      if (!user?.id) return;
      const profilePic = getProfilePic(user);
      
      // ✅ Using apiClient instead of hardcoded URL
      const response = await apiClient.post(
        "/api/users/sync",
        {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          profilePic: profilePic,
        }
      );
      
      // Store current user's MongoDB data
      setCurrentUserMongo(response.data);
      console.log("Synced current user:", response.data);
    } catch (err) {
      console.error("ERROR: Error syncing logged-in user:", err);
    }
  };

  // ✅ Fetch all users using dynamic API
  const fetchAllUsers = async () => {
    try {
      // ✅ Using apiClient instead of hardcoded URL
      const res = await apiClient.get("/api/users/all");
      const users = res.data.users || [];
      console.log("Fetched all users:", users);
      setAllUsers(users);
    } catch (err) {
      console.error("ERROR: Error fetching users:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTreesPlanted((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      syncLoggedInUser();
      fetchAllUsers();
    }
  }, [isSignedIn, user?.id]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 20) return "Good Night 🌙";
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon 🌇";
    return "Good Evening 🌃";
  };

  // Multiple filtering approaches to ensure current user is excluded
  const getFilteredUsers = () => {
    if (!allUsers.length) return [];
    
    return allUsers.filter(u => {
      // Method 1: Compare by clerkId (most reliable)
      if (u.clerkId && user?.id && u.clerkId === user.id) {
        console.log("Filtering out user by clerkId:", u.clerkId);
        return false;
      }
      
      // Method 2: Compare by name (backup)
      if (u.name && user?.fullName && u.name === user.fullName) {
        console.log("Filtering out user by name:", u.name);
        return false;
      }
      
      // Method 3: Compare by email (backup)
      if (u.email && user?.primaryEmailAddress?.emailAddress && 
          u.email === user.primaryEmailAddress.emailAddress) {
        console.log("Filtering out user by email:", u.email);
        return false;
      }

      // Method 4: Compare by MongoDB _id if available
      if (currentUserMongo?._id && u._id && 
          u._id.toString() === currentUserMongo._id.toString()) {
        console.log("Filtering out user by MongoDB _id:", u._id);
        return false;
      }
      
      return true;
    });
  };

  const displayUsers = getFilteredUsers();
  console.log("Users to display after filtering:", displayUsers);

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-6 py-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full animate-bounce opacity-40" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-300 rounded-full animate-bounce opacity-30" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-50" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-indigo-300 rounded-full animate-bounce opacity-35" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-64 right-10 w-1 h-1 bg-yellow-300 rounded-full animate-bounce opacity-40" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-30" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Dynamic Sun/Moon Background */}
      <div className="hidden md:block">{scenes[getTimeOfDay()]}</div>

      <br />
      <br />
      
      {/* Enhanced Header with glass morphism effect */}
      <div className="text-center mb-8 relative z-20">
        <div className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <HiSparkles className="text-yellow-400 text-2xl mr-3 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {getTimeGreeting()}, {user?.firstName || "Learner"}
          </h1>
          <HiSparkles className="text-yellow-400 text-2xl ml-3 animate-pulse" />
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="flex justify-center mb-12 z-20 relative">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-full px-6 py-4 shadow-2xl w-full max-w-md border border-white/50 group-hover:border-white/70 transition-all duration-300">
            <FaSearch className="text-blue-600 mr-4 text-lg group-hover:scale-110 transition-transform duration-200" />
            <input
              type="text"
              placeholder="Dive into your Skills"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none w-full bg-transparent text-blue-700 placeholder-blue-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Users Grid */}
      <div className="flex flex-wrap justify-center gap-12 relative z-20 mb-8">
        {displayUsers
          .filter(
            (u) =>
              (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
              (u.skills &&
                u.skills.some((skill) =>
                  skill.toLowerCase().includes(search.toLowerCase())
                ))
          )
          .map((u, idx) => (
            <div key={idx} className="flex flex-col items-center w-28 group">
              <div className="relative">
                {/* Glowing ring effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300 scale-110"></div>
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-3 border-white cursor-pointer"
                  title={u.name}
                >
                  <img
                    src={getProfilePic(u)}
                    alt={u.name}
                    className="w-full h-full object-cover"
                    onClick={() => setSelectedUser(u)}
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
              </div>
              <p className="mt-3 text-sm text-center font-semibold text-blue-800 truncate max-w-[6rem] group-hover:text-purple-600 transition-colors duration-200">
                {u.name}
              </p>
            </div>
          ))}
      </div>

      {/* Enhanced Trees Counter */}
      <div className="text-center mt-12 relative z-20">
        <div className="inline-flex flex-col items-center px-8 py-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl shadow-2xl border border-green-200/50 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center mb-2">
            <FaSeedling className="text-green-600 text-xl mr-2 animate-pulse" />
            <p className="text-lg font-semibold text-green-800">Number of Trees Planted</p>
            <FaSeedling className="text-green-600 text-xl ml-2 animate-pulse" />
          </div>
          <div className="relative">
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {treesPlanted.toLocaleString()}
            </p>
            <div className="absolute inset-0 bg-green-400 opacity-20 blur-xl rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 backdrop-blur-md bg-black/40 flex justify-center items-center animate-fadeIn">
          <div className="relative group">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition duration-300"></div>
            
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl w-[90%] max-w-sm border border-white/50">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-4 text-3xl font-bold text-gray-400 hover:text-red-500 transition-colors duration-200 hover:scale-110 transform"
              >
                &times;
              </button>
              
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-50"></div>
                  <img
                    src={getProfilePic(selectedUser)}
                    alt={selectedUser.name}
                    className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {selectedUser.name}
                </h2>

                <div className="flex flex-wrap gap-2 justify-center mt-2 mb-6">
                  {selectedUser.skills && selectedUser.skills.length > 0 ? (
                    selectedUser.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm rounded-full shadow-md border border-blue-200/50 hover:scale-105 transform transition duration-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No skills listed</p>
                  )}
                </div>

                <button
                  onClick={() =>
                    navigate("/profileclicked", { state: { selectedUser } })
                  }
                  className="relative group mt-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  <FaUserFriends className="inline mr-2" />
                  View Full Profile
                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
