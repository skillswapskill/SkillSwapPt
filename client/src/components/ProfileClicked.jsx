import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useUser } from "@clerk/clerk-react";
import { apiClient } from '../config/api';

const ProfileClicked = () => {
  const { user: currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.selectedUser;

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && user?._id) {
      fetchSessions(user._id);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchSessions = async (mongoUserId) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/api/sessions/${mongoUserId}`);
      
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
      
      setSessions(fetched);
    } catch (error) {
      console.error("❌ Failed to fetch sessions:", error.message);
      toast.error("Failed to load sessions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  };

  if (!user?.name) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <br></br>
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center max-w-md w-full">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No User Selected</h2>
          <p className="text-gray-600 mb-4 text-sm">Please select a user profile to view.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <br></br>
      <br></br>
      <div className="max-w-6xl mx-auto">
        {/* Compact Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium mb-4 transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Profiles
        </button>

        {/* Compact Profile + Sessions Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
          
          {/* Left Side - Profile Card */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full">
              {/* Compact Gradient Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-center">
                <div className="relative mb-3">
                  <img
                    src={user.profilePic || "/user.png"}
                    alt={user.name}
                    className="w-16 h-16 rounded-full border-3 border-white object-cover mx-auto shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-6 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                
                <h1 className="text-xl font-bold text-white mb-2">{user.name}</h1>
                
                {/* Compact Skills */}
                <div className="flex flex-wrap gap-1 justify-center mb-3">
                  {user.skills?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {user.skills?.length > 3 && (
                    <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs">+{user.skills.length - 3}</span>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-yellow-300 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-white font-semibold text-sm ml-1">4.5</span>
                  <span className="text-white/80 text-xs">(127)</span>
                </div>

                {/* Credits */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-white/80 text-xs mb-1">Available Credits</p>
                  <p className="text-2xl font-bold text-white">{user.totalCredits || 300}</p>
                  <p className="text-green-300 text-xs">+50 this week</p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-lg font-bold text-purple-600">{sessions.length}</p>
                    <p className="text-xs text-gray-600">Total Sessions</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{sessions.filter(s => !s.learner).length}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Sessions */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">
              {/* Compact Header */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 border-b">
                <h2 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  📚 Sessions by {user.name}
                </h2>
              </div>

              {/* Sessions Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading sessions...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center h-full flex flex-col justify-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">No Sessions Available</h3>
                    <p className="text-gray-500 text-sm">Check back later for new sessions!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session, index) => {
                      const dateTime = formatDateTime(session.dateTime);
                      const isBooked = !!session.learner;
                      
                      return (
                        <div
                          key={index}
                          className={`relative overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg ${
                            isBooked ? 'border-gray-200 bg-gray-50' : 'border-purple-100 bg-white hover:border-purple-200'
                          }`}
                        >
                          {/* Compact Session Layout */}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className={`font-bold ${isBooked ? 'text-gray-500' : 'text-gray-900'}`}>
                                    {session.name}
                                  </h3>
                                  {isBooked && (
                                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                      BOOKED
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                  {/* Credits */}
                                  <div className="flex items-center">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 ${
                                      isBooked ? 'bg-gray-200' : 'bg-green-100'
                                    }`}>
                                      <svg className={`w-3 h-3 ${isBooked ? 'text-gray-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className={`text-xs ${isBooked ? 'text-gray-400' : 'text-gray-500'}`}>Credits</p>
                                      <p className={`font-semibold text-sm ${isBooked ? 'text-gray-500' : 'text-green-600'}`}>
                                        {session.credits}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Date & Time */}
                                  {dateTime && (
                                    <div className="flex items-center">
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-2 ${
                                        isBooked ? 'bg-gray-200' : 'bg-blue-100'
                                      }`}>
                                        <svg className={`w-3 h-3 ${isBooked ? 'text-gray-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className={`text-xs ${isBooked ? 'text-gray-400' : 'text-gray-500'}`}>{dateTime.date}</p>
                                        <p className={`font-semibold text-sm ${isBooked ? 'text-gray-500' : 'text-blue-600'}`}>
                                          {dateTime.time}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Compact Book Button */}
                              <div className="ml-4">
                                <button
                                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                                    isBooked
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 shadow-md'
                                  }`}
                                  disabled={isBooked}
                                  onClick={() => {
                                    if (isBooked) return;
                                    
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
                                          email: currentUser.primaryEmailAddress?.emailAddress,
                                          clerkId: currentUser.id
                                        } : {
                                          _id: "temp_id",
                                          name: currentUser?.fullName || "Guest",
                                          email: currentUser?.primaryEmailAddress?.emailAddress || "",
                                          clerkId: currentUser?.id
                                        },
                                      },
                                    });
                                  }}
                                >
                                  {isBooked ? "Booked" : "Book Session"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="mt-16"
      />
    </div>
  );
};

export default ProfileClicked;
