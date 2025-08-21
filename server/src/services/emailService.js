import nodemailer from 'nodemailer';
import cron from 'node-cron';

// Create transporter (using your working config)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    debug: true,
    logger: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
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

// Send booking confirmation emails
export const sendBookingConfirmationEmails = async (bookingData) => {
  const {
    learnerEmail,
    learnerName,
    teacherEmail,
    teacherName,
    sessionTitle,
    sessionDate,
    sessionTime,
    sessionDateTime
  } = bookingData;

  try {
    console.log('📧 Sending booking confirmation emails...');
    console.log('Data:', bookingData);
    
    const transporter = createTransporter();
    
    // Generate email templates
    const templates = emailTemplates.bookingConfirmation(
      learnerName,
      teacherName, 
      sessionTitle,
      sessionDate,
      sessionTime
    );

    // Send confirmation email to learner
    await transporter.sendMail({
      from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
      to: learnerEmail,
      subject: templates.learner.subject,
      html: templates.learner.html
    });

    console.log('✅ Learner confirmation email sent to:', learnerEmail);

    // Send confirmation email to teacher
    await transporter.sendMail({
      from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
      to: teacherEmail,
      subject: templates.teacher.subject,
      html: templates.teacher.html
    });

    console.log('✅ Teacher confirmation email sent to:', teacherEmail);

    // Schedule reminder emails for 10 minutes before session
    scheduleReminderEmails(bookingData);

    return { success: true, message: 'Emails sent successfully' };

  } catch (error) {
    console.error('❌ Error sending booking confirmation emails:', error);
    throw error;
  }
};

// Schedule reminder emails
const scheduleReminderEmails = (bookingData) => {
  const {
    learnerEmail,
    learnerName,
    teacherEmail,
    teacherName,
    sessionTitle,
    sessionDate,
    sessionTime,
    sessionDateTime
  } = bookingData;

  // Calculate reminder time (10 minutes before session)
  const reminderTime = new Date(sessionDateTime.getTime() - 10 * 60 * 1000);
  
  // Only schedule if reminder time is in the future
  if (reminderTime > new Date()) {
    // Convert to cron format
    const cronTime = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;
    
    console.log(`📅 Scheduling reminder emails for: ${reminderTime.toLocaleString()}`);

    // Schedule reminder email task
    cron.schedule(cronTime, async () => {
      try {
        console.log('⏰ Sending 10-minute reminder emails...');

        const transporter = createTransporter();

        // Generate reminder templates
        const learnerTemplate = emailTemplates.sessionReminder(
          learnerName, sessionTitle, teacherName, sessionDate, sessionTime, false
        );
        
        const teacherTemplate = emailTemplates.sessionReminder(
          teacherName, sessionTitle, learnerName, sessionDate, sessionTime, true
        );

        // Send reminder to learner
        await transporter.sendMail({
          from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
          to: learnerEmail,
          subject: learnerTemplate.subject,
          html: learnerTemplate.html
        });

        // Send reminder to teacher
        await transporter.sendMail({
          from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
          to: teacherEmail,
          subject: teacherTemplate.subject,
          html: teacherTemplate.html
        });

        console.log('✅ Reminder emails sent successfully');
      } catch (error) {
        console.error('❌ Error sending reminder emails:', error);
      }
    });

    console.log('✅ Reminder emails scheduled successfully');
  } else {
    console.log('⚠️ Session is too soon - no reminder scheduled');
  }
};
