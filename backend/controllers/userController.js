const db = require('../config/db');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const getEmailTemplate = require('../utils/emailTemplates');

exports.getProfile = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, name, email, role, theme, created_at, profile_picture FROM Users WHERE id = $1', [req.user.id]);
    if(rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, theme, password, profile_picture } = req.body;
    
    if (password) {
       const salt = await bcrypt.genSalt(10);
       const hashed = await bcrypt.hash(password, salt);
       await db.query('UPDATE Users SET name = $1, theme = $2, password_hash = $3, profile_picture = $4 WHERE id = $5', [name, theme, hashed, profile_picture, req.user.id]);
    } else {
       await db.query('UPDATE Users SET name = $1, theme = $2, profile_picture = $3 WHERE id = $4', [name, theme, profile_picture, req.user.id]);
    }
    
    // fetch updated
    const { rows } = await db.query('SELECT id, name, email, role, theme, created_at, profile_picture FROM Users WHERE id = $1', [req.user.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user' });
  }
};

// Admin only operations
exports.getAllUsers = async (req, res) => {
  try {
     const { rows } = await db.query('SELECT id, name, email, role, theme, status, created_at FROM Users ORDER BY id DESC');
     res.json(rows);
  } catch (error) {
     res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
     await db.query('DELETE FROM Users WHERE id = $1', [req.params.id]);
     res.json({ message: 'User deleted' });
  } catch (error) {
     res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
     const { id } = req.params;
     const { status } = req.body;
     
     if (!['active', 'inactive', 'rejected'].includes(status)) {
       return res.status(400).json({ error: 'Invalid status' });
     }

     const userResult = await db.query('SELECT name, email, status FROM Users WHERE id = $1', [id]);
     if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
     const user = userResult.rows[0];

     if (status === 'rejected') {
       await db.query('DELETE FROM Users WHERE id = $1', [id]);
       const msgBody = `
         <p style="text-align: center; font-size: 16px;">We have reviewed your registration request.</p>
         <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 20px 0;">
           <p style="margin: 0; color: #7f1d1d;">Unfortunately, your request to join Smart Student Productivity Hub has been <strong>rejected</strong> by the administration.</p>
         </div>
         <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">If you feel this was a mistake, please reach out to the campus administration office directly for clarification.</p>
       `;
       const emailHtml = getEmailTemplate('Registration Update', user.name, msgBody);
       await sendEmail(user.email, 'Update on Your Smart Student Productivity Hub Account', emailHtml);
       return res.json({ message: 'User rejected and deleted' });
     } else {
       await db.query('UPDATE Users SET status = $1 WHERE id = $2', [status, id]);
       if (user.status === 'pending' && status === 'active') {
         const msgBody = `
           <div style="text-align: center; margin-bottom: 20px;">
             <span style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px; border: 1px solid #bbf7d0;">APPROVED</span>
           </div>
           <p style="text-align: center; font-size: 18px; color: #333;">Congratulations!</p>
           <p style="text-align: center; color: #555; line-height: 1.6;">Your Smart Student Productivity Hub account has been fully approved by the administration team.</p>
           <p style="text-align: center; color: #555; line-height: 1.6;">You can now safely log in to the portal and access all your personalized modules.</p>
           <div style="text-align: center; margin-top: 30px;">
             <a href="http://localhost:5173/login" style="background-color: #5a2e98; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; display: inline-block;">Login to Dashboard</a>
           </div>
         `;
         const emailHtml = getEmailTemplate('Account Approved!', user.name, msgBody);
         await sendEmail(user.email, 'Your Account is Approved - Smart Student Productivity Hub', emailHtml);
       }
       res.json({ message: 'User status updated successfully' });
     }
  } catch (error) {
     res.status(500).json({ error: 'Failed to update user status' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, created_at, status FROM Users WHERE role='Student' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student roster' });
  }
};
