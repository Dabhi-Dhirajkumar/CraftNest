const db = require('../config/db');

exports.getAllNotices = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT Notices.*, Users.name as author FROM Notices LEFT JOIN Users ON Notices.user_id = Users.id ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching notices' });
  }
};

exports.createNotice = async (req, res) => {
  try {
    const { title, content } = req.body;
    const { rows } = await db.query(
      'INSERT INTO Notices (user_id, title, content) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, title, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating notice' });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const { rows } = await db.query(
      'UPDATE Notices SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating notice' });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Notices WHERE id = $1', [id]);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting notice' });
  }
};
