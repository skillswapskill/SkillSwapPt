import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Always put this early and log session
  const { session, user } = location.state || { session: null, user: null };
  console.log("SESSION IN BOOKING:", session);

  // Defensive fallback for date value
  let dateValue = session?.dateTime;
  if (dateValue && typeof dateValue === "object" && dateValue.$date && dateValue.$date.$numberLong) {
    dateValue = Number(dateValue.$date.$numberLong);
  }

  const formattedDate = dateValue ? dayjs(dateValue).format("DD MMM YYYY") : "N/A";
  const formattedTime = dateValue ? dayjs(dateValue).format("hh:mm A") : "N/A";

  if (!session || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">
          Error: No session or user data available.
        </h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => navigate("/")}
        >
          Go Back to Sessions
        </button>
      </div>
    );
  }

  const handleConfirmBooking = async () => {
    if (!user?._id || !session?._id) {
      alert("Missing user or session data. Please try again.");
      return;
    }

    setIsLoading(true);
    try {
      const subscribeRes = await axios.post("/api/sessions/subscribe", {
        userId: user._id,
        sessionId: session._id,
      });
      if (subscribeRes.status !== 200) {
        alert(subscribeRes.data.message || "Failed to subscribe to session.");
        return;
      }

      const debitRes = await axios.post("/api/credits/debit", {
        userId: user._id,
        sessionId: session._id,
      });
      if (debitRes.status !== 200) {
        alert(debitRes.data.message || "Failed to debit credits.");
        return;
      }

      alert("Booking confirmed!");
      navigate("/profile");
    } catch (error) {
      console.error("Error confirming booking:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to confirm booking. Please try again later.";
      alert(errorMessage);
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
          <p><strong>Description:</strong> {session.description ||`Brief Explanation on ${session.name}`}</p>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Your Details</h2>
          <p><strong>Name:</strong> {user.name || 'Guest'}</p>
        </div>
        <button
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={handleConfirmBooking}
          disabled={isLoading}
        >
          {isLoading ? "Booking..." : "Confirm Booking"}
        </button>
        <button
          className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => navigate(-1)}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Booking;
