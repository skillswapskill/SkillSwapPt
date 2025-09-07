import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import io from 'socket.io-client';

const SuspiciousActivityDetector = ({ 
  videoElement, 
  sessionId, 
  userId, 
  onWarning, 
  onMeetingTerminated 
}) => {
  const canvasRef = useRef();
  const modelRef = useRef();
  const socketRef = useRef();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionActive, setDetectionActive] = useState(true);
  const [warningCount, setWarningCount] = useState(0);

  useEffect(() => {
    initializeSocket();
    loadModel();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const initializeSocket = () => {
    // Fix: Use import.meta.env instead of process.env
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    
    socketRef.current = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });
    
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected successfully');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    socketRef.current.on('suspicious-activity-warning', (data) => {
      setWarningCount(prev => prev + 1);
      if (onWarning) onWarning(data);
    });

    socketRef.current.on('meeting-terminated', (data) => {
      if (onMeetingTerminated) onMeetingTerminated(data);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
  };

  const loadModel = async () => {
    try {
      // Fix: Use import.meta.env and add fallback
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
      const modelUrl = `${serverUrl}/models/suspicious-activity-model.json`;
      
      // For now, skip model loading if not available
      console.log('Model loading skipped - will implement with actual model');
      setIsModelLoaded(true);
      
      // Uncomment when you have an actual model:
      // modelRef.current = await tf.loadLayersModel(modelUrl);
      // setIsModelLoaded(true);
    } catch (error) {
      console.error('Failed to load ML model:', error);
      // Continue without model for now
      setIsModelLoaded(true);
    }
  };

  const preprocessImage = (canvas) => {
    return tf.tidy(() => {
      const imageTensor = tf.browser.fromPixels(canvas);
      const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
      const normalized = resized.div(255.0);
      return normalized.expandDims(0);
    });
  };

  const analyzeFrame = useCallback(async () => {
    if (!videoElement || !detectionActive || !socketRef.current?.connected) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    try {
      // Capture frame from video
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // For demonstration, simulate suspicious activity detection
      // Replace this with actual ML model prediction when available
      const mockSuspiciousScore = Math.random();
      
      if (mockSuspiciousScore > 0.8) { // 20% chance for demo
        const severity = mockSuspiciousScore > 0.9 ? 'high' : 'medium';
        
        // Capture evidence frame
        const evidenceFrame = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to backend
        socketRef.current.emit('suspicious-activity-detected', {
          sessionId,
          userId,
          confidence: mockSuspiciousScore,
          severity,
          timestamp: new Date().toISOString(),
          evidenceFrame,
          warningCount
        });

        console.log('🚨 Suspicious activity detected (demo)');
      }
      
    } catch (error) {
      console.error('Frame analysis error:', error);
    }
  }, [videoElement, sessionId, userId, detectionActive, warningCount]);

  useEffect(() => {
    if (isModelLoaded && detectionActive) {
      // Analyze frame every 10 seconds for demo
      const interval = setInterval(analyzeFrame, 10000);
      return () => clearInterval(interval);
    }
  }, [analyzeFrame, isModelLoaded, detectionActive]);

  // Stop detection when meeting is terminated
  useEffect(() => {
    if (warningCount >= 2) {
      setDetectionActive(false);
    }
  }, [warningCount]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ display: 'none' }}
      width={640} 
      height={480} 
    />
  );
};

export default SuspiciousActivityDetector;
