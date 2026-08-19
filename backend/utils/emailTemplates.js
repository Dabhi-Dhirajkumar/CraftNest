const getEmailTemplate = (title, name, messageBody) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; color: #333333; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e1e8ed; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
      .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 2px solid #f0f0f0; }
      .header h1 { color: #5a2e98; margin: 0; font-size: 26px; }
      .header p { color: #888888; margin: 5px 0 0 0; font-size: 14px; }
      .content { padding: 40px 30px; }
      .content h2 { color: #333333; font-size: 20px; margin-top: 0; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
      .content p { line-height: 1.6; color: #555555; font-size: 15px; }
      .footer { background-color: #fcfcfc; padding: 20px; text-align: center; border-top: 1px solid #eeeeee; }
      .footer p { margin: 0; color: #999999; font-size: 12px; }
      a { color: inherit; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Smart Student Productivity Hub</h1>
        <p>Smart Student Productivity</p>
      </div>
      <div class="content">
        <h2>${title}</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <div style="margin: 25px 0;">
          ${messageBody}
        </div>
        <p>Best Regards,<br/><strong>Smart Student Productivity Hub Team</strong></p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Smart Student Productivity Hub. All rights reserved.</p>
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};

module.exports = getEmailTemplate;
