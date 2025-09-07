import React, { useState, useRef, useEffect } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import io from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SuspiciousActivityDetector from './SuspiciousActivityDetector';
import WarningModal from './WarningModal';
import '../styles/VideoCall.css';

const VideoCall = ({ sessionId, userId, userName, sessionData }) => {
  // State management
  const [showWarning, setShowWarning] = useState(false);
  const [warningData, setWarningData] = useState(null);
  const [meetingActive, setMeetingActive] = useState(true);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [warningCount, setWarningCount] = useState(0);
  const [debugMode, setDebugMode] = useState(true);

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
    startAdvancedNudityDetection();
    
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

  // ADVANCED CUSTOM NUDITY DETECTION ALGORITHM
  const startAdvancedNudityDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }

    // Analyze every 2 seconds for responsive detection
    detectionIntervalRef.current = setInterval(() => {
      if (detectionEnabled && meetingActive && videoRef.current) {
        analyzeVideoForNudity();
      }
    }, 2000);
    
    console.log('🔍 Advanced custom nudity detection started');
  };

  const analyzeVideoForNudity = async () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;

      // Ensure video is ready
      if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
        if (debugMode) console.log('📹 Video not ready for analysis');
        return;
      }

      // Set canvas size and capture frame
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Run advanced nudity detection
      const detectionResult = await advancedNudityDetection(imageData, canvas.width, canvas.height);
      
      if (debugMode) {
        console.log('🔍 Nudity Analysis Result:', {
          isNudity: detectionResult.isNudity,
          confidence: detectionResult.confidence.toFixed(3),
          skinRatio: detectionResult.skinRatio.toFixed(3),
          suspiciousRatio: detectionResult.suspiciousRatio.toFixed(3),
          bodyRegionScore: detectionResult.bodyRegionScore.toFixed(3)
        });
      }

      await processDetectionResult(detectionResult);

    } catch (error) {
      console.error('❌ Video analysis error:', error);
    }
  };

  // ADVANCED NUDITY DETECTION ALGORITHM
  const advancedNudityDetection = async (imageData, width, height) => {
    const pixels = imageData.data;
    let skinPixels = 0;
    let clothedSkinPixels = 0;
    let exposedSkinPixels = 0;
    let totalPixels = 0;
    let bodyRegionPixels = 0;
    let faceRegionPixels = 0;

    // Sample every 3rd pixel for performance (can adjust for accuracy)
    const step = 3;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        totalPixels++;

        if (isAdvancedSkinColor(r, g, b)) {
          skinPixels++;
          
          const region = getBodyRegion(x, y, width, height);
          
          switch (region) {
            case 'face':
              faceRegionPixels++;
              clothedSkinPixels++;
              break;
            case 'hands':
              clothedSkinPixels++;
              break;
            case 'torso':
            case 'private':
              exposedSkinPixels++;
              bodyRegionPixels++;
              break;
            default:
              break;
          }
        }
      }
    }

    // Calculate ratios
    const skinRatio = skinPixels / totalPixels;
    const exposedRatio = exposedSkinPixels / Math.max(skinPixels, 1);
    const clothedRatio = clothedSkinPixels / Math.max(skinPixels, 1);
    const bodyRegionRatio = bodyRegionPixels / totalPixels;

    // Advanced scoring algorithm
    let nudityScore = 0;
    
    // High exposed skin in body regions
    if (exposedRatio > 0.3 && bodyRegionRatio > 0.05) {
      nudityScore += 0.4;
    }
    
    // Very high overall skin exposure
    if (skinRatio > 0.4) {
      nudityScore += 0.3;
    }
    
    // Low clothed skin ratio (indicates lack of clothing)
    if (clothedRatio < 0.4 && skinPixels > totalPixels * 0.1) {
      nudityScore += 0.3;
    }
    
    // Extreme body region exposure
    if (bodyRegionRatio > 0.15) {
      nudityScore += 0.5;
    }

    // Face detection modifier (reduces false positives)
    if (faceRegionPixels > 0) {
      nudityScore = Math.max(0, nudityScore - 0.1);
    }

    const confidence = Math.min(nudityScore, 1.0);
    const isNudity = confidence > 0.6; // Threshold for nudity detection

    return {
      isNudity,
      confidence,
      skinRatio,
      suspiciousRatio: exposedRatio,
      bodyRegionScore: bodyRegionRatio,
      details: {
        totalSkinPixels: skinPixels,
        exposedSkinPixels,
        clothedSkinPixels,
        faceRegionPixels,
        bodyRegionPixels
      }
    };
  };

  // ADVANCED SKIN COLOR DETECTION using multiple color spaces
  const isAdvancedSkinColor = (r, g, b) => {
    // Method 1: RGB-based detection
    if (r > 95 && g > 40 && b > 20 && 
        Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
        Math.abs(r - g) > 15 && r > g && r > b) {
      return true;
    }

    // Method 2: YCbCr color space detection (more accurate)
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
    
    if (y >= 80 && cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
      return true;
    }

    // Method 3: HSV-based detection for different lighting
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    if (max > 0) {
      const saturation = diff / max;
      const value = max / 255;
      
      if (value > 0.4 && saturation > 0.15 && saturation < 0.8) {
        let hue = 0;
        if (max === r) hue = ((g - b) / diff) % 6;
        else if (max === g) hue = (b - r) / diff + 2;
        else hue = (r - g) / diff + 4;
        hue = (hue * 60 + 360) % 360;
        
        // Skin tone hue ranges
        if ((hue >= 0 && hue <= 50) || (hue >= 340 && hue <= 360)) {
          return true;
        }
      }
    }

    return false;
  };

  // BODY REGION CLASSIFICATION
  const getBodyRegion = (x, y, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const relativeX = x / width;
    const relativeY = y / height;

    // Face region (top 25% of frame, center)
    if (relativeY < 0.25 && relativeX > 0.3 && relativeX < 0.7) {
      return 'face';
    }

    // Hands region (sides of frame)
    if ((relativeX < 0.15 || relativeX > 0.85) && relativeY > 0.3 && relativeY < 0.8) {
      return 'hands';
    }

    // Torso region (center, middle section)
    if (relativeY > 0.3 && relativeY < 0.7 && relativeX > 0.25 && relativeX < 0.75) {
      return 'torso';
    }

    // Private region (lower center)
    if (relativeY > 0.65 && relativeX > 0.35 && relativeX < 0.65) {
      return 'private';
    }

    return 'other';
  };

  // PROCESS DETECTION RESULTS with temporal filtering
  const processDetectionResult = async (result) => {
    const now = Date.now();
    
    // Add to detection history for temporal filtering
    detectionHistory.current.push({
      timestamp: now,
      isNudity: result.isNudity,
      confidence: result.confidence
    });

    // Keep only last 10 detections
    if (detectionHistory.current.length > 10) {
      detectionHistory.current.shift();
    }

    // Temporal filtering: require consistent detection
    const recentDetections = detectionHistory.current.filter(d => now - d.timestamp < 10000);
    const positiveDetections = recentDetections.filter(d => d.isNudity);
    const avgConfidence = positiveDetections.length > 0 ? 
      positiveDetections.reduce((sum, d) => sum + d.confidence, 0) / positiveDetections.length : 0;

    // Require at least 2 positive detections in last 10 seconds
    const shouldWarn = positiveDetections.length >= 2 && avgConfidence > 0.6;

    // Prevent spam (minimum 8 seconds between warnings)
    if (shouldWarn && now - lastDetectionTime.current > 8000) {
      lastDetectionTime.current = now;
      
      let severity = 'medium';
      let warningMessage = '👕 Dress Code Violation';
      let reason = `Inappropriate exposure detected with ${(avgConfidence * 100).toFixed(1)}% confidence over ${positiveDetections.length} recent frames.`;

      if (avgConfidence > 0.8) {
        severity = 'high';
        warningMessage = '🔞 Nudity Detected';
        reason = `Explicit nudity detected with ${(avgConfidence * 100).toFixed(1)}% confidence. This violates educational session policies.`;
      }

      console.log(`🚨 NUDITY DETECTION TRIGGERED: ${reason}`);
      
      // Create detailed toast notification
      const toastMessage = (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#dc2626' }}>
            {warningMessage}
          </div>
          <div style={{ fontSize: '12px', marginBottom: '3px' }}>
            {reason}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            🤖 Custom AI Detection | Skin: {(result.skinRatio * 100).toFixed(1)}% | Exposed: {(result.suspiciousRatio * 100).toFixed(1)}%
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
          detectionResults: result,
          detectionMethod: 'Custom_Advanced_Algorithm',
          temporalData: {
            recentDetections: recentDetections.length,
            positiveDetections: positiveDetections.length,
            avgConfidence
          }
        });
      }
    } else if (!result.isNudity && debugMode) {
      console.log(`✅ Content appropriate (confidence: ${result.confidence.toFixed(3)})`);
    }
  };

  const handleWarningReceived = (data) => {
    console.log('🚨 Processing nudity warning:', data);
    
    setWarningData(data);
    setWarningCount(data.warningCount || 0);

    const toastContent = (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🚨 NUDITY WARNING #{data.warningCount}: {data.scenario || 'Content Violation'}
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '5px' }}>
          {data.message || 'Inappropriate content detected via advanced AI analysis'}
        </div>
        {data.confidence && (
          <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '3px' }}>
            🤖 Detection Confidence: {(data.confidence * 100).toFixed(1)}%
          </div>
        )}
        <div style={{ fontSize: '10px', opacity: 0.7 }}>
          Method: Custom Advanced Algorithm | Temporal Analysis: {data.temporalData?.positiveDetections || 0} detections
        </div>
      </div>
    );

    toast.error(toastContent, {
      position: "top-center",
      autoClose: 15000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      toastId: `nudity-warning-${data.warningCount}`,
    });

    // Urgent audio notification
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create triple beep alert
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          
          oscillator.frequency.setValueAtTime(1400, audioCtx.currentTime);
          gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
          
          oscillator.start();
          oscillator.stop(audioCtx.currentTime + 0.4);
        }, i * 500);
      }
    } catch (e) {
      console.log('Audio notification failed:', e);
    }

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(`🚨 URGENT: Nudity Detected #${data.warningCount}`, {
        body: `Advanced AI detected inappropriate content with ${((data.confidence || 0) * 100).toFixed(1)}% confidence`,
        icon: '/favicon.ico',
        tag: `skillswap-nudity-${data.warningCount}`,
        requireInteraction: true
      });
    }
  };

  const handleMeetingTerminated = (data) => {
    console.log('❌ Meeting terminated due to nudity violations:', data);
    setMeetingActive(false);
    setDetectionEnabled(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    toast.error(
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          🚨 SESSION TERMINATED - NUDITY VIOLATIONS
        </div>
        <div style={{ fontSize: '13px' }}>
          {data.reason || 'Multiple nudity violations detected by advanced AI analysis. The educational session has been terminated immediately for safety.'}
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
      console.log(`🔍 Found ${videoElements.length} video elements`);
      
      if (videoElements.length > 0) {
        const localVideo = Array.from(videoElements).find(video => {
          const hasStream = video.srcObject && video.srcObject.active;
          const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
          return hasStream || isPlaying;
        }) || videoElements[0];
        
        if (localVideo && videoRef.current !== localVideo) {
          videoRef.current = localVideo;
          console.log('✅ Video element connected for advanced nudity detection:', {
            width: localVideo.videoWidth,
            height: localVideo.videoHeight,
            readyState: localVideo.readyState
          });
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
        maxUsers: 10, // Support multiple students
        layout: "Auto",
        
        onJoinRoom: () => {
          console.log('✅ Joined session with advanced custom nudity detection:', sessionId);
          
          if (socketRef.current?.connected) {
            socketRef.current.emit('video-call-started', { sessionId, userId });
          }
          
          extractVideoElement();
          setDetectionEnabled(true);
          
          toast.success('🎓 Session started with advanced AI nudity detection!', {
            position: "top-right",
            autoClose: 3000,
          });
        },
        
        onLeaveRoom: () => {
          console.log('👋 Left the tutoring session');
          
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
      console.error('❌ Failed to start tutoring session:', error);
      
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
        limit={5}
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

      {/* Advanced AI Monitoring Status */}
      {detectionEnabled && meetingActive && connectionStatus === 'connected' && (
        <div className="ai-monitoring-advanced">
          <div className="monitoring-indicator-advanced">
            <span className="status-dot-advanced"></span>
            <span className="status-text-advanced">🔬 AI is Monitoring the sessions</span>
            {warningCount > 0 && (
              <span className="warning-badge-advanced">
                {warningCount} VIOLATION{warningCount > 1 ? 'S' : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Debug Info */}
      
      {/* Hidden canvas for analysis */}
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
