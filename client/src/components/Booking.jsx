import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import dayjs from "dayjs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiClient } from "../config/api";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: clerkUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Extract session & user data from router state
  const { session, user } = location.state || {};

  // --- 🧠 Utility function to get userId safely ---
  const getUserId = () => {
    if (user?._id && typeof user._id === "string" && user._id.length === 24) return user._id;
    if (user?.clerkId) return user.clerkId;
    if (clerkUser?.id) return clerkUser.id;
    return null;
  };

  const userId = getUserId();

  // --- 🧩 Data validation ---
  if (!session || !user || !userId) {
    console.warn("⚠️ Missing required data", { session, user, userId });

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Missing Data</h1>
          <p className="text-gray-600 mb-4 text-sm">
            Session: {session ? "✅" : "❌"} | User: {user ? "✅" : "❌"} | ID:{" "}
            {userId ? "✅" : "❌"}
          </p>
          <button
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-2 px-4 rounded-xl"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // --- 📅 Format session date/time ---
  const dateValue = session?.dateTime?.$date?.$numberLong
    ? Number(session.dateTime.$date.$numberLong)
    : session?.dateTime;
  const formattedDate = dateValue ? dayjs(dateValue).format("DD MMM YYYY") : "N/A";
  const formattedTime = dateValue ? dayjs(dateValue).format("hh:mm A") : "N/A";

  // --- 🧭 Main booking handler ---
  const handleConfirmBooking = async (attemptNumber = 1) => {
    const maxRetries = 3;
    const sessionId = session._id || session.id;

    console.log("🎬 Booking Attempt Started", {
      userId,
      sessionId,
      attemptNumber,
    });

    if (!userId || !sessionId) {
      toast.error("User or session ID missing.");
      console.error("❌ Booking failed due to missing IDs", { userId, sessionId });
      return;
    }

    setIsLoading(true);
    setRetryCount(attemptNumber);

    try {
      // --- Step 1️⃣: Subscribe user to session ---
      console.log("🚀 Sending booking request to /api/sessions/subscribe ...");
      const response = await apiClient.post("/api/sessions/subscribe", {
        userId,
        sessionId,
      });
      console.log("✅ Booking response:", response.data);
      toast.success("Session booked successfully! 🎉");

      // --- Step 2️⃣: Move credits to BUFFER ---
      console.log("💰 Moving credits to buffer for safe hold...");
      try {
        const bufferResponse = await apiClient.post("/api/credits/buffer", {
          learnerId: userId,
          sessionId: sessionId,
        });
        console.log("✅ Buffer transaction success:", bufferResponse.data);
        toast.info("Credits securely moved to buffer 🔒");
      } catch (bufferError) {
        console.error("⚠️ Buffering credits failed:", bufferError);
        const msg =
          bufferError?.response?.data?.message ||
          "Buffering failed — please contact support.";
        toast.warning(msg);
      }

      // --- Step 3️⃣: Navigate after delay ---
      setTimeout(() => navigate("/my-learning"), 1500);

    } catch (error) {
      console.error(`❌ Booking failed (Attempt ${attemptNumber})`, error);
      const statusCode = error?.response?.status;
      const errorMessage =
        error?.response?.data?.message || "Unexpected error occurred while booking.";

      // --- Retry if temporary failure ---
      if ((statusCode === 404 || statusCode === 500) && attemptNumber < maxRetries) {
        toast.info(`Retrying booking (${attemptNumber}/${maxRetries})...`);
        console.log(`🔁 Retrying booking attempt ${attemptNumber + 1}`);
        setTimeout(() => handleConfirmBooking(attemptNumber + 1), 2000);
        return;
      }

      // --- Final failure ---
      toast.error(errorMessage);
      console.error("❌ Booking permanently failed after retries:", errorMessage);
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
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
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
            {/* Left Section */}
            <div className="lg:col-span-2 bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
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
                  {session.description ||
                    `Comprehensive explanation and hands-on learning about ${session.name}`}
                </p>
              </div>
            </div>

            {/* Right Section */}
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Your Details
                </h2>
                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {user.name || "Guest User"}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {user.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 text-sm ${
                    isLoading
                      ? "bg-gray-300 cursor-not-allowed text-gray-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  }`}
                  onClick={() => handleConfirmBooking(1)}
                  disabled={isLoading}
                >
                  {isLoading
                    ? `Confirming... (Retry ${retryCount})`
                    : "Confirm Booking"}
                </button>

                <button
                  className={`w-full font-semibold py-3 px-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 text-sm ${
                    isLoading
                      ? "border-gray-300 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:border-red-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                  onClick={() => navigate(-1)}
                  disabled={isLoading}
                >
                  Cancel
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

      <ToastContainer position="top-right" autoClose={4000} theme="light" />
    </div>
  );
}

export default Booking;
