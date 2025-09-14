import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Import the dynamic API client
import { apiClient } from '../config/api';

function Redeem() {
  const { user, isSignedIn } = useUser();
  
  const [credits, setCredits] = useState(0);
  const [eRupees, setERupees] = useState(0);
  const [creditsToRedeem, setCreditsToRedeem] = useState('');
  const [calculatedRupees, setCalculatedRupees] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mongoUserId, setMongoUserId] = useState("");
  const [showRupeeModal, setShowRupeeModal] = useState(false);

  // Conversion rate: 1000 credits = 905 e rupees (1 credit = 0.910 e rupees)
  const CONVERSION_RATE = 0.910; // 2 e rupees per credit
  const MIN_CREDITS = 1000; // Minimum credits to redeem

  // ✅ Updated fetchUserData function
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn) return;
      try {
        const res = await apiClient.post(
          "/api/users/sync",
          {
            clerkId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
          }
        );
        const data = res.data;
        setCredits(data.totalCredits);
        
        // ✅ Handle both old skillCoins and new eRupees fields
        const userERupees = data.eRupees || (data.skillCoins ? data.skillCoins * 910 : 0);
        setERupees(userERupees);
        setMongoUserId(data._id);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [isSignedIn, user]);

  // Calculate e rupees when credits input changes
  useEffect(() => {
    if (creditsToRedeem) {
      const rupees = parseInt(creditsToRedeem) * CONVERSION_RATE;
      setCalculatedRupees(rupees);
    } else {
      setCalculatedRupees(0);
    }
  }, [creditsToRedeem]);

  // Handle redeem submission using dynamic API
  const handleRedeem = async () => {
    const redeemAmount = parseInt(creditsToRedeem);
    
    if (!redeemAmount || redeemAmount < MIN_CREDITS) {
      toast.error(`Minimum ${MIN_CREDITS} credits required to redeem`);
      return;
    }

    if (redeemAmount > credits) {
      toast.error('Insufficient credits');
      return;
    }

    const rupeesToReceive = redeemAmount * CONVERSION_RATE;

    setIsLoading(true);

    try {
      const response = await apiClient.post(
        "/api/credits/redeem",
        {
          userId: mongoUserId,
          creditsToRedeem: redeemAmount,
          eRupeesToReceive: rupeesToReceive,
        }
      );

      if (response.status === 200) {
        setCredits(prev => prev - redeemAmount);
        setERupees(prev => prev + rupeesToReceive);
        setCreditsToRedeem('');
        toast.success(`Successfully redeemed ${redeemAmount} credits for ₹${rupeesToReceive} E Rupees!`);
      }
    } catch (error) {
      console.error("Redemption failed:", error);
      const errorMessage = error.response?.data?.message || 'Redemption failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle max button click
  const handleMaxCredits = () => {
    setCreditsToRedeem(credits.toString());
  };

  // ✅ Updated E Rupees Modal Component
  const ERupeesModal = () => {
    if (!showRupeeModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={() => setShowRupeeModal(false)}
            className="absolute -top-6 -right-6 z-10 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-2xl hover:scale-110 transition-all duration-300"
          >
            ×
          </button>

          {/* E Rupees Container */}
          <div className="relative p-8 animate-cardFloat">
            {/* Outer magical glow effect */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-300 via-emerald-500 to-green-300 blur-2xl opacity-70 animate-pulse scale-110"></div>
            <div className="absolute inset-2 rounded-3xl bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 blur-xl opacity-50 animate-pulse"></div>
            
            {/* Main E Rupees Card */}
            <div className="relative w-96 h-64 rounded-3xl bg-gradient-to-br from-green-400 via-emerald-600 to-green-800 shadow-2xl border-4 border-green-900 overflow-hidden transform animate-cardSway">
              
              {/* Inner card face with digital pattern */}
              <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 shadow-inner border-2 border-green-200">
                {/* Digital Pattern Background */}
                <div className="absolute inset-0 opacity-[0.05] overflow-hidden rounded-2xl" style={{ 
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #059669 10px, #059669 20px)',
                  backgroundSize: '20px 20px' 
                }}></div>

                {/* Header */}
                <div className="absolute top-4 left-6 right-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-green-800 font-bold text-lg">SkillSwap</h3>
                    <div className="text-green-700 font-semibold text-sm">Digital Wallet</div>
                  </div>
                </div>

                {/* Center E Rupees Amount */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-700 mb-2 flex items-center justify-center gap-2">
                      <span className="text-5xl">₹</span>
                      <span>{eRupees.toLocaleString()}</span>
                    </div>
                    <p className="text-green-600 font-semibold text-xl">E Rupees</p>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex justify-between items-center">
                    <div className="text-green-700 text-sm">
                      <div className="font-semibold">Digital Currency</div>
                      <div className="text-xs opacity-75">Launching Soon!</div>
                    </div>
                    <div className="text-green-600 text-xs text-right">
                      <div>Status</div>
                      <div className="font-bold">Pre-Launch</div>
                    </div>
                  </div>
                </div>

                {/* Premium shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 transform -skew-x-12 animate-shine"></div>
              </div>
            </div>

            {/* Bottom premium text */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white text-xl font-bold drop-shadow-2xl tracking-wide">Official E Rupees</p>
              <p className="text-green-200 text-lg font-semibold drop-shadow-lg">SkillSwap Digital Currency</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Please sign in to access redemption</h2>
          <p className="text-gray-500">You need to be logged in to redeem your credits.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ✅ Enhanced Header with Better Visibility */}
        <div className="text-center mb-10">
          <br></br>
          <br></br>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Convert Your Credits to E Rupees
          </h1>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto font-medium">
            Transform your earned credits into E Rupees - our upcoming digital currency that you'll be able to redeem for real money.
          </p>
        </div>

        {/* ✅ Main Content - Enhanced Visibility */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Current Balance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">💰</span> 
              Your Current Balance
            </h2>
            
            <div className="space-y-4">
              {/* Credits */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-semibold mb-1">Available Credits</p>
                <p className="text-3xl font-bold text-blue-800">{credits.toLocaleString()}</p>
              </div>
              
              {/* E Rupees */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200 relative">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-green-700 font-semibold">E Rupees Balance</p>
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Soon
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-700 flex items-center gap-1">
                  ₹{eRupees.toLocaleString()}
                </p>
                
                {/* View Button */}
                {eRupees > 0 && (
                  <button
                    onClick={() => setShowRupeeModal(true)}
                    className="mt-3 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    View E Rupees Card
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Conversion Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-2xl">🔄</span> 
              Convert Credits
            </h2>

            {/* Conversion Rate */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-4 text-center mb-6">
              <p className="font-bold text-lg">1000 Credits = ₹910 E Rupees</p>
              <p className="text-sm opacity-95 font-medium">(1 Credit = ₹0.910 E Rupees)</p>
            </div>

            {/* Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Credits to Convert
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={creditsToRedeem}
                    onChange={(e) => setCreditsToRedeem(e.target.value)}
                    placeholder="Enter credits amount"
                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
                    min={MIN_CREDITS}
                    max={credits}
                  />
                  <button
                    onClick={handleMaxCredits}
                    className="px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-bold transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Calculation */}
              {creditsToRedeem && (
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-800 font-semibold">You will receive:</span>
                    <span className="font-bold text-xl text-green-700">
                      ₹{calculatedRupees.toLocaleString()} E Rupees
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 font-medium">
                    Note: E Rupees will be fully functional once we launch!
                  </p>
                </div>
              )}

              {/* Convert Button */}
              <button
                onClick={handleRedeem}
                disabled={isLoading || !creditsToRedeem || parseInt(creditsToRedeem) < MIN_CREDITS || parseInt(creditsToRedeem) > credits}
                className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                  isLoading || !creditsToRedeem || parseInt(creditsToRedeem) < MIN_CREDITS || parseInt(creditsToRedeem) > credits
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? 'Processing...' : 'Convert to E Rupees'}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Enhanced Info Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">About E Rupees</h3>
            <p className="text-gray-700 text-lg font-medium">Your future digital currency for real-world value</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Coming Soon</h4>
              <p className="text-gray-700 text-sm font-medium">
                E Rupees will launch soon with full cash redemption capabilities
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💵</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Real Money Value</h4>
              <p className="text-gray-700 text-sm font-medium">
                Convert E Rupees to real money through UPI and bank transfers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">Secure & Safe</h4>
              <p className="text-gray-700 text-sm font-medium">
                Your E Rupees are securely stored and protected
              </p>
            </div>
          </div>

          {/* Launch Ready Banner */}
          <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 text-center">
            <h4 className="text-2xl font-bold mb-3">🎯 E Rupees Launch Ready!</h4>
            <p className="text-green-100 text-lg font-medium">
              Start accumulating E Rupees now. Once launched, you'll be able to redeem them for real cash instantly!
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ERupeesModal />

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* ✅ Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes cardSway {
          from { transform: rotateY(-3deg) rotateX(1deg); }
          to { transform: rotateY(3deg) rotateX(-1deg); }
        }
        
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-200%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-cardSway { animation: cardSway 6s alternate infinite ease-in-out; }
        .animate-cardFloat { animation: cardFloat 4s ease-in-out infinite; }
        .animate-shine { animation: shine 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default Redeem;
