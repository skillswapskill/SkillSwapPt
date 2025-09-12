import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound404 = () => {
  const navigate = useNavigate();
  const [floatingElements, setFloatingElements] = useState([]);

  useEffect(() => {
    // Generate floating skill icons/elements
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
    }));
    setFloatingElements(elements);
  }, []);

  const skillIcons = ['💻', '🎨', '📊', '🎵', '📚', '🏃‍♂️', '🍳', '📱', '✍️', '🎯', '🔧', '🎪', '📐', '🌟', '💡'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <br></br>
      <br></br>
      <br></br>
      {/* Floating Background Elements */}
      {floatingElements.map((element, index) => (
        <div
          key={element.id}
          className="absolute text-4xl opacity-10 pointer-events-none"
          style={{
            left: `${element.left}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`,
          }}
        >
          <div className="animate-bounce">
            {skillIcons[index % skillIcons.length]}
          </div>
        </div>
      ))}

      
      {/* Main 404 Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <br></br>
        <div className="text-center max-w-2xl mx-auto">
          {/* Animated 404 Number */}
          <div className="relative mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
              404
            </h1>
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold text-blue-200 -z-10 blur-sm animate-ping">
              404
            </div>
          </div>

          {/* Animated Content */}
          <div className="space-y-6 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            
            <p className="text-lg text-gray-600 mb-2">
              Looks like this skill hasn't been shared yet!
            </p>
            
            <p className="text-gray-500 max-w-md mx-auto">
              The page you're looking for doesn't exist, but don't worry - there are plenty of other skills to explore and trade on SkillSwap.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={() => navigate('/community')}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transform hover:scale-105 transition-all duration-200"
              >
                Explore Community
              </button>
            </div>

            {/* Fun Skill Trading Message */}
            <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2 animate-bounce" style={{animationDelay: '0s'}}>
                  <span className="text-2xl">💻</span>
                  <span>Code</span>
                </div>
                <span className="text-2xl animate-pulse">⇄</span>
                <div className="flex items-center space-x-2 animate-bounce" style={{animationDelay: '0.5s'}}>
                  <span className="text-2xl">🎨</span>
                  <span>Design</span>
                </div>
                <span className="text-2xl animate-pulse">⇄</span>
                <div className="flex items-center space-x-2 animate-bounce" style={{animationDelay: '1s'}}>
                  <span className="text-2xl">📊</span>
                  <span>Analytics</span>
                </div>
              </div>
              <p className="text-center mt-3 text-gray-700 font-medium">
                "Trade Skills Not Bills"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        .floating-element {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound404;
