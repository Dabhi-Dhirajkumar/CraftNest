const db = require('../config/db');

exports.getCourses = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM Courses ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { title, department, instructor, credits } = req.body;
    const result = await db.query(
      'INSERT INTO Courses (title, department, instructor, credits) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, department, instructor, credits || 3]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, instructor, credits } = req.body;
    const result = await db.query(
      'UPDATE Courses SET title=$1, department=$2, instructor=$3, credits=$4 WHERE id=$5 RETURNING *',
      [title, department, instructor, credits, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM Courses WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
};
