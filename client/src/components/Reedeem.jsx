import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Redeem() {
  const { user, isSignedIn } = useUser();
  
  const [credits, setCredits] = useState(0);
  const [skillCoins, setSkillCoins] = useState(0);
  const [creditsToRedeem, setCreditsToRedeem] = useState('');
  const [calculatedCoins, setCalculatedCoins] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mongoUserId, setMongoUserId] = useState("");

  // Conversion rate: 1000 credits = 1 SkillCoin
  const CONVERSION_RATE = 1000;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn) return;
      try {
        const res = await axios.post(
          "http://localhost:5000/api/users/sync",
          {
            clerkId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
          },
          { withCredentials: true }
        );
        const data = res.data;
        setCredits(data.totalCredits);
        setSkillCoins(data.skillCoins || 0); // Assuming you'll add this field to user model
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

  // Handle redeem submission
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
      // API call to redeem credits (you'll need to create this endpoint)
      const response = await axios.post(
        "http://localhost:5000/api/credits/redeem",
        {
          userId: mongoUserId,
          creditsToRedeem: creditsToDeduct,
          skillCoinsToReceive: coinsToReceive,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setCredits(prev => prev - creditsToDeduct);
        setSkillCoins(prev => prev + coinsToReceive);
        setCreditsToRedeem('');
        toast.success(`Successfully redeemed ${creditsToDeduct} credits for ${coinsToReceive} SkillCoin${coinsToReceive > 1 ? 's' : ''}!`);
      }
    } catch (error) {
      console.error("Redemption failed:", error);
      toast.error('Redemption failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle max button click
  const handleMaxCredits = () => {
    const maxRedeemableCredits = Math.floor(credits / CONVERSION_RATE) * CONVERSION_RATE;
    setCreditsToRedeem(maxRedeemableCredits.toString());
  };

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Please sign in to access redemption</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
        <br></br>
        <br></br>
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
          <div className="bg-white shadow-xl rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
              💰 Your Balance
            </h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <p className="text-sm text-blue-600 font-medium mb-2">Available Credits</p>
                <p className="text-4xl font-bold text-blue-700">{credits.toLocaleString()}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <p className="text-sm text-green-600 font-medium mb-2">SkillCoins</p>
                <p className="text-4xl font-bold text-green-600">{skillCoins.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Redemption Form */}
          <div className="bg-white shadow-xl rounded-xl p-8">
            <h2 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
              🔄 Convert Credits
            </h2>

            <div className="space-y-6">
              {/* Conversion Rate Info */}
              <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg p-4 text-center">
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
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min={CONVERSION_RATE}
                      max={credits}
                    />
                    <button
                      onClick={handleMaxCredits}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Calculation Display */}
                {creditsToRedeem && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                      <span>You will receive:</span>
                      <span className="font-bold text-lg text-green-600">
                        {calculatedCoins} SkillCoin{calculatedCoins !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {creditsToRedeem && parseInt(creditsToRedeem) % CONVERSION_RATE !== 0 && (
                      <p className="text-xs text-orange-600">
                        Note: {parseInt(creditsToRedeem) % CONVERSION_RATE} credits will remain unconverted
                      </p>
                    )}
                  </div>
                )}

                {/* Redeem Button */}
                <button
                  onClick={handleRedeem}
                  disabled={isLoading || !creditsToRedeem || parseInt(creditsToRedeem) < CONVERSION_RATE || parseInt(creditsToRedeem) > credits}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                    isLoading || !creditsToRedeem || parseInt(creditsToRedeem) < CONVERSION_RATE || parseInt(creditsToRedeem) > credits
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-green-600 text-white hover:from-blue-700 hover:to-green-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Redeem Credits'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white shadow-xl rounded-xl p-8">
          <h3 className="text-2xl font-semibold text-blue-700 mb-6 flex items-center gap-2">
            ℹ️ About SkillCoins
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="font-semibold text-blue-700 mb-2">Upcoming Launch</h4>
              <p className="text-gray-600 text-sm">
                SkillCoins will be launched soon with exclusive features and premium benefits.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h4 className="font-semibold text-green-600 mb-2">Premium Currency</h4>
              <p className="text-gray-600 text-sm">
                Access exclusive content, priority booking, and special rewards with SkillCoins.
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
      />
    </div>
  );
}

export default Redeem;
