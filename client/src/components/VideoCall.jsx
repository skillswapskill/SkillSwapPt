import React, { useState, useRef, useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import io from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/VideoCall.css';

const VideoCall = ({ sessionId, userId, userName, sessionData }) => {
  // State management
  const [showWarning, setShowWarning] = useState(false);
  const [warningData, setWarningData] = useState(null);
  const [meetingActive, setMeetingActive] = useState(true);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [warningCount, setWarningCount] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Refs
  const videoRef = useRef();
  const socketRef = useRef();
  const zpInstanceRef = useRef();
  const canvasRef = useRef();
  const detectionIntervalRef = useRef();
  const lastDetectionTime = useRef(0);
  const detectionHistory = useRef([]);

  // Environment variables
  const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID || '12345');
  const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET || 'default-secret';
  const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  useEffect(() => {
    initializeSocket();
    startCustomNudityDetection();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-session', { sessionId, userId });
        socketRef.current.disconnect();
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [sessionId, userId]);

  const initializeSocket = () => {
    console.log(`🔗 Connecting to server: ${serverUrl}`);
    
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setConnectionStatus('connected');
      socketRef.current.emit('join-session', { sessionId, userId });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setConnectionStatus('error');
    });

    socketRef.current.on('suspicious-activity-warning', (data) => {
      console.log('⚠️ WARNING RECEIVED:', data);
      handleWarningReceived(data);
    });

    socketRef.current.on('user-warning', (data) => {
      console.log('👤 USER WARNING RECEIVED:', data);
      if (data.targetUserId === userId) {
        handleWarningReceived(data);
      }
    });

    socketRef.current.on('meeting-terminated', (data) => {
      console.log('💥 MEETING TERMINATION RECEIVED:', data);
      handleMeetingTerminated(data);
    });

    socketRef.current.on('force-disconnect', (data) => {
      console.log('🔌 FORCE DISCONNECT RECEIVED:', data);
      handleMeetingTerminated(data);
    });

    socketRef.current.on('error', handleSocketError);
  };

  // PRODUCTION-READY CUSTOM NUDITY DETECTION
  const startCustomNudityDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = setInterval(() => {
      if (detectionEnabled && meetingActive && videoRef.current) {
        performCustomNudityAnalysis();
      }
    }, 3000);
    
    console.log('🔍 Production-ready nudity detection started');
  };

  const performCustomNudityAnalysis = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;

      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const analysisResult = analyzeForInappropriateContent(imageData, canvas.width, canvas.height);

      // console.log('🔍 Content Analysis:', {
      //   inappropriate: analysisResult.isInappropriate,
      //   confidence: analysisResult.confidence.toFixed(2),
      //   skinRatio: analysisResult.skinRatio.toFixed(2),
      //   exposureLevel: analysisResult.exposureLevel
      // });

      if (analysisResult.isInappropriate) {
        await triggerContentWarning(analysisResult);
      }

    } catch (error) {
      console.error('❌ Content analysis error:', error);
    }
  };

  // CUSTOM INAPPROPRIATE CONTENT DETECTION ALGORITHM
  const analyzeForInappropriateContent = (imageData, width, height) => {
    const pixels = imageData.data;
    let skinPixels = 0;
    let totalPixels = 0;
    let suspiciousRegionPixels = 0;
    let clothedRegionPixels = 0;

    // Sample every 4th pixel for performance
    for (let i = 0; i < pixels.length; i += 16) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      
      totalPixels++;

      if (isLikelySkinColor(r, g, b)) {
        skinPixels++;
        
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        
        const region = classifyBodyRegion(x, y, width, height);
        
        if (region === 'suspicious') {
          suspiciousRegionPixels++;
        } else if (region === 'clothed') {
          clothedRegionPixels++;
        }
      }
    }

    const skinRatio = skinPixels / totalPixels;
    const suspiciousRatio = suspiciousRegionPixels / Math.max(skinPixels, 1);
    const clothedRatio = clothedRegionPixels / Math.max(skinPixels, 1);

    // Calculate inappropriate content score
    let inappropriateScore = 0;

    // High skin exposure in private areas
    if (suspiciousRatio > 0.15 && skinRatio > 0.25) {
      inappropriateScore += 0.6;
    }

    // Very high overall skin exposure
    if (skinRatio > 0.5) {
      inappropriateScore += 0.4;
    }

    // Low clothed skin ratio
    if (clothedRatio < 0.3 && skinPixels > totalPixels * 0.2) {
      inappropriateScore += 0.3;
    }

    const confidence = Math.min(inappropriateScore, 1.0);
    const exposureLevel = skinRatio > 0.6 ? 'high' : skinRatio > 0.4 ? 'medium' : 'low';

    return {
      isInappropriate: confidence > 0.7, // Conservative threshold
      confidence,
      skinRatio,
      suspiciousRatio,
      clothedRatio,
      exposureLevel,
      details: {
        totalPixels,
        skinPixels,
        suspiciousRegionPixels,
        clothedRegionPixels
      }
    };
  };

  // ADVANCED SKIN COLOR DETECTION
  const isLikelySkinColor = (r, g, b) => {
    // YCbCr color space for better skin detection
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    // Skin color thresholds in YCbCr space
    if (y >= 80 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
      return true;
    }

    // Additional RGB-based detection for different lighting
    if (r > 95 && g > 40 && b > 20 && 
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        Math.abs(r - g) > 15 && r > g && r > b) {
      return true;
    }

    return false;
  };

  // BODY REGION CLASSIFICATION
  const classifyBodyRegion = (x, y, width, height) => {
    const relX = x / width;
    const relY = y / height;

    // Face/neck region (typically clothed/acceptable)
    if (relY < 0.3 && relX > 0.25 && relX < 0.75) {
      return 'clothed';
    }

    // Hands/arms (typically exposed/acceptable)
    if ((relX < 0.2 || relX > 0.8) && relY > 0.3 && relY < 0.8) {
      return 'clothed';
    }

    // Private/torso regions (should be covered)
    if (relY > 0.4 && relY < 0.9 && relX > 0.3 && relX < 0.7) {
      return 'suspicious';
    }

    return 'neutral';
  };

  // TRIGGER CONTENT WARNING with temporal filtering
  const triggerContentWarning = async (analysisResult) => {
    const now = Date.now();

    // Add to history
    detectionHistory.current.push({
      timestamp: now,
      confidence: analysisResult.confidence,
      isInappropriate: analysisResult.isInappropriate
    });

    // Keep last 5 detections
    if (detectionHistory.current.length > 5) {
      detectionHistory.current.shift();
    }

    // Require consistent detection over time
    const recentDetections = detectionHistory.current.filter(d => now - d.timestamp < 15000);
    const positiveDetections = recentDetections.filter(d => d.isInappropriate);
    const avgConfidence = positiveDetections.length > 0 ? 
      positiveDetections.reduce((sum, d) => sum + d.confidence, 0) / positiveDetections.length : 0;

    // Require multiple positive detections and prevent spam
    if (positiveDetections.length >= 2 && 
        avgConfidence > 0.7 && 
        now - lastDetectionTime.current > 10000) {
      
      lastDetectionTime.current = now;

      const severity = avgConfidence > 0.85 ? 'high' : 'medium';
      const warningMessage = severity === 'high' ? 
        '🔞 Explicit Content Detected' : 
        '👕 Inappropriate Content Warning';
      
      const reason = `Inappropriate content detected with ${(avgConfidence * 100).toFixed(1)}% confidence over ${positiveDetections.length} recent frames. Please ensure appropriate attire during the educational session.`;

      console.log(`🚨 CONTENT WARNING: ${reason}`);

      // Toast notification
      const toastMessage = (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: severity === 'high' ? '#dc2626' : '#f59e0b' }}>
            {warningMessage}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            {reason}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            🤖 Custom Algorithm | Skin: {(analysisResult.skinRatio * 100).toFixed(1)}% | Exposure: {analysisResult.exposureLevel}
          </div>
        </div>
      );

      if (severity === 'high') {
        toast.error(toastMessage, {
          position: "top-center",
          autoClose: 12000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.warn(toastMessage, {
          position: "top-center",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      // Send to backend
      if (socketRef.current?.connected) {
        socketRef.current.emit('suspicious-activity-detected', {
          sessionId,
          userId,
          confidence: avgConfidence,
          severity,
          timestamp: new Date().toISOString(),
          evidenceFrame: canvasRef.current.toDataURL('image/jpeg', 0.7),
          warningCount: warningCount + 1,
          scenario: warningMessage,
          message: reason,
          analysisResult,
          detectionMethod: 'Custom_Production_Algorithm'
        });
      }
    }
  };

  const handleWarningReceived = (data) => {
    console.log('🚨 Processing content warning:', data);
    setWarningData(data);
    setWarningCount(data.warningCount || 0);

    const toastContent = (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🚨 WARNING #{data.warningCount}: {data.scenario || 'Content Violation'}
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '5px' }}>
          {data.message || 'Inappropriate content detected'}
        </div>
        {data.confidence && (
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            Detection Confidence: {(data.confidence * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );

    toast.error(toastContent, {
      position: "top-center",
      autoClose: 15000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      toastId: `content-warning-${data.warningCount}`,
    });

    // Audio notification
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio notification failed:', e);
    }
  };

  const handleMeetingTerminated = (data) => {
    console.log('❌ Meeting terminated:', data);
    setMeetingActive(false);
    setDetectionEnabled(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    toast.error(
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🚨 SESSION TERMINATED
        </div>
        <div style={{ fontSize: '13px' }}>
          {data.reason || 'Session terminated due to policy violations.'}
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
      }
    );
    
    if (zpInstanceRef.current) {
      try {
        zpInstanceRef.current.destroy();
      } catch (error) {
        console.error('Error destroying Zego instance:', error);
      }
    }
    
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 5000);
  };

  const handleSocketError = (error) => {
    console.error('🚫 Socket error:', error);
  };

  const extractVideoElement = () => {
    setTimeout(() => {
      const videoElements = document.querySelectorAll('video');
      if (videoElements.length > 0) {
        const localVideo = Array.from(videoElements).find(video => {
          const hasStream = video.srcObject && video.srcObject.active;
          const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
          return hasStream || isPlaying;
        }) || videoElements[0];
        
        if (localVideo && videoRef.current !== localVideo) {
          videoRef.current = localVideo;
          console.log('✅ Video element connected for content analysis');
        }
      }
    }, 2000);
  };

  const myMeeting = async (element) => {
    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        serverSecret, 
        sessionId,
        userId, 
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpInstanceRef.current = zp;
      
      zp.joinRoom({
        container: element,
        sharedLinks: [{
          name: 'Share Meeting Link',
          url: `${window.location.protocol}//${window.location.host}/join-room/${sessionId}`,
        }],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        maxUsers: 10,
        layout: "Auto",
        
        onJoinRoom: () => {
          console.log('✅ Joined session with production content monitoring:', sessionId);
          
          if (socketRef.current?.connected) {
            socketRef.current.emit('video-call-started', { sessionId, userId });
          }
          
          extractVideoElement();
          setDetectionEnabled(true);
          
          toast.success('🎓 Session started with content monitoring', {
            position: "top-right",
            autoClose: 3000,
          });
        },
        
        onLeaveRoom: () => {
          console.log('👋 Left the session');
          
          if (socketRef.current?.connected) {
            socketRef.current.emit('session-ended', { sessionId, userId });
            socketRef.current.emit('video-call-ended', { sessionId, userId });
          }
          
          setDetectionEnabled(false);
          setMeetingActive(false);
          
          if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
          }
          
          window.history.back();
        },
        
        onUserJoin: (users) => {
          console.log('👤 Participant joined:', users.length);
          setTimeout(extractVideoElement, 2000);
          
          toast.info('👤 Someone joined the session', {
            position: "top-right",
            autoClose: 2000,
          });
        },
        
        onError: (error) => {
          console.error('❌ Session error:', error);
          setDetectionEnabled(false);
          
          toast.error('❌ Session error occurred', {
            position: "top-center",
            autoClose: 5000,
          });
        }
      });

    } catch (error) {
      console.error('❌ Failed to start session:', error);
      
      toast.error('Unable to start session. Please refresh and try again.', {
        position: "top-center",
        autoClose: 5000,
      });
      
      setDetectionEnabled(false);
    }
  };

  return (
    <div className="video-call-container">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />

      {connectionStatus !== 'connected' && (
        <div className="connection-status-center">
          <div className={`status-indicator ${connectionStatus}`}>
            {connectionStatus === 'connecting' && '🔄 Connecting to session...'}
            {connectionStatus === 'error' && '❌ Connection issue - Retrying...'}
          </div>
        </div>
      )}

      <div
        className="video-call-wrapper"
        ref={myMeeting}
        style={{ 
          width: '100vw', 
          height: '100vh',
          backgroundColor: '#1a1a1a'
        }}
      />

      {detectionEnabled && meetingActive && connectionStatus === 'connected' && (
        <div className="ai-monitoring-production">
          <div className="monitoring-indicator-production">
            <span className="status-dot-production"></span>
            <span className="status-text-production">🛡️ Content Monitoring</span>
            {warningCount > 0 && (
              <span className="warning-badge-production">
                {warningCount}
              </span>
            )}
          </div>
        </div>
      )}

      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }}
        width={640} 
        height={480} 
      />
    </div>
  );
};

export default VideoCall;
