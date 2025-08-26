import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import dayjs from "dayjs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { apiClient } from '../config/api';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { session, user } = location.state || {};

  // **NEW: Enhanced user ID extraction that works with Clerk**
  const getUserId = () => {
    // Priority order: MongoDB ObjectId > ClerkId > fallback
    if (user?._id && typeof user._id === 'string' && user._id.length === 24) {
      return user._id; // Valid MongoDB ObjectId
    }
    
    if (user?.clerkId) {
      return user.clerkId; // Clerk ID
    }
    
    if (clerkUser?.id) {
      return clerkUser.id; // Clerk user ID from hook
    }
    
    return null;
  };

  const userId = getUserId();

  // Debug logging
  useEffect(() => {
    console.log("=== BOOKING COMPONENT DEBUG ===");
    console.log("Location state:", location.state);
    console.log("User from state:", user);
    console.log("Clerk user:", clerkUser);
    console.log("Extracted userId:", userId);
    console.log("Session:", session);
    console.log("=== END DEBUG ===");
  }, []);

  if (!session || !user || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Missing Data</h1>
          <p className="text-gray-600 mb-4 text-sm">
            Session: {session ? '✅' : '❌'} | User: {user ? '✅' : '❌'} | ID: {userId ? '✅' : '❌'}
          </p>
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const dateValue = session?.dateTime?.$date?.$numberLong
    ? Number(session.dateTime.$date.$numberLong)
    : session?.dateTime;

  const formattedDate = dateValue ? dayjs(dateValue).format("DD MMM YYYY") : "N/A";
  const formattedTime = dateValue ? dayjs(dateValue).format("hh:mm A") : "N/A";

  const handleConfirmBooking = async (attemptNumber = 1) => {
    const maxRetries = 3;
    
    // Get session ID
    const sessionId = session._id || session.id;

    console.log("🔍 Booking with IDs:", { userId, sessionId });

    if (!userId) {
      toast.error("User ID not found. Please try logging out and logging back in.");
      return;
    }

    if (!sessionId) {
      toast.error("Session ID not found. Please try selecting the session again.");
      return;
    }

    setIsLoading(true);
    setRetryCount(attemptNumber);

    try {
      console.log(`🔄 Booking attempt ${attemptNumber}:`, { userId, sessionId });
      
      const response = await apiClient.post("/api/sessions/subscribe", {
        userId: userId, // This can be either MongoDB ObjectId or ClerkId
        sessionId: sessionId,
      });

      console.log("✅ Booking successful:", response.data);
      toast.success("Session booked successfully! 🎉");

      // Handle credit operations (non-blocking)
      try {
        await apiClient.post("/api/credits/debit", { 
          userId: userId, 
          sessionId: sessionId 
        });
      } catch (creditError) {
        console.warn("Credit debit failed:", creditError);
      }

      try {
        const teacherId = session.teacher?._id || session.teacher;
        if (teacherId) {
          await apiClient.post("/api/credits/earn", { 
            userId: teacherId, 
            sessionId: sessionId 
          });
        }
      } catch (creditError) {
        console.warn("Teacher credit failed:", creditError);
      }

      setTimeout(() => navigate("/my-learning"), 1500);

    } catch (error) {
      console.error(`❌ Booking attempt ${attemptNumber} failed:`, error);
      
      const statusCode = error?.response?.status;
      const errorData = error?.response?.data;
      const errorMessage = errorData?.message || "Something went wrong";
      
      // Handle user not found with retries
      if (statusCode === 404 && errorMessage.includes("User not found") && attemptNumber < maxRetries) {
        toast.info(`Account sync in progress... Retrying (${attemptNumber}/${maxRetries})`);
        setTimeout(() => handleConfirmBooking(attemptNumber + 1), 2000 * attemptNumber);
        return;
      }
      
      // Handle registration incomplete
      if (statusCode === 404 && errorMessage.includes("complete your registration")) {
        toast.error("Account setup incomplete. Please try logging out and logging back in.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
        return;
      }
      
      if (statusCode === 400 && errorMessage.includes("Invalid userId format")) {
        toast.error("Account issue detected. Please try logging out and logging back in.");
        return;
      }
      
      if (statusCode === 200 || errorMessage.includes("Already booked")) {
        toast.success("This session is already booked by you!");
        setTimeout(() => navigate("/my-learning"), 1500);
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setRetryCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
            Book Your Session
          </h1>
          <p className="text-gray-600 text-sm">Confirm your learning session details</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            
            {/* Session Details Section */}
            <div className="lg:col-span-2 bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Session Details
              </h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-purple-200 text-xs">Subject</p>
                  <p className="text-lg font-semibold">{session.name}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-purple-200 text-xs">Date</p>
                  <p className="text-lg font-semibold">{formattedDate}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-purple-200 text-xs">Time</p>
                  <p className="text-lg font-semibold">{formattedTime}</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-purple-200 text-xs">Duration</p>
                  <p className="text-lg font-semibold">1 Hour</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-purple-200 text-xs mb-1">Description</p>
                <p className="text-white text-sm">
                  {session.description || `Comprehensive explanation and hands-on learning about ${session.name}`}
                </p>
              </div>
            </div>

            {/* User Details & Actions Section */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Your Details
                </h2>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{user.name || 'Guest User'}</p>
                      <p className="text-gray-600 text-xs">{user.email || 'No email provided'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 text-sm ${
                    isLoading 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                  }`}
                  onClick={() => handleConfirmBooking(1)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>
                        {retryCount > 1 ? `Retrying... (${retryCount}/3)` : 'Confirming...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm Booking</span>
                    </div>
                  )}
                </button>

                <button
                  className={`w-full font-semibold py-3 px-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 text-sm ${
                    isLoading 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </div>
                </button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    🔒 Secure • 📧 Email confirmation • ⭐ Quality guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

export default Booking;
