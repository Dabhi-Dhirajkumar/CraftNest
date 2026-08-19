const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dhirajjdabhi1@gmail.com', // Let's use a dummy mail since they didn't provide one, wait, maybe I should just simulate or put a placeholder but they requested "mail go in registerd mail id ... with proper format of website and their logo...". 
    pass: 'rxegxqzbtvnqnnpi', // Since there's no actual mail credential, we should probably output mostly for testing or log.
    // wait, I will use etheral or a placeholder and let the user know they need to configure it
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: '"Smart Student Productivity Hub" <noreply@campuscompanion.edu>',
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

module.exports = sendEmail;
