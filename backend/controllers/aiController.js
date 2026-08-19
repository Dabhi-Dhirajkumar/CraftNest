const { OpenAI } = require('openai');
const db = require('../config/db');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key'
});

exports.getChatResponse = async (req, res) => {
  try {
    const { query } = req.body;
    let fallbackResponse = "I can help you prioritize tasks or build a schedule!";
    
    if (query.toLowerCase().includes('schedule')) {
       fallbackResponse = "Here is a suggested schedule: 1. Finish assignments in the morning. 2. Code in the afternoon.";
    } else if (query.toLowerCase().includes('urgent')) {
       fallbackResponse = "Focus on tasks with 'High' priority first!";
    }
    
    await db.query('INSERT INTO AI_logs (user_id, query, response) VALUES ($1, $2, $3)', [req.user.id, query, fallbackResponse]);

    res.json({ response: fallbackResponse });

  } catch (error) {
    res.status(500).json({ error: 'System processing failed' });
  }
};

exports.generateSchedule = async (req, res) => {
  try {
    res.json({
      schedule: [
        { time: '09:00 AM', task: 'Review study materials' },
        { time: '11:00 AM', task: 'Start new assignment' },
        { time: '02:00 PM', task: 'Take a short break' },
        { time: '03:00 PM', task: 'Group discussion meeting' },
        { time: '05:00 PM', task: 'Finish pending emails' }
      ]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate schedule' });
  }
};

exports.predictPriority = async (req, res) => {
  try {
    const { title, deadline, workload } = req.body;
    let predicted = 'Low';
    
    if (deadline) {
      const daysLeft = (new Date(deadline) - new Date()) / (1000 * 3600 * 24);
      if (daysLeft < 2) predicted = 'High';
      else if (daysLeft < 5) predicted = 'Medium';
    }
    
    res.json({ priority: predicted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to predict priority' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT ai_logs.id, ai_logs.query, ai_logs.response, ai_logs.created_at, users.name, users.email 
      FROM AI_logs 
      JOIN Users ON ai_logs.user_id = users.id 
      ORDER BY ai_logs.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
};
