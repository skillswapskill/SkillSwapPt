import React,{useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debitCreditsOnSubscription } from '../../../server/src/controllers/credit.controller';


function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  console.log('Booking component rendered');
  

  const [isLoading, setIsLoading] = useState(false); // Add this in your component

  
  // Retrieve the passed state (session and user)
  const { session, user } = location.state || { session: null, user: null };

  // If no session or user is passed, handle gracefully (e.g., redirect or show error)
  if (!session || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">Error: No session or user data available.</h1>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => navigate('/')} // Assuming '/' is the home or sessions list page
        >
          Go Back to Sessions
        </button>
      </div>
    );
  }

  // Handle confirm booking logic (this is a placeholder; replace with actual API call or logic)
  const handleConfirmBooking = async () => {
  if (!user?._id || !session?._id) {
    alert('Missing user or session data. Please try again.');
    return;
  }

  setIsLoading(true);
  try {
    console.log(`Confirming booking for session: ${session.name} by user: ${user.name}`);

    // Step 3: Subscribe first
    const subscribeRes = await axios.post('/api/sessions/subscribe', { // Assume this endpoint exists
      userId: user._id,
      sessionId: session._id
    });

    if (subscribeRes.status !== 200) {
      alert(subscribeRes.data.message || 'Failed to subscribe to session.');
      return;
    }

    // Step 4: Debit credits after subscription
    const debitRes = await axios.post('/api/credits/debit', {
      userId: user._id,
      sessionId: session._id
    });

    if (debitRes.status !== 200) {
      alert(debitRes.data.message || 'Failed to debit credits.');
      return;
    }

    // Step 5: Success
    alert('Booking confirmed!');
    navigate('/profile');
  } catch (error) {
    console.error('Error confirming booking:', error);
    const errorMessage = error.response?.data?.message || 'Failed to confirm booking. Please try again later.';
    alert(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6">Book Your Session</h1>
        
        {/* Display Session Details */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Session Details</h2>
          <p><strong>Name:</strong> {session.name}</p>
          <p><strong>Date:</strong> {session.date || 'N/A'}</p> {/* Assuming session has date; adjust as needed */}
          <p><strong>Time:</strong> {session.time || 'N/A'}</p>
          <p><strong>Description:</strong> {session.description || 'No description available'}</p>
        </div>
        
        {/* Display User Details */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Your Details</h2>
          <p><strong>Name:</strong> {user.name || 'Guest'}</p>
          {/* <p><strong>Email:</strong> {user.email || 'N/A'}</p> */}
          {/* Add more user fields as needed */}
        </div>
        
        {/* Confirm Booking Button */}
        <button
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={handleConfirmBooking}
        >
          Confirm Booking
        </button>
        
        {/* Cancel Button */}
        <button
          className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          onClick={() => navigate(-1)} // Go back to previous page
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Booking;
