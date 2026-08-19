import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Chatbot from './pages/Chatbot';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';
import Feedback from './pages/Feedback';
import Notices from './pages/Notices';
import Users from './pages/Users';
import Courses from './pages/Courses';
import SystemLogs from './pages/SystemLogs';
import StudentRoster from './pages/StudentRoster';
import FocusTimer from './pages/FocusTimer';
import Materials from './pages/Materials';

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
        },
      }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Unified Layout Wrapper for Authenticated Users */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        
        {/* Role-Specific Private Routes */}
        <Route path="/tasks" element={<PrivateRoute reqRole="Student"><Layout><Tasks /></Layout></PrivateRoute>} />
        <Route path="/timer" element={<PrivateRoute reqRole="Student"><Layout><FocusTimer /></Layout></PrivateRoute>} />
        <Route path="/roster" element={<PrivateRoute reqRole="Faculty"><Layout><StudentRoster /></Layout></PrivateRoute>} />
        <Route path="/materials" element={<PrivateRoute><Layout><Materials /></Layout></PrivateRoute>} />
        <Route path="/schedule" element={<PrivateRoute><Layout><Schedule /></Layout></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Layout><Chatbot /></Layout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><Layout><Notifications /></Layout></PrivateRoute>} />
        <Route path="/notices" element={<PrivateRoute><Layout><Notices /></Layout></PrivateRoute>} />
        <Route path="/feedback" element={<PrivateRoute><Layout><Feedback /></Layout></PrivateRoute>} />
        
        <Route path="/users" element={<PrivateRoute reqRole="Admin"><Layout><Users /></Layout></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute reqRole="Admin"><Layout><Courses /></Layout></PrivateRoute>} />
        <Route path="/system-logs" element={<PrivateRoute reqRole="Admin"><Layout><SystemLogs /></Layout></PrivateRoute>} />
        
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
}
