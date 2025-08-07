import React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import '../styles/VideoCall.css';


const VideoCall = ({ sessionId, userId, userName }) => {
  // Use environment variables for security
  const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID);
  const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET;

  const myMeeting = async (element) => {
    try {
      // Generate Kit Token for the session
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        serverSecret, 
        sessionId,
        userId, 
        userName
      );

      // Create ZegoUIKitPrebuilt instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      
      // Join the room with enhanced configuration
      zp.joinRoom({
        container: element,
        sharedLinks: [
          {
            name: 'Copy Meeting Link',
            url: `${window.location.protocol}//${window.location.host}/join-room/${sessionId}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        showPinButton: true,
        showLayoutButton: true,
        showNonVideoUser: true,
        showOnlyAudioUser: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        maxUsers: 10,
        layout: "Grid", // or "Gallery", "Sidebar"
        
        // Event handlers
        onJoinRoom: () => {
          console.log('✅ Successfully joined the meeting:', sessionId);
        },
        onLeaveRoom: () => {
          console.log('👋 Left the meeting');
          window.history.back();
        },
        onUserJoin: (users) => {
          console.log('👤 New users joined:', users.length);
        },
        onUserLeave: (users) => {
          console.log('👋 Users left, remaining:', users.length);
        },
        onError: (error) => {
          console.error('❌ Meeting error:', error);
        }
      });
    } catch (error) {
      console.error('❌ Failed to initialize video call:', error);
      alert('Failed to start video call. Please check your connection and try again.');
    }
  };

  return (
    <div className="video-call-container">
      <div
        className="video-call-wrapper"
        ref={myMeeting}
        style={{ 
          width: '100vw', 
          height: '100vh',
          backgroundColor: '#1a1a1a'
        }}
      ></div>
    </div>
  );
};

export default VideoCall;
