import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Import the dynamic API client
import { apiClient } from '../config/api';

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { session, user } = location.state || {};
  console.log("SESSION IN BOOKING:", session);

  if (!session || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">Error: No session or user data available.</h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => navigate("/")}
        >
          Go Back to Sessions
        </button>
      </div>
    );
  }

  const getCleanId = (id) => {
    if (!id) return null;
    if (typeof id === "string") return id;
    if (typeof id === "object" && id.$oid) return id.$oid;
    return id.toString();
  };

  const dateValue = session?.dateTime?.$date?.$numberLong
    ? Number(session.dateTime.$date.$numberLong)
    : session?.dateTime;

  const formattedDate = dateValue ? dayjs(dateValue).format("DD MMM YYYY") : "N/A";
  const formattedTime = dateValue ? dayjs(dateValue).format("hh:mm A") : "N/A";

  const handleConfirmBooking = async () => {
    const cleanUserId = getCleanId(user._id);
    const cleanSessionId = getCleanId(session._id);

    if (!cleanUserId || !cleanSessionId) {
      toast.error("Missing user or session ID.");
      return;
    }

    setIsLoading(true);
    console.log("SUBSCRIBE PAYLOAD", { userId: cleanUserId, sessionId: cleanSessionId });

    try {
      // ✅ Step 1: Subscribe to session using dynamic API
      const subscribeRes = await apiClient.post("/api/sessions/subscribe", {
        userId: cleanUserId,
        sessionId: cleanSessionId,
      });

      if (subscribeRes.status === 200) {
        // ✅ Step 2: Debit credits from learner using dynamic API
        const debitRes = await apiClient.post("/api/credits/debit", {
          userId: cleanUserId,
          sessionId: cleanSessionId,
        });

        if (debitRes.status !== 200) {
          toast.error(debitRes.data.message || "Failed to debit credits.");
          return;
        }

        // ✅ Step 3: Credit the teacher using dynamic API
        const teacherId = getCleanId(session.teacher); // Get teacher ID from session
        
        const earnRes = await apiClient.post("/api/credits/earn", {
          userId: teacherId, // Teacher's ID, not learner's ID!
          sessionId: cleanSessionId,
        });

        if (earnRes.status !== 200) {
          console.error("Failed to credit teacher:", earnRes.data.message);
          // You might want to handle this error differently
        } else {
          console.log("✅ Teacher credited successfully!");
        }

        toast.success("Booking confirmed!");
        navigate("/my-learning");
      }
    } catch (error) {
      console.error("❌ Error confirming booking:", error);
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message || "Something went wrong";
      
      // ✅ Use toast for better error messaging
      toast.error(errorMessage);

      // Handle specific case where booking was already confirmed
      if (statusCode === 400 && errorMessage === "Booking Confirmed") {
        navigate("/my-learning");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Book Your Session</h1>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Session Details</h2>
          <p><strong>Name:</strong> {session.name}</p>
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Time:</strong> {formattedTime}</p>
          <p><strong>Description:</strong> {session.description || `Brief Explanation on ${session.name}`}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold">Your Details</h2>
          <p><strong>Name:</strong> {user.name || 'Guest'}</p>
        </div>

        <button
          className={`w-full px-4 py-2 text-white rounded-md transition-colors duration-200 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
          onClick={handleConfirmBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Booking...
            </span>
          ) : (
            "Confirm Booking"
          )}
        </button>

        <button
          className={`w-full mt-2 px-4 py-2 text-white rounded-md transition-colors duration-200 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>

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
}

export default Booking;
