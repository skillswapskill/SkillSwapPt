import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaUserFriends,
  FaSeedling,
  FaChevronDown,
  FaChevronUp,
  FaTrophy,
  FaFire,
  FaCode,
  FaPen,
  FaBrain,
  FaGamepad,
  FaCheck,
  FaStar,
  FaTimes,
  FaMagic
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

// ✅ Import the dynamic API client
import { apiClient } from "../config/api";

// Enhanced Sun/Moon illustrations with improved gradients and animations
const scenes = {
  morning: (
    <svg
      width="350"
      height="350"
      viewBox="0 0 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse"
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient
          id="sunrise"
          cx="0.5"
          cy="0.5"
          r="0.8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFE066" stopOpacity="1" />
          <stop offset="0.5" stopColor="#FF9A56" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FF6B6B" stopOpacity="0.3" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="175"
        cy="175"
        r="140"
        fill="url(#sunrise)"
        filter="url(#glow)"
      />
      <circle cx="175" cy="175" r="120" fill="url(#sunrise)" opacity="0.6" />
    </svg>
  ),
  afternoon: (
    <svg
      width="350"
      height="350"
      viewBox="0 0 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse"
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient
          id="sun"
          cx="0.5"
          cy="0.5"
          r="0.8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF59D" stopOpacity="1" />
          <stop offset="0.5" stopColor="#FFD54F" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFCA28" stopOpacity="0.4" />
        </radialGradient>
        <filter id="sunGlow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="175"
        cy="175"
        r="140"
        fill="url(#sun)"
        filter="url(#sunGlow)"
      />
      <circle cx="175" cy="175" r="120" fill="url(#sun)" opacity="0.7" />
    </svg>
  ),
  evening: (
    <svg
      width="350"
      height="350"
      viewBox="0 0 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse"
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient
          id="sunset"
          cx="0.5"
          cy="0.5"
          r="0.8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFAB91" stopOpacity="1" />
          <stop offset="0.5" stopColor="#FF8A65" stopOpacity="0.8" />
          <stop offset="1" stopColor="#FF7043" stopOpacity="0.3" />
        </radialGradient>
        <filter id="sunsetGlow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="175"
        cy="175"
        r="140"
        fill="url(#sunset)"
        filter="url(#sunsetGlow)"
      />
      <circle cx="175" cy="175" r="120" fill="url(#sunset)" opacity="0.6" />
    </svg>
  ),
  night: (
    <svg
      width="350"
      height="350"
      viewBox="0 0 350 350"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute left-0 top-1/4 z-10 pointer-events-none select-none animate-pulse"
      style={{ opacity: 0.9 }}
    >
      <defs>
        <radialGradient
          id="moonGlow"
          cx="0.5"
          cy="0.5"
          r="0.8"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E3F2FD" stopOpacity="1" />
          <stop offset="0.5" stopColor="#BBDEFB" stopOpacity="0.8" />
          <stop offset="1" stopColor="#90CAF9" stopOpacity="0.3" />
        </radialGradient>
        <filter id="nightGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle
        cx="175"
        cy="175"
        r="140"
        fill="url(#moonGlow)"
        filter="url(#nightGlow)"
      />
      <circle cx="175" cy="175" r="120" fill="url(#moonGlow)" opacity="0.7" />
      <circle
        cx="100"
        cy="80"
        r="2"
        fill="#FFF"
        opacity="0.8"
        className="animate-ping"
      />
      <circle
        cx="280"
        cy="120"
        r="1.5"
        fill="#FFF"
        opacity="0.6"
        className="animate-ping"
        style={{ animationDelay: "1s" }}
      />
      <circle
        cx="250"
        cy="60"
        r="1"
        fill="#FFF"
        opacity="0.7"
        className="animate-ping"
        style={{ animationDelay: "2s" }}
      />
    </svg>
  ),
};

