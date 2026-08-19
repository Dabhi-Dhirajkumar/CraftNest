const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const { rows } = await db.query(
      'INSERT INTO Feedback (user_id, subject, message) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, subject, message]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error submitting feedback' });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT f.*, u.name as author_name, u.role as author_role FROM Feedback f JOIN Users u ON f.user_id = u.id ORDER BY f.id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching feedback' });
  }
};

exports.getMyFeedback = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM Feedback WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching your feedback' });
  }
};

exports.replyFeedback = async (req, res) => {
  try {
    const { reply } = req.body;
    const { rows } = await db.query(
      'UPDATE Feedback SET admin_reply = $1 WHERE id = $2 RETURNING *',
      [reply, req.params.id]
    );
    if(rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error replying to feedback' });
  }
};
