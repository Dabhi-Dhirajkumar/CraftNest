const db = require('../config/db');

exports.getAllTasks = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM Tasks WHERE user_id = $1 ORDER BY deadline ASC', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching tasks' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const { rows } = await db.query(
      'INSERT INTO Tasks (user_id, title, description, deadline, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, title, description, deadline || null, priority || 'Low']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error creating task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, priority, status } = req.body;
    const { rows } = await db.query(
      'UPDATE Tasks SET title = $1, description = $2, deadline = $3, priority = $4, status = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [title, description, deadline, priority, status, id, req.user.id]
    );
    if(rows.length === 0) return res.status(404).json({error: 'Task not found'});
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error updating task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('DELETE FROM Tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
    if(rows.length === 0) return res.status(404).json({error: 'Task not found'});
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting task' });
  }
};
