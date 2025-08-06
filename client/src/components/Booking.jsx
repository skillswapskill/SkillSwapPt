import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      const subscribeRes = await axios.post("http://localhost:5000/api/sessions/subscribe", {
        userId: cleanUserId,
        sessionId: cleanSessionId,
      });

      if (subscribeRes.status === 200) {
        const debitRes = await axios.post("http://localhost:5000/api/credits/debit", {
          userId: cleanUserId,
          sessionId: cleanSessionId,
        });
      if(subscribeRes.status===500){
        alert("SOMETHIG WENT WRONG");
      }

        if (debitRes.status !== 200) {
          alert(debitRes.data.message || "Failed to debit credits.");
          return;
        }

        alert("Booking confirmed!");
        navigate("/profile");
      }
    } catch (error) {
      console.error("❌ Error confirming booking:", error);
      const statusCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message || "Something went wrong";
      alert(errorMessage);

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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Booking;
