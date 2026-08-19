const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM Notifications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await db.query('UPDATE Notifications SET read = TRUE WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating notifications' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await db.query('DELETE FROM Notifications WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting notification' });
  }
};
