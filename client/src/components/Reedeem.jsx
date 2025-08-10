import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Import the dynamic API client
import { apiClient } from '../config/api';

function Redeem() {
  const { user, isSignedIn } = useUser();
  
  const [credits, setCredits] = useState(0);
  const [skillCoins, setSkillCoins] = useState(0);
  const [creditsToRedeem, setCreditsToRedeem] = useState('');
  const [calculatedCoins, setCalculatedCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mongoUserId, setMongoUserId] = useState("");
  const [showCoinModal, setShowCoinModal] = useState(false);

  // Conversion rate: 1000 credits = 1 SkillCoin
  const CONVERSION_RATE = 1000;

  // ✅ Fetch user data using dynamic API
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
        setSkillCoins(data.skillCoins || 0);
        setMongoUserId(data._id);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        toast.error('Failed to load user data');
      }
    };

    fetchUserData();
  }, [isSignedIn, user]);

  // Calculate coins when credits input changes
  useEffect(() => {
    if (creditsToRedeem) {
      const coins = Math.floor(parseInt(creditsToRedeem) / CONVERSION_RATE);
      setCalculatedCoins(coins);
    } else {
      setCalculatedCoins(0);
    }
  }, [creditsToRedeem]);

  // Handle redeem submission using dynamic API
  const handleRedeem = async () => {
    const redeemAmount = parseInt(creditsToRedeem);
    
    if (!redeemAmount || redeemAmount < CONVERSION_RATE) {
      toast.error(`Minimum ${CONVERSION_RATE} credits required to redeem`);
      return;
    }

    if (redeemAmount > credits) {
      toast.error('Insufficient credits');
      return;
    }

    const coinsToReceive = Math.floor(redeemAmount / CONVERSION_RATE);
    const creditsToDeduct = coinsToReceive * CONVERSION_RATE;

    setIsLoading(true);

    try {
      const response = await apiClient.post(
        "/api/credits/redeem",
        {
          userId: mongoUserId,
          creditsToRedeem: creditsToDeduct,
          skillCoinsToReceive: coinsToReceive,
        }
      );

      if (response.status === 200) {
        setCredits(prev => prev - creditsToDeduct);
        setSkillCoins(prev => prev + coinsToReceive);
        setCreditsToRedeem('');
        toast.success(`Successfully redeemed ${creditsToDeduct} credits for ${coinsToReceive} SkillCoin${coinsToReceive > 1 ? 's' : ''}!`);
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
    const maxRedeemableCredits = Math.floor(credits / CONVERSION_RATE) * CONVERSION_RATE;
    setCreditsToRedeem(maxRedeemableCredits.toString());
  };

  // ✅ Updated SkillCoin Modal Component
  const SkillCoinModal = () => {
    if (!showCoinModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
        <div className="relative">
          {/* Close button */}
          <button
            onClick={() => setShowCoinModal(false)}
            className="absolute -top-6 -right-6 z-10 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-2xl hover:scale-110 transition-all duration-300"
          >
            ×
          </button>

          {/* Coin Container */}
          <div className="relative p-8 animate-coinFloat">
            {/* Outer magical glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-300 blur-2xl opacity-70 animate-pulse scale-110"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 blur-xl opacity-50 animate-pulse"></div>
            
            {/* Main Coin */}
            <div className="relative w-96 h-96 rounded-full bg-gradient-to-br from-yellow-400 via-amber-600 to-yellow-800 shadow-2xl border-8 border-yellow-900 overflow-hidden transform animate-coinSpin">
              
              {/* Inner coin face with brushed metal effect */}
              <div className="absolute inset-4 rounded-full bg-[#fde047] shadow-inner" style={{ backgroundImage: 'radial-gradient(circle, #fffbeb, #fde047, #f59e0b)' }}>
                {/* Background Pattern from original design */}
                <div className="absolute inset-0 opacity-[0.03] overflow-hidden rounded-full" style={{ background: 'url(/path-to-your-pattern.svg)', backgroundSize: '30px' }}></div>

                {/* Center SkillCoin Logo - From Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-48 h-48 text-yellow-900 opacity-80 drop-shadow-lg">
                    {/* Magnifying glass part */}
                    <circle cx="42" cy="50" r="14" stroke="currentColor" strokeWidth="3" fill="none" />
                    <line x1="32" y1="60" x2="25" y2="67" stroke="currentColor" strokeWidth="3" />
                    
                    {/* Graph line part */}
                    <path d="M45 45 L58 32 L70 42 L83 30" stroke="currentColor" strokeWidth="3" fill="none" />
                    
                    {/* Dots on the graph */}
                    <circle cx="45" cy="45" r="3" fill="currentColor" />
                    <circle cx="58" cy="32" r="3" fill="currentColor" />
                    <circle cx="70" cy="42" r="3" fill="currentColor" />
                    <circle cx="83" cy="30" r="3" fill="currentColor" />
                    <circle cx="25" cy="67" r="3" fill="currentColor" />
                  </svg>
                </div>

                {/* ✅ Circular Text - Corrected Orientation */}
                <div className="absolute inset-0">
                  <svg viewBox="0 0 400 400" className="w-full h-full">
                    <defs>
                      {/* A single path for both top and bottom text */}
                      <path
                        id="coin-text-path"
                        d="M 70, 200 a 130,130 0 1,1 260,0"
                      />
                    </defs>
                    
                    {/* Top engraved text */}
                    <text className="font-bold fill-amber-800" style={{ fontSize: '22px', letterSpacing: '3px' }}>
                      <textPath href="#coin-text-path" startOffset="50%" textAnchor="middle">
                        I PROMISE TO PAY THE BEARER
                      </textPath>
                    </text>
                    
                    {/* Bottom engraved text, rotated to appear at the bottom, right-side up */}
                    <text className="font-bold fill-amber-800" style={{ fontSize: '22px', letterSpacing: '3px' }} transform="rotate(180 200 200)">
                       <textPath href="#coin-text-path" startOffset="50%" textAnchor="middle">
                        VALUE OF 1 SKILLCOIN
                      </textPath>
                    </text>
                  </svg>
                </div>

                {/* Premium shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-shine"></div>
              </div>
            </div>

            {/* Bottom premium text */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white text-xl font-bold drop-shadow-2xl tracking-wide">Official SkillCoin</p>
              <p className="text-yellow-200 text-lg font-semibold drop-shadow-lg">SkillSwap Premium Currency</p>
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
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <br />
      <br />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700 mb-4">
            🪙 Redeem Your Credits
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Convert your hard-earned credits into SkillCoins! SkillCoins will be our upcoming premium currency 
            that you can use for exclusive features and rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Balance Card */}
          <div className="bg-white shadow-xl rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
              💰 Your Balance
            </h2>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-2">Available Credits</p>
                <p className="text-4xl font-bold text-blue-700">{credits.toLocaleString()}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center border border-green-200 relative">
                <p className="text-sm text-green-600 font-medium mb-2">SkillCoins</p>
                <p className="text-4xl font-bold text-green-600 flex items-center justify-center gap-2">
                  <span>🪙</span>
                  {skillCoins.toLocaleString()}
                </p>
                
                {/* ✅ Enhanced View SkillCoin Button with Golden Shine */}
                {skillCoins > 0 && (
                  <button
                    onClick={() => setShowCoinModal(true)}
                    className="mt-6 relative px-6 py-3 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-yellow-900 rounded-full font-bold shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 text-sm overflow-hidden group animate-goldenGlow"
                  >
                    <span className="relative flex items-center gap-2">
                      <span className="text-lg">👁️</span>
                      <span>View Your SkillCoin</span>
                      <span className="text-lg animate-pulse">✨</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 transform -skew-x-12 animate-shine"></div>
                  </button>
                )}
                
                {skillCoins === 0 && (
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Redeem credits to get your first SkillCoin!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Redemption Form */}
          <div className="bg-white shadow-xl rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
              🔄 Convert Credits
            </h2>

            <div className="space-y-6">
              {/* Conversion Rate Info */}
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-4 text-center shadow-lg">
                <p className="font-semibold text-lg">Conversion Rate</p>
                <p className="text-2xl font-bold">{CONVERSION_RATE.toLocaleString()} Credits = 1 SkillCoin</p>
              </div>

              {/* Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Credits to Redeem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={creditsToRedeem}
                      onChange={(e) => setCreditsToRedeem(e.target.value)}
                      placeholder={`Minimum ${CONVERSION_RATE} credits`}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      min={CONVERSION_RATE}
                      max={credits}
                    />
                    <button
                      onClick={handleMaxCredits}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200 hover:scale-105"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Calculation Display */}
                {creditsToRedeem && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>You will receive:</span>
                      <span className="font-bold text-lg text-green-600 flex items-center gap-1">
                        <span>🪙</span>
                        {calculatedCoins} SkillCoin{calculatedCoins !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {creditsToRedeem && parseInt(creditsToRedeem) % CONVERSION_RATE !== 0 && (
                      <p className="text-xs text-orange-600 flex items-center gap-1">
                        <span>⚠️</span>
                        Note: {parseInt(creditsToRedeem) % CONVERSION_RATE} credits will remain unconverted
                      </p>
                    )}
                  </div>
                )}

                {/* Redeem Button */}
                <button
                  onClick={handleRedeem}
                  disabled={isLoading || !creditsToRedeem || parseInt(creditsToRedeem) < CONVERSION_RATE || parseInt(creditsToRedeem) > credits}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform ${
                    isLoading || !creditsToRedeem || parseInt(creditsToRedeem) < CONVERSION_RATE || parseInt(creditsToRedeem) > credits
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Redeem Credits'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white shadow-xl rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
          <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
            ℹ️ About SkillCoins
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="font-semibold text-blue-700 mb-2">Upcoming Launch</h4>
              <p className="text-gray-600 text-sm">
                SkillCoins will be launched soon with exclusive features and premium benefits.
              </p>
            </div>
            
            <div className="text-center p-4 transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="font-semibold text-green-600 mb-2">Premium Currency</h4>
              <p className="text-gray-600 text-sm">
                Access exclusive content, priority booking, and special rewards with SkillCoins.
              </p>
            </div>
            
            <div className="text-center p-4 transform hover:scale-105 transition-all duration-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-semibold text-purple-600 mb-2">Secure & Safe</h4>
              <p className="text-gray-600 text-sm">
                All redemptions are secure and your SkillCoins are safely stored in your account.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ SkillCoin Modal */}
      <SkillCoinModal />

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

      {/* ✅ Enhanced Custom CSS for premium animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        @keyframes coinSpin {
          from { transform: rotateY(-15deg); }
          to { transform: rotateY(15deg); }
        }
        
        @keyframes coinFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-200%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }

        @keyframes goldenGlow {
          0%, 100% {
            box-shadow: 0 0 15px 5px rgba(253, 224, 71, 0.4), 0 0 25px 10px rgba(252, 211, 77, 0.3);
          }
          50% {
            box-shadow: 0 0 25px 10px rgba(253, 224, 71, 0.6), 0 0 40px 15px rgba(252, 211, 77, 0.4);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-coinSpin {
          animation: coinSpin 4s alternate infinite ease-in-out;
        }
        
        .animate-coinFloat {
          animation: coinFloat 5s ease-in-out infinite;
        }
        
        .animate-shine {
          animation: shine 3.5s ease-in-out infinite;
        }

        .animate-goldenGlow {
          animation: goldenGlow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Redeem;
