import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Import the dynamic API client
import { apiClient } from "../config/api";

function Reedeem() {
  const { user, isSignedIn } = useUser();

  const [credits, setCredits] = useState(0);
  const [creditsToCashout, setCreditsToCashout] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [finalAmount, setFinalAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mongoUserId, setMongoUserId] = useState("");
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [userStoredUpiId, setUserStoredUpiId] = useState("");

  // New business model constants
  const CONVERSION_RATE = 1; // 1 credit = 1 rupee
  const PLATFORM_FEE_RATE = 0.05; // 5% platform fee
  const MIN_CREDITS = 200; // Minimum 200 credits to cashout

  // ✅ Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isSignedIn) return;
      try {
        const res = await apiClient.post("/api/users/sync", {
          clerkId: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
        });
        const data = res.data;
        setCredits(data.totalCredits);
        setUserStoredUpiId(data.upiId || "");
        setUpiId(data.upiId || "");
        setMongoUserId(data._id);
      } catch (err) {
        console.error("Failed to fetch user data", err);
        toast.error("Failed to load user data");
      }
    };

    fetchUserData();
  }, [isSignedIn, user]);

  // Calculate amounts when credits input changes
  useEffect(() => {
    if (creditsToCashout) {
      const amount = parseInt(creditsToCashout) * CONVERSION_RATE;
      const fee = amount * PLATFORM_FEE_RATE;
      const final = amount - fee;

      setCalculatedAmount(amount);
      setPlatformFee(fee);
      setFinalAmount(final);
    } else {
      setCalculatedAmount(0);
      setPlatformFee(0);
      setFinalAmount(0);
    }
  }, [creditsToCashout]);

  // ✅ Super simple UPI ID change handler
  const handleUpiIdChange = (e) => {
    setUpiId(e.target.value);
  };

  // Handle max button click
  const handleMaxCredits = () => {
    setCreditsToCashout(credits.toString());
  };

  // Handle cashout initiation
  const handleInitiateCashout = () => {
    const cashoutAmount = parseInt(creditsToCashout);

    if (!cashoutAmount || cashoutAmount < MIN_CREDITS) {
      toast.error(`Minimum ${MIN_CREDITS} credits required for cashout`);
      return;
    }

    if (cashoutAmount > credits) {
      toast.error("Insufficient credits");
      return;
    }

    setShowCashoutModal(true);
  };

  // Handle final cashout submission
  const handleCashoutSubmit = async () => {
    if (!upiId.trim()) {
      toast.error("Please enter your UPI ID");
      return;
    }

    const cashoutAmount = parseInt(creditsToCashout);
    setIsLoading(true);

    try {
      const response = await apiClient.post("/api/users/cashout", {
        userId: mongoUserId,
        creditsToCashout: cashoutAmount,
        grossAmount: calculatedAmount,
        platformFee: platformFee,
        netAmount: finalAmount,
        upiId: upiId.trim(),
      });

      if (response.status === 200) {
        setCredits((prev) => prev - cashoutAmount);
        setCreditsToCashout("");
        setShowCashoutModal(false);
        toast.success(
          `Cashout successful! ₹${finalAmount.toFixed(
            2
          )} will be transferred to your UPI within 24 hours.`
        );
      }
    } catch (error) {
      console.error("Cashout failed:", error);
      const errorMessage =
        error.response?.data?.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Simple Cashout Modal Component
  const CashoutModal = () => {
    if (!showCashoutModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">💳</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Confirm Cashout
            </h3>
            <p className="text-gray-600">
              Enter your UPI ID to receive payment
            </p>
          </div>

          {/* Amount Summary */}
          <div className="bg-white rounded-xl p-4 mb-6 border-2 border-gray-300 shadow-inner">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-800 font-semibold">Credits:</span>
                <span className="font-bold text-gray-900">
                  {creditsToCashout}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-800 font-semibold">
                  Gross Amount:
                </span>
                <span className="font-bold text-gray-900">
                  ₹{calculatedAmount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-800 font-semibold">
                  Platform Fee (5%):
                </span>
                <span className="font-bold text-red-700">
                  -₹{platformFee.toFixed(2)}
                </span>
              </div>
              <hr className="border-gray-400 my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">You'll Receive:</span>
                <span className="text-green-700">
                  ₹{finalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ SIMPLE UPI INPUT - NO VALIDATION */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              UPI ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={upiId}
              onChange={handleUpiIdChange}
              placeholder="yourname@upi--Paste your UPI ID Here"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-medium"
            />
            <p className="text-gray-600 text-sm mt-2">
              Payment will be processed within 24 hours
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCashoutModal(false)}
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleCashoutSubmit}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${isLoading
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
                }`}
            >
              {isLoading ? "Processing..." : "Confirm Cashout"}
            </button>
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Please sign in to access cashout
          </h2>
          <p className="text-gray-500">
            You need to be logged in to cashout your credits.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <br></br>
          <br></br>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <span className="animate-pulse mr-2">💰</span>
            Instant Cashout Available
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Convert Credits to Cash
          </h1>
          <p className="text-gray-700 text-xl max-w-2xl mx-auto">
            Turn your earned credits into real money instantly. 1 Credit = ₹1
            with only 5% platform fee.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Current Balance */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">💎</span>
              Your Wallet
            </h2>

            <div className="space-y-6">
              {/* Credits Balance */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative">
                  <p className="text-blue-100 font-semibold mb-2">
                    Available Credits
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-4xl font-bold">
                      {credits.toLocaleString()}
                    </p>
                    <span className="text-lg bg-white px-2 py-1 text-blue-700 rounded-full">
                      Credits
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm mt-2">
                    ≈ ₹{credits.toLocaleString()} cash value
                  </p>
                </div>
              </div>

              {/* Cashout Status */}
              <div
                className={`rounded-xl p-4 border-2 ${credits >= MIN_CREDITS
                    ? "bg-green-50 border-green-200"
                    : "bg-orange-50 border-orange-200"
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">
                    {credits >= MIN_CREDITS ? "✅" : "⏰"}
                  </span>
                  <p className="font-bold text-gray-800">
                    {credits >= MIN_CREDITS
                      ? "Cashout Available!"
                      : "Cashout Threshold"}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {credits >= MIN_CREDITS
                    ? "You can cashout your credits now"
                    : `Need ${MIN_CREDITS - credits
                    } more credits to unlock cashout`}
                </p>
              </div>
            </div>
          </div>

          {/* Cashout Section */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">🚀</span>
              Quick Cashout
            </h2>

            {/* Conversion Info */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 text-center mb-6">
              <div className="mb-2">
                <p className="text-2xl font-bold">1 Credit = ₹1</p>
                <p className="text-green-100 text-sm">
                  5% platform fee applies
                </p>
              </div>
              <div className="bg-green-500 text-white p-3 rounded-md text-center shadow-sm">
                <p className="mb-0 font-medium">
                  ✨ Instant transfer to your UPI
                </p>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Credits to Cashout
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={creditsToCashout}
                    onChange={(e) => setCreditsToCashout(e.target.value)}
                    placeholder={`Minimum ${MIN_CREDITS} credits`}
                    className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 font-medium"
                    min={MIN_CREDITS}
                    max={credits}
                  />
                  <button
                    onClick={handleMaxCredits}
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold transition-colors"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Calculation Display */}
              {creditsToCashout &&
                parseInt(creditsToCashout) >= MIN_CREDITS && (
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-300 shadow-inner">
                    <h4 className="font-bold text-gray-900 mb-3">
                      Cashout Breakdown
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-800 font-semibold">
                          Gross Amount:
                        </span>
                        <span className="font-bold text-gray-900">
                          ₹{calculatedAmount}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-800 font-semibold">
                          Platform Fee (5%):
                        </span>
                        <span className="font-bold text-red-700">
                          -₹{platformFee.toFixed(2)}
                        </span>
                      </div>
                      <hr className="border-gray-400 my-2" />
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900">You'll Receive:</span>
                        <span className="text-green-700">
                          ₹{finalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-3 flex items-center gap-1 font-medium">
                      <span>💳</span>
                      Transferred to your UPI within 24 hours
                    </p>
                  </div>
                )}

              {/* Cashout Button */}
              <button
                onClick={handleInitiateCashout}
                disabled={
                  !creditsToCashout ||
                  parseInt(creditsToCashout) < MIN_CREDITS ||
                  parseInt(creditsToCashout) > credits
                }
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform ${!creditsToCashout ||
                    parseInt(creditsToCashout) < MIN_CREDITS ||
                    parseInt(creditsToCashout) > credits
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                  }`}
              >
                {!creditsToCashout
                  ? "Enter Amount to Cashout"
                  : parseInt(creditsToCashout) < MIN_CREDITS
                    ? `Minimum ${MIN_CREDITS} Credits Required`
                    : parseInt(creditsToCashout) > credits
                      ? "Insufficient Credits"
                      : `Cashout ₹${finalAmount.toFixed(2)} Now`}
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">
              How Cashout Works
            </h3>
            <p className="text-gray-600 text-lg">
              Simple, fast, and secure money transfers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Instant Processing
              </h4>
              <p className="text-gray-600 text-sm">
                Your cashout is processed immediately and transferred within 24
                hours
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏦</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                UPI Direct Transfer
              </h4>
              <p className="text-gray-600 text-sm">
                Money goes directly to your UPI ID - no bank details needed
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                Secure & Safe
              </h4>
              <p className="text-gray-600 text-sm">
                All transactions are encrypted and comply with financial
                regulations
              </p>
            </div>
          </div>

          {/* Trust Banner */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 text-center">
            <h4 className="text-2xl font-bold mb-3">
              🎯 Trusted by 10,000+ Users
            </h4>
            <p className="text-blue-100 text-lg">
              Join thousands who have successfully cashed out over ₹1,00,000 in
              credits!
            </p>
          </div>
        </div>
      </div>

      {/* Cashout Modal */}
      <CashoutModal />

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
    </div>
  );
}

export default Reedeem;
