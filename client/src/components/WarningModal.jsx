import React, { useEffect } from 'react';

const WarningModal = ({ 
  isOpen, 
  warningCount, 
  confidence, 
  message,
  severity,
  onClose, 
  onAcknowledge 
}) => {
  useEffect(() => {
    if (isOpen) {
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getWarningConfig = () => {
    switch (warningCount) {
      case 1:
        return {
          title: "⚠️ First Warning",
          bgColor: "bg-yellow-50 border-yellow-400",
          textColor: "text-yellow-800",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700"
        };
      case 2:
        return {
          title: "🚨 Final Warning",
          bgColor: "bg-red-50 border-red-500",
          textColor: "text-red-800",
          buttonColor: "bg-red-600 hover:bg-red-700"
        };
      default:
        return {
          title: "❌ Session Terminated",
          bgColor: "bg-gray-50 border-gray-400",
          textColor: "text-gray-800",
          buttonColor: "bg-gray-600 hover:bg-gray-700"
        };
    }
  };

  const config = getWarningConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className={`${config.bgColor} border-2 rounded-lg p-8 max-w-md mx-4 shadow-2xl animate-bounce-in`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${config.textColor}`}>
            {config.title}
          </h2>
          
          <div className="mb-6">
            <p className={`${config.textColor} mb-4 text-lg leading-relaxed`}>
              {message || 'Potentially inappropriate behavior has been detected.'}
            </p>
            
            {confidence > 0 && (
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
                Detection Confidence: {(confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>

          {warningCount < 3 ? (
            <div className="space-y-3">
              <button
                onClick={onAcknowledge}
                className={`w-full px-6 py-3 rounded-lg text-white font-semibold ${config.buttonColor} transform hover:scale-105 transition-all duration-200 shadow-lg`}
              >
                I Understand - Continue Session
              </button>
              
              {warningCount === 2 && (
                <p className="text-sm text-red-600 font-medium">
                  ⚠️ Next violation will terminate the session!
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
