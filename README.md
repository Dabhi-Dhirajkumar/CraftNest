# Smart Student Productivity Hub

A full-stack AI-powered student productivity web application. It helps students manage tasks, schedules, and priorities, while an AI assistant offers scheduling suggestions, predicts task delays, and automatically prioritizes assignments.

## Features Built
- **Glassmorphism UI**: Beautiful, modern dashboard with dark mode layout, glowing neon accents, and smooth Framer Motion animations.
- **AI Chat Assistant**: Integrated an AI chatbot interface where users can interact via Natural Language.
- **Smart Task Management**: Advanced task board that uses logic to estimate priority levels based on deadlines.
- **Optimized Scheduling**: Timeline view for an AI-generated daily study schedule avoiding conflicts.

## Tech Stack
- **Frontend**: React, Vite, TailwindCSS (for the responsive dashboard interface), Framer Motion (for smooth layout transitions), Lucide-React (icons).
- **Backend**: Node.js, Express, PostgreSQL.
- **Database Architecture**: Users, Tasks, Events, Notices, and AI_logs tables configured inside a `schema.sql`.

## Folder Structure
```
campus-companion/
├── backend/
│   ├── config/ (db.js)
│   ├── controllers/ (taskController.js, aiController.js)
│   ├── models/ (schema.sql)
│   ├── routes/ (api endpoint mapping)
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/ (Layout Sidebar/Navbar)
│   │   ├── pages/ (Dashboard, Tasks, Chatbot, Schedule)
│   │   ├── main.jsx
│   │   └── index.css (Tailwind & Themes)
│   └── tailwind.config.js
└── README.md
```

## Setup Instructions

### 1. Database Setup
1. Install PostgreSQL and make sure it is running.
2. Create a database called `campus_companion`:
   ```bash
   createdb campus_companion
   ```
3. Run the schema script to initialize the tables:
   ```bash
   psql -d campus_companion -f backend/schema.sql
   ```

### 2. Backend Setup
```bash
cd backend
npm install
npm run server
```
*Make sure to configure the `.env` file first with your PostgreSQL credentials and OpenAI key.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to interact with the platform.