// 💫 FLOATING PARTICLES COMPONENT
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* More particles with varied sizes */}
      {[...Array(35)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-60 animate-float"
          style={{
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 12}s`,
            animationDuration: `${8 + Math.random() * 6}s`,
          }}
        />
      ))}
      
      {/* Enhanced sparkles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute text-white opacity-50 animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            fontSize: `${10 + Math.random() * 12}px`,
          }}
        >
          ✨
        </div>
      ))}
      
      {/* Extra glow effects */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`glow-${i}`}
          className="absolute w-2 h-2 bg-purple-300/40 rounded-full blur-sm animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// 🎊 CONFETTI COMPONENT
const Confetti = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: ['#FF6B9D', '#C44569', '#F8B500', '#6C5CE7', '#00D2FF', '#FF9FF3'][Math.floor(Math.random() * 6)],
            }}
          />
        </div>
      ))}
    </div>
  );
};

// 💎 FULLY VISIBLE FLOATING CHALLENGE BUTTON - FIXED!
const FloatingChallengeButton = ({ challenge, onOpen, isCompleted }) => {
  // ✅ Get the correct icon component
  const getIconComponent = (challengeType) => {
    switch (challengeType) {
      case 'code':
        return FaCode;
      case 'language':
        return FaPen;
      case 'math':
        return FaBrain;
      case 'pattern':
        return FaGamepad;
      case 'word':
        return FaPen;
      case 'creative':
        return FaStar;
      case 'emoji':
        return FaGamepad;
      default:
        return FaGamepad;
    }
  };

  const IconComponent = getIconComponent(challenge.type);

  return (
    // 🔥 FIXED: Added more margin to prevent badge cutoff
    <div className="fixed bottom-12 right-12 z-[9999]">
      <button
        onClick={onOpen}
        className="group relative overflow-visible transform transition-all duration-300 hover:scale-110"
      >
        {/* Enhanced multi-layer glowing background */}
        <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-full animate-pulse opacity-60 group-hover:opacity-80 transition-opacity duration-300 blur-lg" />
        <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-400 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300 blur-md" />
        
        {/* Main button with enhanced styling */}
        <div className={`relative flex flex-col items-center justify-center w-20 h-20 rounded-full shadow-2xl transition-all duration-300 transform group-hover:scale-105 ${
          isCompleted 
            ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 border-2 border-green-300' 
            : 'bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 border-2 border-white/30'
        }`}>
          
          {/* Enhanced background overlay for better contrast */}
          <div className="absolute inset-0 rounded-full bg-black/20 backdrop-blur-sm"></div>
          
          {/* Icon with enhanced visibility */}
          <div className="relative z-10 text-white drop-shadow-lg mb-1">
            {isCompleted ? 
              <FaCheck className="text-2xl filter drop-shadow-md" /> : 
              <IconComponent className="text-2xl filter drop-shadow-md" />
            }
          </div>
          
          {/* Credits text with perfect visibility */}
          <div className="relative z-10 text-white font-black text-sm drop-shadow-lg tracking-wide">
            <span className="bg-black/30 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              +{challenge.credits}
            </span>
          </div>
          
          {/* Enhanced pulse rings */}
          <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping opacity-75" />
          <div className="absolute inset-0 rounded-full border border-white/40 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
        </div>

        {/* 🔥 FIXED: FULLY VISIBLE "Try Now" badge */}
        {!isCompleted && (
          <div className="absolute -top-4 -right-8 transform transition-all duration-300 hover:scale-110 z-10">
            <div className="relative">
              {/* Enhanced glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-md opacity-75"></div>
              
              {/* Main badge with FULL VISIBILITY */}
              <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white font-black px-4 py-2 rounded-full animate-bounce shadow-2xl border-2 border-white">
                <div className="absolute inset-0 bg-black/10 rounded-full"></div>
                <span className="relative text-xs drop-shadow-lg whitespace-nowrap tracking-wide">
                  Try Now!
                </span>
              </div>
              
              {/* Extra glow ring */}
              <div className="absolute inset-0 border-2 border-orange-300 rounded-full animate-pulse opacity-50"></div>
            </div>
          </div>
        )}

        {/* 🔥 FIXED: FULLY VISIBLE completion badge */}
        {isCompleted && (
          <div className="absolute -top-4 -right-8 transform transition-all duration-300 z-10">
            <div className="relative">
              {/* Enhanced glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full blur-md opacity-75"></div>
              
              {/* Main badge with FULL VISIBILITY */}
              <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-black px-4 py-2 rounded-full shadow-2xl border-2 border-white">
                <div className="absolute inset-0 bg-black/10 rounded-full"></div>
                <span className="relative text-xs drop-shadow-lg whitespace-nowrap tracking-wide flex items-center">
                  Done! <span className="ml-1">✨</span>
                </span>
              </div>
              
              {/* Extra glow ring */}
              <div className="absolute inset-0 border-2 border-green-300 rounded-full animate-pulse opacity-50"></div>
            </div>
          </div>
        )}

        {/* Floating sparkles around button */}
        <div className="absolute -inset-12 pointer-events-none">
          <div className="absolute top-2 right-2 text-yellow-300 text-sm animate-ping opacity-60">✨</div>
          <div className="absolute bottom-2 left-2 text-pink-300 text-xs animate-ping opacity-40" style={{animationDelay: '1s'}}>✨</div>
          <div className="absolute top-1/2 left-2 text-purple-300 text-sm animate-ping opacity-50" style={{animationDelay: '2s'}}>💫</div>
        </div>
      </button>
    </div>
  );
};

// 🌟 ENHANCED CHALLENGE MODAL WITH PERFECT STYLING
const ChallengeModal = ({ challenge, isOpen, onClose, onComplete, isCompleted, userAnswer }) => {
  const [answer, setAnswer] = useState(userAnswer || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // ✅ Get the correct icon component
  const getIconComponent = (challengeType) => {
    switch (challengeType) {
      case 'code':
        return FaCode;
      case 'language':
        return FaPen;
      case 'math':
        return FaBrain;
      case 'pattern':
        return FaGamepad;
      case 'word':
        return FaPen;
      case 'creative':
        return FaStar;
      case 'emoji':
        return FaGamepad;
      default:
        return FaGamepad;
    }
  };

  const IconComponent = getIconComponent(challenge.type);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFeedback(null);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    // Simulate validation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Call backend to complete challenge
    const result = await onComplete(challenge, answer);
    
    if (result.success) {
      setFeedback({
        type: 'success',
        message: `🎉 Correct! You earned ${result.creditsEarned} credits!`
      });
      setShowConfetti(true);
      
      setTimeout(() => {
        setShowConfetti(false);
        setFeedback(null);
        onClose();
      }, 2500);
    } else {
      setFeedback({
        type: 'error',
        message: result.message || '❌ Incorrect answer. Try again!'
      });
      
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    }
    
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Backdrop with particles */}
      <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-lg">
        <FloatingParticles />
        
        {/* Modal Container */}
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-6">
          {/* Modal */}
          <div className="relative w-full max-w-2xl animate-modal-enter">
            {/* Enhanced glowing backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 via-purple-400 to-indigo-400 rounded-3xl blur-xl opacity-30" />
            
            {/* Main modal content */}
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
              {/* Enhanced glassmorphism overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-transparent rounded-3xl" />
              
              {/* Content */}
              <div className="relative p-6 sm:p-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center space-x-4 sm:space-x-5">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-400/40 to-purple-600/40 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/40 shadow-xl">
                      <IconComponent className="text-2xl sm:text-3xl text-white drop-shadow-lg" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-lg mb-2">
                        {challenge.title}
                      </h2>
                      <div className="flex items-center space-x-2">
                        <FaTrophy className="text-yellow-400 text-lg drop-shadow-md" />
                        <span className="text-yellow-200 font-black text-lg drop-shadow-md">
                          {challenge.credits} Credits
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={onClose}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full border border-white/40 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-xl"
                  >
                    <FaTimes className="text-white/90 text-lg drop-shadow-md" />
                  </button>
                </div>

                {/* Description */}
                <div className="mb-6 sm:mb-8">
                  <p className="text-white text-lg sm:text-xl mb-4 sm:mb-6 leading-relaxed drop-shadow-md">
                    {challenge.description}
                  </p>
                  <div className="bg-blue-500/30 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-blue-300/40 shadow-xl">
                    <div className="flex items-start space-x-3">
                      <FaMagic className="text-blue-300 text-lg mt-1 drop-shadow-md" />
                      <p className="text-blue-100 font-semibold text-lg drop-shadow-md">
                        {challenge.instruction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Section */}
                {!isCompleted ? (
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-600 rounded-2xl blur opacity-30"></div>
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={challenge.placeholder}
                        className="relative w-full p-4 sm:p-6 bg-white/20 backdrop-blur-sm border border-white/40 rounded-2xl text-white text-lg placeholder-white/70 focus:outline-none focus:border-pink-400/70 focus:ring-2 focus:ring-pink-400/30 transition-all duration-200 resize-none shadow-xl"
                        rows={challenge.type === 'code' || challenge.type === 'creative' ? 5 : 3}
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-50"></div>
                      <button
                        onClick={handleSubmit}
                        disabled={!answer.trim() || isSubmitting}
                        className={`relative w-full py-4 sm:py-5 px-6 sm:px-8 rounded-2xl font-black text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl ${
                          answer.trim() && !isSubmitting
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white'
                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center space-x-3">
                            <div className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                            <span className="drop-shadow-md">Checking your answer...</span>
                          </div>
                        ) : (
                          <span className="drop-shadow-md flex items-center justify-center">
                            <FaStar className="mr-3" />
                            Submit Challenge
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Enhanced Feedback Message */}
                    {feedback && (
                      <div className={`relative p-4 sm:p-6 rounded-2xl text-center font-black text-lg transition-all duration-300 transform shadow-2xl ${
                        feedback.type === 'success' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-2 border-green-300' 
                          : 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-red-300'
                      }`}>
                        <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
                        <div className="relative drop-shadow-md">
                          {feedback.message}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-10">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400/40 to-emerald-500/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-green-300/40 shadow-2xl">
                      <FaCheck className="text-4xl sm:text-5xl text-green-300 drop-shadow-lg" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-green-200 mb-4 drop-shadow-lg">
                      Challenge Completed! 🎉
                    </h3>
                    <p className="text-white/90 text-lg drop-shadow-md">
                      You earned {challenge.credits} credits! Come back tomorrow for a new challenge.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Confetti */}
      <Confetti show={showConfetti} />
    </>
  );
};

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [currentUserMongo, setCurrentUserMongo] = useState(null);
  const [treesPlanted, setTreesPlanted] = useState(10000);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedClerkData, setSelectedClerkData] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // 🎯 CHALLENGE STATE
  const [todaysChallenge, setTodaysChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [challengeAnswers, setChallengeAnswers] = useState({});
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  // Time logic
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 20) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // 🎯 CHALLENGE LOGIC - Updated for real backend
  const getTodaysChallenge = async () => {
    if (!user?.id) return null;
    
    try {
      const response = await apiClient.get('/api/challenges/daily', {
        params: { clerkId: user.id }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchChallenge = async () => {
      if (user?.id) {
        const challengeData = await getTodaysChallenge();
        if (challengeData?.success) {
          setTodaysChallenge(challengeData.challenge);
          
          // Update completion status
          if (challengeData.isCompleted) {
            setCompletedChallenges(new Set([challengeData.challenge.id]));
            setChallengeAnswers({ [challengeData.challenge.id]: challengeData.userAnswer });
          }
        }
      }
    };
    
    fetchChallenge();
  }, [user?.id]);

  const handleChallengeComplete = async (challenge, answer) => {
    try {
      // console.log('🎯 Completing challenge:', challenge.title);
      // console.log('👤 User ID:', user?.id);
      
      const response = await apiClient.post('/api/challenges/complete', {
        clerkId: user.id,
        challengeId: challenge.id,
        answer: answer
      });

      // console.log('📊 Challenge completion response:', response.data);

      if (response.data.success) {
        // Update local state
        const newCompletions = new Set([...completedChallenges, challenge.id]);
        const newAnswers = { ...challengeAnswers, [challenge.id]: answer };
        
        setCompletedChallenges(newCompletions);
        setChallengeAnswers(newAnswers);

        // console.log(`🎉 Challenge completed! Earned ${response.data.creditsEarned} credits`);
        // console.log(`💰 New total credits: ${response.data.newTotalCredits}`);
        
        return { success: true, creditsEarned: response.data.creditsEarned };
      } else {
        console.error('❌ Challenge completion failed:', response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('💥 Error completing challenge:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // ✅ Fixed Clerk data fetching using dynamic API
  useEffect(() => {
    const fetchClerkData = async () => {
      if (!selectedUser?.clerkId) return;
      try {
        const res = await apiClient.get(
          `/api/clerk/user/${selectedUser.clerkId}`
        );
        setSelectedClerkData(res.data);
      } catch (err) {
        console.error("ERROR fetching Clerk user data", err);
      }
    };
    fetchClerkData();
  }, [selectedUser]);

  const getProfilePic = (userObj) => {
    if (!userObj) return "/user.png";
    if (userObj.profile_image_url) return userObj.profile_image_url;
    if (userObj.external_accounts && Array.isArray(userObj.external_accounts)) {
      for (const account of userObj.external_accounts) {
        if (account.avatar_url) return account.avatar_url;
        if (account.image_url) return account.image_url;
      }
    }
    if (userObj.image_url) return userObj.image_url;
    if (userObj.profilePic) return userObj.profilePic;
    return "/user.png";
  };

  // ✅ Sync user using dynamic API
  const syncLoggedInUser = async () => {
    try {
      if (!user?.id) return;
      const profilePic = getProfilePic(user);

      const response = await apiClient.post("/api/users/sync", {
        clerkId: user.id,
        name: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        profilePic: profilePic,
      });

      setCurrentUserMongo(response.data);
      // console.log("Synced current user:", response.data);
    } catch (err) {
      console.error("ERROR: Error syncing logged-in user:", err);
    }
  };

  // ✅ Fetch all users using dynamic API
  const fetchAllUsers = async () => {
    try {
      const res = await apiClient.get("/api/users/all");
      const users = res.data.users || [];
      // console.log("Fetched all users:", users);
      setAllUsers(users);
    } catch (err) {
      console.error("ERROR: Error fetching users:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTreesPlanted((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSignedIn && user?.id) {
      syncLoggedInUser();
      fetchAllUsers();
    }
  }, [isSignedIn, user?.id]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5 || hour >= 20) return "Good Night 🌙";
    if (hour < 12) return "Good Morning 🌅";
    if (hour < 18) return "Good Afternoon 🌇";
    return "Good Evening 🌃";
  };

  // Multiple filtering approaches to ensure current user is excluded
  const getFilteredUsers = () => {
    if (!allUsers.length) return [];

    return allUsers.filter((u) => {
      if (u.clerkId && user?.id && u.clerkId === user.id) {
        return false;
      }

      if (u.name && user?.fullName && u.name === user.fullName) {
        return false;
      }

      if (
        u.email &&
        user?.primaryEmailAddress?.emailAddress &&
        u.email === user.primaryEmailAddress.emailAddress
      ) {
        return false;
      }

      if (
        currentUserMongo?._id &&
        u._id &&
        u._id.toString() === currentUserMongo._id.toString()
      ) {
        return false;
      }

      return true;
    });
  };

  // Enhanced user display logic with search and pagination
  const getDisplayUsers = () => {
    const filteredUsers = getFilteredUsers();

    const searchFiltered = filteredUsers.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
        (u.skills &&
          u.skills.some((skill) =>
            skill.toLowerCase().includes(search.toLowerCase())
          ))
    );

    if (search.trim()) {
      return searchFiltered;
    }

    if (!showAllUsers) {
      return searchFiltered.slice(0, 6);
    }

    return searchFiltered;
  };

  const displayUsers = getDisplayUsers();
  const totalFilteredUsers = getFilteredUsers().length;

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 sm:px-6 py-10 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-2 h-2 bg-blue-300 rounded-full animate-bounce opacity-40"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-1 h-1 bg-purple-300 rounded-full animate-bounce opacity-30"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-pink-300 rounded-full animate-bounce opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-60 right-1/3 w-1 h-1 bg-indigo-300 rounded-full animate-bounce opacity-35"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute bottom-64 right-10 w-1 h-1 bg-yellow-300 rounded-full animate-bounce opacity-40"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute top-32 left-1/3 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-30"
          style={{ animationDelay: "5s" }}
        ></div>
      </div>

      {/* Dynamic Sun/Moon Background */}
      <div className="hidden md:block">{scenes[getTimeOfDay()]}</div>

      <br />
      <br />

      {/* Enhanced Header with glass morphism effect */}
      <div className="text-center mb-8 relative z-20">
        <div className="inline-flex items-center justify-center px-6 sm:px-8 py-4 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <HiSparkles className="text-yellow-400 text-xl sm:text-2xl mr-3 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {getTimeGreeting()}, {user?.firstName || "Learner"}
          </h1>
          <HiSparkles className="text-yellow-400 text-xl sm:text-2xl ml-3 animate-pulse" />
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="flex justify-center mb-12 z-20 relative">
        <div className="relative group w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
          <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-full px-6 py-4 shadow-2xl border border-white/50 group-hover:border-white/70 transition-all duration-300">
            <FaSearch className="text-blue-600 mr-4 text-lg group-hover:scale-110 transition-transform duration-200" />
            <input
              type="text"
              placeholder="Dive into your Skills"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (e.target.value.trim()) {
                  setShowAllUsers(false);
                }
              }}
              className="outline-none w-full bg-transparent text-blue-700 placeholder-blue-400 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Users Grid */}
      <div className="relative z-20 mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 justify-items-center max-w-4xl mx-auto">
          {displayUsers.map((u, idx) => (
            <div
              key={`${u._id || u.clerkId || idx}`}
              className="flex flex-col items-center w-24 sm:w-28 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-opacity duration-300 scale-110"></div>
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 border-3 border-white cursor-pointer"
                  title={u.name}
                >
                  <img
                    src={getProfilePic(u)}
                    alt={u.name}
                    className="w-full h-full object-cover"
                    onClick={() => setSelectedUser(u)}
                  />
                  <div className="absolute bottom-1 right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-center font-semibold text-blue-800 truncate max-w-full group-hover:text-purple-600 transition-colors duration-200">
                {u.name}
              </p>
            </div>
          ))}
        </div>

        {/* Show More / Show Less Button */}
        {!search.trim() && totalFilteredUsers > 6 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllUsers(!showAllUsers)}
              className="group relative inline-flex items-center px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center">
                {showAllUsers ? (
                  <>
                    <FaChevronUp className="mr-2" />
                    Show Less Users
                  </>
                ) : (
                  <>
                    <FaChevronDown className="mr-2" />
                    Show All {totalFilteredUsers} Users
                  </>
                )}
              </span>
            </button>
          </div>
        )}

        {/* Search Results Counter */}
        {search.trim() && (
          <div className="text-center mt-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg">
              <FaSearch className="text-blue-600 mr-2 text-sm" />
              <span className="text-sm font-medium text-blue-700">
                {displayUsers.length} result
                {displayUsers.length !== 1 ? "s" : ""} found for "{search}"
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Trees Counter */}
      <div className="text-center mt-12 relative z-20">
        <div className="inline-flex flex-col items-center px-6 sm:px-8 py-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl shadow-2xl border border-green-200/50 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center mb-2">
            <FaSeedling className="text-green-600 text-lg sm:text-xl mr-2 animate-pulse" />
            <p className="text-base sm:text-lg font-semibold text-green-800">
              Number of Trees Planted
            </p>
            <FaSeedling className="text-green-600 text-lg sm:text-xl ml-2 animate-pulse" />
          </div>
          <div className="relative">
            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {treesPlanted.toLocaleString()}
            </p>
            <div className="absolute inset-0 bg-green-400 opacity-20 blur-xl rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 💎 FLOATING CHALLENGE BUTTON - FULLY VISIBLE! */}
      {todaysChallenge && (
        <FloatingChallengeButton
          challenge={todaysChallenge}
          onOpen={() => setShowChallengeModal(true)}
          isCompleted={completedChallenges.has(todaysChallenge.id)}
        />
      )}

      {/* 🌟 CHALLENGE MODAL */}
      {todaysChallenge && (
        <ChallengeModal
          challenge={todaysChallenge}
          isOpen={showChallengeModal}
          onClose={() => setShowChallengeModal(false)}
          onComplete={handleChallengeComplete}
          isCompleted={completedChallenges.has(todaysChallenge.id)}
          userAnswer={challengeAnswers[todaysChallenge.id]}
        />
      )}

      {/* Enhanced User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[9997] backdrop-blur-md bg-black/40 flex justify-center items-center animate-fadeIn p-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition duration-300"></div>

            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-sm border border-white/50">
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-4 text-2xl sm:text-3xl font-bold text-gray-400 hover:text-red-500 transition-colors duration-200 hover:scale-110 transform"
              >
                &times;
              </button>

              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-50"></div>
                  <img
                    src={getProfilePic(selectedUser)}
                    alt={selectedUser.name}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 text-center">
                  {selectedUser.name}
                </h2>

                <div className="flex flex-wrap gap-2 justify-center mt-2 mb-6">
                  {selectedUser.skills && selectedUser.skills.length > 0 ? (
                    selectedUser.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs sm:text-sm rounded-full shadow-md border border-blue-200/50 hover:scale-105 transform transition duration-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No skills listed
                    </p>
                  )}
                </div>

                <button
                  onClick={() =>
                    navigate("/profileclicked", { state: { selectedUser } })
                  }
                  className="relative group mt-2 px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                >
                  <FaUserFriends className="inline mr-2" />
                  View Full Profile
                  <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-5px);
          }
          75% {
            transform: translateY(-15px) translateX(3px);
          }
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-modal-enter {
          animation: modal-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-float {
          animation: float ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        
        .animate-confetti {
          animation: confetti ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
