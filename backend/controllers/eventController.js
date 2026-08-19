const db = require('../config/db');

exports.getAllEvents = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM Events WHERE user_id = $1 ORDER BY event_time ASC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching events' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, event_time, duration_minutes, type, location } = req.body;
    const { rows } = await db.query(
      'INSERT INTO Events (user_id, title, event_time, duration_minutes, type, location) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, title, event_time, duration_minutes || 60, type || 'study', location || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating event' });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, event_time, duration_minutes, type, location } = req.body;
    const { rows } = await db.query(
      'UPDATE Events SET title = $1, event_time = $2, duration_minutes = $3, type = $4, location = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, event_time, duration_minutes, type, location, id, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating event' });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM Events WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting event' });
  }
};
