import {SuspiciousActivity} from '../models/SuspiciousActivity.model.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SuspiciousActivityController {
  constructor(io) {
    this.io = io;
    this.userWarningCounts = new Map();
  }

  handleSuspiciousActivity = async (socket, data) => {
    const { sessionId, userId, confidence, severity, timestamp, evidenceFrame } = data;
    
    try {
      console.log(`🚨 Processing suspicious activity for user ${userId} in session ${sessionId}`);
      
      // Get current warning count
      const sessionKey = `${sessionId}_${userId}`;
      let currentWarnings = this.userWarningCounts.get(sessionKey) || 0;
      currentWarnings += 1;
      this.userWarningCounts.set(sessionKey, currentWarnings);

      console.log(`⚠️ Warning count for user ${userId}: ${currentWarnings}`);

      // Save evidence frame (simplified for now)
      const evidenceFramePath = await this.saveEvidenceFrame(evidenceFrame, sessionId, userId, timestamp);
      
      // Determine and execute action based on warning count
      let actionTaken;
      
      if (currentWarnings === 1) {
        actionTaken = 'warning_sent';
        await this.sendFirstWarning(sessionId, userId, confidence);
      } else if (currentWarnings === 2) {
        actionTaken = 'final_warning';  
        await this.sendFinalWarning(sessionId, userId, confidence);
      } else {
        actionTaken = 'meeting_terminated';
        await this.terminateMeeting(sessionId, userId, confidence);
        this.userWarningCounts.delete(sessionKey);
      }

      // Log incident to database
      const incident = new SuspiciousActivity({
        sessionId,
        userId,
        confidence,
        severity,
        warningCount: currentWarnings,
        timestamp: new Date(timestamp),
        evidenceFramePath,
        actionTaken
      });
      
      await incident.save();
      console.log(`✅ Suspicious activity logged: ${actionTaken} for user ${userId}`);

    } catch (error) {
      console.error('❌ Error handling suspicious activity:', error);
      socket.emit('error', { 
        message: 'Failed to process suspicious activity detection',
        error: error.message 
      });
    }
  };

  saveEvidenceFrame = async (base64Frame, sessionId, userId, timestamp) => {
    try {
      if (!base64Frame) return `evidence_${sessionId}_${userId}_${Date.now()}.jpg`;
      
      const base64Data = base64Frame.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `evidence_${sessionId}_${userId}_${Date.now()}.jpg`;
      const evidenceDir = path.join(__dirname, '../../uploads/evidence');
      const filePath = path.join(evidenceDir, fileName);
      
      // Ensure directory exists
      await fs.mkdir(evidenceDir, { recursive: true });
      
      // Save the image file
      await fs.writeFile(filePath, buffer);
      
      return fileName;
    } catch (error) {
      console.error('❌ Error saving evidence frame:', error);
      return `evidence_${sessionId}_${userId}_${Date.now()}.jpg`;
    }
  };

  sendFirstWarning = async (sessionId, userId, confidence) => {
    const warningData = {
      warningCount: 1,
      confidence: Math.round(confidence * 100) / 100,
      message: '⚠️ First Warning: Please maintain appropriate behavior during the session',
      severity: 'warning',
      timestamp: new Date().toISOString(),
      userId
    };

    console.log(`📢 Sending first warning to session ${sessionId}:`, warningData);
    
    // Emit to specific session room
    this.io.to(sessionId).emit('suspicious-activity-warning', warningData);
    
    // Also emit to specific user if needed
    this.io.to(sessionId).emit('user-warning', {
      ...warningData,
      targetUserId: userId
    });
    
    console.log(`✅ First warning sent to session ${sessionId}`);
  };

  sendFinalWarning = async (sessionId, userId, confidence) => {
    const warningData = {
      warningCount: 2,
      confidence: Math.round(confidence * 100) / 100,
      message: '🚨 Final Warning: Any further inappropriate behavior will terminate the session immediately',
      severity: 'danger',
      timestamp: new Date().toISOString(),
      userId
    };

    console.log(`📢 Sending final warning to session ${sessionId}:`, warningData);
    
    this.io.to(sessionId).emit('suspicious-activity-warning', warningData);
    this.io.to(sessionId).emit('user-warning', {
      ...warningData,
      targetUserId: userId
    });
    
    console.log(`🚨 Final warning sent to session ${sessionId}`);
  };

  terminateMeeting = async (sessionId, userId, confidence) => {
    const terminationData = {
      reason: 'Session terminated due to repeated inappropriate behavior',
      confidence: Math.round(confidence * 100) / 100,
      terminatedBy: 'system',
      userId,
      timestamp: new Date().toISOString(),
      sessionId
    };

    console.log(`💥 Terminating meeting for session ${sessionId}:`, terminationData);
    
    // Emit termination event
    this.io.to(sessionId).emit('meeting-terminated', terminationData);
    
    // Disconnect all users in this session
    const socketsInRoom = await this.io.in(sessionId).fetchSockets();
    socketsInRoom.forEach(socket => {
      socket.emit('force-disconnect', terminationData);
      socket.disconnect(true);
    });
    
    console.log(`❌ Meeting terminated for session ${sessionId}`);
  };

  clearSessionWarnings = (sessionId) => {
    const keysToDelete = [];
    
    for (const [key] of this.userWarningCounts.entries()) {
      if (key.startsWith(sessionId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.userWarningCounts.delete(key));
    console.log(`🧹 Cleared ${keysToDelete.length} warning entries for session ${sessionId}`);
  };
}

export default SuspiciousActivityController;
