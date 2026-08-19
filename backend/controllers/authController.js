const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const getEmailTemplate = require('../utils/emailTemplates');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    
    // Check if user exists
    const userCheck = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if(userCheck.rows.length > 0) return res.status(400).json({ error: 'Email already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const validRole = ['Student', 'Faculty', 'Admin'].includes(role) ? role : 'Student';
    const status = validRole === 'Admin' ? 'active' : 'pending';

    const result = await db.query(
      'INSERT INTO Users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, theme, status, created_at, profile_picture',
      [name, email, password_hash, validRole, status]
    );

    // Send email to user
    const msgBody = `
      <p style="text-align: center; font-size: 16px;">Thank you for registering on <strong>Smart Student Productivity Hub</strong>.</p>
      <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: left;">
        <p style="margin: 0; color: #555;">Your account request has been successfully received and is currently <strong>pending admin approval</strong>.</p>
      </div>
      <p style="text-align: center; font-size: 14px; color: #777;">You will receive another email as soon as an administrator reviews and approves your account.</p>
    `;
    const emailHtml = getEmailTemplate('Registration Received', name, msgBody);
    await sendEmail(email, 'Registration Received - Smart Student Productivity Hub', emailHtml);
    await db.query("INSERT INTO Notifications (user_id, type, text) VALUES ($1, 'info', 'Your account registration has been submitted and is pending approval.')", [result.rows[0].id]);

    res.status(201).json({ message: 'User registered successfully. Pending approval.', user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if(result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Account pending admin approval' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if(!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET || 'super_secret_key_here', 
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme, created_at: user.created_at, profile_picture: user.profile_picture } });
    db.query("INSERT INTO Notifications (user_id, type, text) VALUES ($1, 'success', 'You successfully logged into your account.')", [user.id]).catch(console.error);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Missing token' });

    // Fetch user info from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!googleRes.ok) {
        return res.status(400).json({ error: 'Invalid Google token' });
    }
    
    const { email, name } = await googleRes.json();

    let result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    let user;

    if (result.rows.length === 0) {
      // Register the user automatically
      const salt = await bcrypt.genSalt(10);
      const randomPassword = Math.random().toString(36).slice(-10) + "A1!"; // satisfy constraints just in case
      const password_hash = await bcrypt.hash(randomPassword, salt); 
      const newRole = 'Student'; // Default role for Google signups
      
      const insertResult = await db.query(
        'INSERT INTO Users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, theme, created_at, profile_picture',
        [name, email, password_hash, newRole]
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    // Generate JWT
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET || 'super_secret_key_here', 
      { expiresIn: '24h' }
    );

    res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, theme: user.theme, created_at: user.created_at, profile_picture: user.profile_picture } });
    db.query("INSERT INTO Notifications (user_id, type, text) VALUES ($1, 'success', 'Signed in via Google Workspace.')", [user.id]).catch(console.error);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during Google login' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await db.query('UPDATE Users SET reset_otp = $1, reset_otp_expiry = $2 WHERE email = $3', [otp, expiry, email]);

    const msgBody = `
      <p style="text-align: center;">We received a request to reset your password. Here is your One-Time Password (OTP):</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="background-color: #f0f4f8; color: #1e293b; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 8px; border: 1px solid #cbd5e1; display: inline-block;">
          <a href="#" style="color: #1e293b; text-decoration: none; cursor: default;">${otp}</a>
        </span>
      </div>
      <p style="text-align: center; color: #ef4444; font-size: 13px; margin-top: 10px; font-weight: 500;">⚠️ This OTP is valid for exactly 15 minutes.</p>
      <p style="text-align: center; font-size: 13px; color: #888;">If you did not request a password reset, please ignore this email or contact support.</p>
    `;
    const userResult = result.rows[0];
    const emailHtml = getEmailTemplate('Password Reset Request', userResult.name, msgBody);
    
    await sendEmail(email, 'Your Password Reset OTP - Smart Student Productivity Hub', emailHtml);
    await db.query("INSERT INTO Notifications (user_id, type, text) VALUES ($1, 'warning', 'A password reset OTP was requested.')", [userResult.id]);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during forgot password' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    if (user.reset_otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > new Date(user.reset_otp_expiry)) return res.status(400).json({ error: 'OTP expired' });

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during OTP verification' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required' });

    const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    if (user.reset_otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > new Date(user.reset_otp_expiry)) return res.status(400).json({ error: 'OTP expired' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    
    await db.query('UPDATE Users SET password_hash = $1, reset_otp = null, reset_otp_expiry = null WHERE email = $2', [password_hash, email]);
    await db.query("INSERT INTO Notifications (user_id, type, text) VALUES ($1, 'success', 'Your password was successfully reset.')", [user.id]);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};
