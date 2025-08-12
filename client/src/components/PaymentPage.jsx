import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Import the dynamic API client (same as your Booking component)
import { apiClient } from '../config/api';

const creditPackages = [
  { 
    id: 1, 
    label: "11 Credits", 
    amount: 9, 
    credits: 11,
    originalPrice: 18,
    savings: "Save ₹9",
    bestFor: "Try it out",
    icon: "🚀"
  },
  { 
    id: 2, 
    label: "50 Credits", 
    amount: 49, 
    credits: 50,
    originalPrice: 100,
    savings: "Save ₹51",
    popular: true,
    bestFor: "Most Popular",
    icon: "⭐",
    badge: "BEST VALUE"
  },
  { 
    id: 3, 
    label: "100 Credits", 
    amount: 99, 
    credits: 100,
    originalPrice: 200,
    savings: "Save ₹101",
    bestFor: "Power User",
    icon: "💎"
  },
  { 
    id: 4, 
    label: "150 Credits", 
    amount: 149, 
    credits: 150,
    originalPrice: 300,
    savings: "Save ₹151",
    bestFor: "Professional",
    icon: "🏆"
  },
  { 
    id: 5, 
    label: "200 Credits", 
    amount: 199, 
    credits: 200,
    originalPrice: 400,
    savings: "Save ₹201",
    bestFor: "Enterprise",
    icon: "👑",
    badge: "MAXIMUM SAVINGS"
  },
];

const PaymentPage = () => {
  const { user } = useUser();
  const [selectedPackage, setSelectedPackage] = useState(
    creditPackages.find(p => p.popular) || creditPackages[0]
  );
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Check if user is logged in
    if (!user) {
      toast.error("Please login to purchase credits");
      return;
    }

    setLoading(true);
    
    try {
      // Load Razorpay script
      console.log('📦 Loading Razorpay SDK...');
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Payment system could not be loaded. Please check your internet connection.");
        setLoading(false);
        return;
      }
      console.log('✅ Razorpay SDK loaded');

      // ✅ Create order using apiClient (same pattern as your Booking component)
      console.log('📝 Creating payment order...');
      const orderResponse = await apiClient.post('/api/payment/order', {
        amount: selectedPackage.amount
      });

      if (orderResponse.status !== 200) {
        toast.error("Failed to create payment order");
        setLoading(false);
        return;
      }

      const orderData = orderResponse.data;
      console.log('✅ Order created:', orderData);

      // Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SkillSwap",
        description: `Purchase ${selectedPackage.credits} Credits - ${selectedPackage.bestFor}`,
        order_id: orderData.id,
        handler: async function (response) {
          console.log('🎉 Payment successful:', response);
          
          try {
            // ✅ Update credits using apiClient (same pattern as your Booking component)
            console.log('💳 Updating user credits...');
            
            const updateResponse = await apiClient.post('/api/payment/update-credits', {
              clerkId: user.id,
              creditsToAdd: selectedPackage.credits,
              paymentId: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            if (updateResponse.status !== 200) {
              toast.error(updateResponse.data.message || "Failed to update credits");
              return;
            }

            const creditUpdate = updateResponse.data;
            console.log('✅ Credits updated:', creditUpdate);

            // Show success toast
            toast.success(
              `🎉 Payment Successful! ${selectedPackage.credits} credits added to your account!`
            );
            
            // Optional: You can navigate somewhere or refresh data
            // navigate('/dashboard');
            
          } catch (error) {
            console.error('❌ Credit update failed:', error);
            const errorMessage = error?.response?.data?.message || "Failed to update credits";
            
            toast.error(
              `⚠️ Payment completed but failed to update credits automatically. Please contact support with Payment ID: ${response.razorpay_payment_id}`
            );
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#6366F1",
        },
        modal: {
          ondismiss: function() {
            console.log('Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error('💥 Payment error:', error);
      const errorMessage = error?.response?.data?.message || error.message || "Payment failed";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <br></br>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-6">
            <span className="animate-pulse mr-2">🔥</span>
            Limited Time Offer - Up to 50% Savings!
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Unlock Your Potential
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Invest in yourself today. Get instant access to premium learning content with our credit system.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center items-center space-x-8 text-gray-500 mb-12">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Instant Access
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Secure Payment
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              No Subscription
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            {creditPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${
                  selectedPackage.id === pkg.id
                    ? "bg-gradient-to-b from-indigo-500 to-purple-600 text-white scale-105 shadow-2xl"
                    : "bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-lg"
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      {pkg.badge}
                    </div>
                  </div>
                )}

                {/* Popular Badge */}
                {pkg.popular && selectedPackage.id !== pkg.id && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-2xl rounded-tr-2xl">
                    POPULAR
                  </div>
                )}

                <div className="text-center">
                  {/* Icon */}
                  <div className="text-4xl mb-3">{pkg.icon}</div>
                  
                  {/* Package Name */}
                  <h3 className={`text-lg font-bold mb-2 ${
                    selectedPackage.id === pkg.id ? "text-white" : "text-gray-800"
                  }`}>
                    {pkg.label}
                  </h3>
                  
                  {/* Best For */}
                  <p className={`text-sm mb-4 ${
                    selectedPackage.id === pkg.id ? "text-indigo-100" : "text-indigo-600"
                  }`}>
                    {pkg.bestFor}
                  </p>
                  
                  {/* Pricing */}
                  <div className="mb-4">
                    {pkg.originalPrice && (
                      <p className={`text-sm line-through ${
                        selectedPackage.id === pkg.id ? "text-indigo-200" : "text-gray-400"
                      }`}>
                        ₹{pkg.originalPrice}
                      </p>
                    )}
                    <p className={`text-3xl font-bold ${
                      selectedPackage.id === pkg.id ? "text-white" : "text-gray-900"
                    }`}>
                      ₹{pkg.amount}
                    </p>
                  </div>
                  
                  {/* Savings */}
                  {pkg.savings && (
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedPackage.id === pkg.id 
                        ? "bg-white bg-opacity-20 text-white" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {pkg.savings}
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedPackage.id === pkg.id && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Package Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedPackage.icon} {selectedPackage.label}
                </h3>
                <p className="text-gray-600">{selectedPackage.bestFor} Package</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">₹{selectedPackage.amount}</p>
                {selectedPackage.savings && (
                  <p className="text-green-600 font-semibold">{selectedPackage.savings}</p>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                {selectedPackage.credits} Learning Credits
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Instant Activation
              </div>
              <div className="flex items-center text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Never Expires
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={handlePayment}
              disabled={loading || !user}
              className={`w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
                loading || !user
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white hover:scale-105 hover:shadow-2xl'
              }`}
            >
              {!user ? (
                "Please Login to Purchase"
              ) : loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Your Order...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  🚀 Start Learning Now - Pay ₹{selectedPackage.amount}
                </span>
              )}
            </button>

            {/* Security Notice */}
            <div className="flex items-center justify-center mt-4 text-gray-500 text-sm">
              <span className="mr-2">🔒</span>
              Secured by Razorpay • 256-bit SSL encryption
            </div>
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="text-gray-600 mb-4">Join thousands of learners who've already invested in their future</p>
            <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
              <div>⭐⭐⭐⭐⭐ 4.9/5 rating</div>
              <div>10,000+ happy learners</div>
              <div>24/7 support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container (same as your Booking component) */}
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
};

export default PaymentPage;
