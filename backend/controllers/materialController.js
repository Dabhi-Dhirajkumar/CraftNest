const db = require('../config/db');

exports.getMaterials = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Materials ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch study materials' });
  }
};

exports.addMaterial = async (req, res) => {
  if (req.user.role === 'Student') return res.status(403).json({ error: 'Only Faculty and Admins can upload resources.' });
  try {
    const { title, subject, link } = req.body;
    
    let uploaderName = req.user.name;
    if (!uploaderName) {
      const u = await db.query('SELECT name FROM Users WHERE id=$1', [req.user.id]);
      uploaderName = u.rows[0]?.name || 'Unknown Faculty';
    }

    const result = await db.query(
      'INSERT INTO Materials (title, subject, link, uploaded_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, subject, link, uploaderName]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload material' });
  }
};

exports.deleteMaterial = async (req, res) => {
  if (req.user.role === 'Student') return res.status(403).json({ error: 'Only Admins and Faculty can delete resources.' });
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM Materials WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Material not found' });
    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
};
