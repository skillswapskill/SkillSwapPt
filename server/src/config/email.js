import nodemailer from 'nodemailer';

// Email transporter configuration
export const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
export const emailTemplates = {
  bookingConfirmation: (learnerName, teacherName, sessionTitle, sessionDate, sessionTime) => ({
    learner: {
      subject: `✅ Session Booked: ${sessionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">🎉 Session Booking Confirmed!</h2>
          <p>Hi <strong>${learnerName}</strong>,</p>
          <p>Your session has been successfully booked!</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1F2937;">📚 Session Details:</h3>
            <p><strong>Session:</strong> ${sessionTitle}</p>
            <p><strong>Teacher:</strong> ${teacherName}</p>
            <p><strong>Date:</strong> ${sessionDate}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
          </div>
          
          <p>🔔 <em>You'll receive a reminder 10 minutes before the session starts.</em></p>
          <p>Best regards,<br><strong>SkillSwap Team</strong></p>
        </div>
      `
    },
    teacher: {
      subject: `📋 New Booking: ${sessionTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">👨‍🏫 New Student Enrolled!</h2>
          <p>Hi <strong>${teacherName}</strong>,</p>
          <p>A student has booked your session!</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1F2937;">📚 Session Details:</h3>
            <p><strong>Session:</strong> ${sessionTitle}</p>
            <p><strong>Student:</strong> ${learnerName}</p>
            <p><strong>Date:</strong> ${sessionDate}</p>
            <p><strong>Time:</strong> ${sessionTime}</p>
          </div>
          
          <p>🔔 <em>You'll receive a reminder 10 minutes before the session starts.</em></p>
          <p>Best regards,<br><strong>SkillSwap Team</strong></p>
        </div>
      `
    }
  }),

  sessionReminder: (userName, sessionTitle, otherPersonName, sessionDate, sessionTime, isTeacher = false) => ({
    subject: `⏰ Session Starting Soon: ${sessionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #DC2626;">⏰ Session Starting in 10 Minutes!</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>This is a friendly reminder that your session is starting soon!</p>
        
        <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #DC2626;">
          <h3 style="margin: 0 0 10px 0; color: #1F2937;">📚 Session Details:</h3>
          <p><strong>Session:</strong> ${sessionTitle}</p>
          <p><strong>${isTeacher ? 'Student' : 'Teacher'}:</strong> ${otherPersonName}</p>
          <p><strong>Date:</strong> ${sessionDate}</p>
          <p><strong>Time:</strong> ${sessionTime}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://skillswap.company/join-session" 
             style="background: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🚀 Join Session Now
          </a>
        </div>
        
        <p>Best regards,<br><strong>SkillSwap Team</strong></p>
      </div>
    `
  })
};
