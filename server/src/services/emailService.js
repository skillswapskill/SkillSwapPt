import { createEmailTransporter, emailTemplates } from '../config/email.js';
import cron from 'node-cron';

const transporter = createEmailTransporter();

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

    console.log('✅ Learner confirmation email sent');

    // Send confirmation email to teacher
    await transporter.sendMail({
      from: `"SkillSwap" <${process.env.EMAIL_USER}>`,
      to: teacherEmail,
      subject: templates.teacher.subject,
      html: templates.teacher.html
    });

    console.log('✅ Teacher confirmation email sent');

    // Schedule reminder emails for 10 minutes before session
    scheduleReminderEmails(bookingData);

    return { success: true, message: 'Emails sent successfully' };

  } catch (error) {
    console.error('❌ Error sending booking confirmation emails:', error);
    throw error;
  }
};

// Schedule reminder emails
export const scheduleReminderEmails = (bookingData) => {
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
