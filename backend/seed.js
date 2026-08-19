const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  user: 'postgres',
  password: '2006',
  host: 'localhost',
  port: 5432,
  database: 'campus_companion'
});

async function seed() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL. Generating pristine dummy ecosystem...');

    // Generate Hashes
    const hash1 = await bcrypt.hash('admin123', 10);
    const hash2 = await bcrypt.hash('faculty123', 10);
    const hash3 = await bcrypt.hash('student123', 10);
    const hash4 = await bcrypt.hash('student123', 10);

    // Destructive Cascade to clear existing data cleanly
    await client.query(`
      TRUNCATE TABLE AI_logs, Feedback, Notices, Events, Tasks, Courses, Materials, Users 
      RESTART IDENTITY CASCADE
    `);

    // Insert Users
    await client.query(`
      INSERT INTO Users (name, email, password_hash, role) VALUES 
      ('System Administrator', 'admin@campus.edu', $1, 'Admin'),
      ('Dr. Sarah Connor', 'sarah.faculty@campus.edu', $2, 'Faculty'),
      ('Alex Johnson', 'alex.student@campus.edu', $3, 'Student'),
      ('Mia Wong', 'mia.student@campus.edu', $4, 'Student')
    `, [hash1, hash2, hash3, hash4]);

    // Insert Courses
    await client.query(`
      INSERT INTO Courses (title, department, instructor, credits) VALUES 
      ('Advanced Machine Learning', 'Computer Science', 'Dr. Sarah Connor', 4),
      ('Data Structures 101', 'Computer Science', 'Prof. Alan Turing', 3),
      ('Modern Web Development', 'Software Engineering', 'Dr. Grace Hopper', 3)
    `);

    // Insert Materials
    await client.query(`
      INSERT INTO Materials (title, subject, link, uploaded_by) VALUES
      ('Chapter 4: Neural Networks PDF', 'Advanced Machine Learning', 'https://google.com/search?q=neural+networks', 'Dr. Sarah Connor'),
      ('React JS Cheatsheet', 'Modern Web Development', 'https://react.dev/learn', 'Dr. Grace Hopper')
    `);

    // Insert Global Notices
    await client.query(`
      INSERT INTO Notices (title, content) VALUES
      ('Campus Library Hours Extended', 'The library will now remain open until 2 AM during finals week.'),
      ('System Maintenance', 'Smart Student Productivity Hub will undergo upgrades at midnight. Expect limited connectivity.')
    `);

    // Insert Tasks
    await client.query(`
      INSERT INTO Tasks (user_id, title, description, priority, status) VALUES
      (3, 'Finish React Project', 'Complete the final sprint for the dashboard UI.', 'High', 'Pending'),
      (3, 'Review ML Dataset', 'Clean the CSV data before class.', 'Medium', 'Completed'),
      (3, 'Calculus Assignment', 'Pages 64 through 72.', 'Low', 'Pending'),
      (4, 'Write Essay Draft', '1000 words on AI Ethics', 'High', 'Pending')
    `);

    // Insert Events (Schedule)
    await client.query(`
       INSERT INTO Events (user_id, title, event_time, duration_minutes, type, location) VALUES
       (3, 'Data Structures Lecture', NOW() + interval '1 day', 90, 'class', 'Room 101'),
       (3, 'Deep Work Sprint', NOW() + interval '2 hours', 60, 'study', 'Library Cubicle 4'),
       (3, 'Student Council Meeting', NOW() + interval '2 days', 45, 'meeting', 'Main Hall')
    `);

    // Insert Feedback
    await client.query(`
      INSERT INTO Feedback (user_id, subject, message) VALUES
      (3, 'Feature Request', 'Can we add a dark mode toggle globally? The dashboard hurts my eyes at night!'),
      (4, 'Bug Report', 'The schedule tab was glitching yesterday.')
    `);

    // Insert AI Logs
    await client.query(`
      INSERT INTO AI_logs (user_id, query, response) VALUES
      (3, 'What are my urgent tasks?', 'You have 1 High priority task: Finish React Project.'),
      (4, 'Build me a schedule', 'Here is a balanced routine prioritizing your Essay Draft.'),
      (2, 'Summarize faculty metrics', 'There are currently 2 active students assigned to courses you oversee.')
    `);

    console.log('✅ DB SEED COMPLETE! All dashboards are now highly populated.');
  } catch (error) {
    console.error('❌ SEED ERROR:', error);
  } finally {
    await client.end();
  }
}

seed();
