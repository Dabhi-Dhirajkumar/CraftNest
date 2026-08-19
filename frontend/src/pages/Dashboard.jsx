import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, BookOpen, Clock, AlertTriangle, ShieldCheck, Users, Megaphone, Terminal, FileText, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useAuth();
  
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Faculty') return <FacultyDashboard />;
  return <StudentDashboard />;
}

// Student Dashboard
function StudentDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ pending: 0, completed: 0, studyHours: 24, alerts: 0 });
  const [latestNotices, setLatestNotices] = useState([]);

  useEffect(() => {
    const config = { headers: {} };
    const localToken = localStorage.getItem('token') || token;
    if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

    axios.get('http://localhost:5000/api/tasks', config).then(res => {
      const p = res.data.filter(t => t.status === 'Pending').length;
      const c = res.data.filter(t => t.status === 'Completed').length;
      setStats(prev => ({...prev, pending: p, completed: c}));
    }).catch(console.error);

    axios.get('http://localhost:5000/api/notices', config).then(res => {
      setLatestNotices(res.data.slice(0, 2));
      setStats(prev => ({...prev, alerts: res.data.length}));
    }).catch(console.error);
  }, [token]);

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Activity className="text-secondary" />} title="Tasks Completed" value={stats.completed} desc="This week" path="/tasks" />
        <StatCard icon={<Clock className="text-primary" />} title="Pending Tasks" value={stats.pending} desc="Needs attention" path="/tasks" />
        <StatCard icon={<BookOpen className="text-accent" />} title="Study Sprints" value={stats.studyHours + 'h'} desc="Logged" path="/timer" />
        <StatCard icon={<Megaphone className="text-red-400" />} title="Campus Alerts" value={stats.alerts} desc="Unread notices" path="/notices" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2 glass-card p-6 h-96 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-primary/20 blur-[50px] rounded-full group-hover:bg-primary/40 transition-all duration-700"></div>
          <div>
            <h3 className="text-lg font-semibold text-textMain mb-2 font-poppins relative z-10">Productivity Analytics</h3>
            <p className="text-sm text-textMuted mb-6 relative z-10">System Predicted completion rates mapped out visually.</p>
          </div>
          <div className="flex-1 flex items-end space-x-2 md:space-x-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const height = [40, 70, 50, 90, 60, 30, 80][idx];
              return (
                <div key={day} className="flex-1 flex flex-col items-center justify-end space-y-2 group/bar">
                  <div className="w-full relative rounded-t-lg bg-black/5 dark:bg-white/5 overflow-hidden flex justify-end flex-col h-48 border border-black/5 dark:border-white/5 transition-colors">
                     <motion.div initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className="w-full bg-gradient-to-t from-primary/50 to-accent shadow-neon rounded-t-md relative z-10"></motion.div>
                  </div>
                  <span className="text-xs text-textMuted">{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6 border-t-4 border-t-accent flex flex-col">
          <h3 className="text-lg font-semibold text-textMain mb-4 font-poppins flex items-center">
            <span className="bg-accent/10 p-2 rounded-full mr-3 border border-accent/20"><AlertTriangle size={16} className="text-accent shadow-neon" /></span>
            Priority Insights
          </h3>
          <div className="space-y-4 flex-1">
             <InsightCard title="Optimal Study Time" desc="You are 35% more productive between 8PM and 11PM." type="success" />
             {latestNotices.map((notice, idx) => (
                <InsightCard key={idx} title={notice.title} desc={notice.content.substring(0, 50) + '...'} type="info" />
             ))}
             {latestNotices.length === 0 && <InsightCard title="No New Notices" desc="All caught up!" type="info" />}
          </div>
        </div>
      </div>
    </div>
  );
}

// Faculty Dashboard
function FacultyDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ activeStudents: 0, notices: 0 });
  const [materials, setMaterials] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const config = { headers: {} };
    const localToken = localStorage.getItem('token') || token;
    if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

    axios.get('http://localhost:5000/api/users/students', config).then(res => setStats(prev => ({...prev, activeStudents: res.data.length}))).catch(()=>{});
    axios.get('http://localhost:5000/api/notices', config).then(res => {
      setStats(prev => ({...prev, notices: res.data.length}));
      setNotices(res.data.slice(0, 3));
    }).catch(console.error);
    axios.get('http://localhost:5000/api/materials', config).then(res => setMaterials(res.data.slice(0, 3))).catch(()=>{});
  }, [token]);

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-secondary" />} title="Enrolled Students" value={stats.activeStudents} desc="Tracking progress via roster" path="/roster" />
        <StatCard icon={<Megaphone className="text-primary" />} title="Active Notices" value={stats.notices} desc="Published globally" path="/notices" />
        <StatCard icon={<Database className="text-accent" />} title="Study Materials" value={materials.length} desc="Uploaded files" path="/materials" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
         <div className="glass-card p-6 border-t-4 border-t-secondary relative overflow-hidden">
            <h3 className="text-lg font-bold text-textMain mb-4 flex items-center"><Database size={18} className="mr-2 text-secondary"/> Recent Shared Materials</h3>
            <div className="space-y-3 z-10 relative">
               {materials.map(mat => (
                  <div key={mat.id} className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl flex justify-between items-center">
                     <div>
                        <h4 className="font-semibold text-sm text-textMain">{mat.title}</h4>
                        <p className="text-xs text-textMuted">{mat.subject}</p>
                     </div>
                     <Link to="/materials" className="text-xs text-primary font-medium hover:underline">View</Link>
                  </div>
               ))}
               {materials.length === 0 && <p className="text-sm text-textMuted italic">No study materials uploaded yet.</p>}
            </div>
         </div>

         <div className="glass-card p-6 border-t-4 border-t-primary relative overflow-hidden">
            <h3 className="text-lg font-bold text-textMain mb-4 flex items-center"><Megaphone size={18} className="mr-2 text-primary"/> Latest Broadcasts</h3>
            <div className="space-y-3 z-10 relative">
               {notices.map(notice => (
                  <div key={notice.id} className="p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl">
                     <h4 className="font-semibold text-sm text-textMain">{notice.title}</h4>
                     <p className="text-xs text-textMuted truncate">{notice.content}</p>
                  </div>
               ))}
               {notices.length === 0 && <p className="text-sm text-textMuted italic">No notices currently active.</p>}
            </div>
         </div>
      </div>
    </div>
  );
}

// Admin Dashboard
function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ users: 0, feedbacks: 0, notices: 0 });
  const [logs, setLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

      const u = await axios.get('http://localhost:5000/api/users', config).catch(()=>({data:[]}));
      const f = await axios.get('http://localhost:5000/api/feedback', config).catch(()=>({data:[]}));
      const n = await axios.get('http://localhost:5000/api/notices', config).catch(()=>({data:[]}));
      const l = await axios.get('http://localhost:5000/api/ai/logs', config).catch(()=>({data:[]}));
      
      setStats({ users: u.data.length, feedbacks: f.data.length, notices: n.data.length });
      setFeedbacks(f.data.slice(0, 3));
      setLogs(l.data.slice(0, 3));
      
      const pending = u.data.filter(user => user.status === 'pending');
      setPendingRequests(pending.slice(0, 4));
    };
    fetchData();
  }, [token]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;
      
      await axios.put(`http://localhost:5000/api/users/${id}/status`, { status }, config);
      setPendingRequests(prev => prev.filter(u => u.id !== id));
      if (status === 'active') {
        setStats(prev => ({ ...prev, users: prev.users + 1 }));
      }
    } catch (err) { toast.error(err.response?.data?.error || "Failed to update status"); }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-primary" />} title="Registered Scope" value={stats.users} desc="Total connected users" path="/users" />
        <StatCard icon={<AlertTriangle className="text-secondary" />} title="Pending Feedback" value={stats.feedbacks} desc="User-submitted tickets" path="/feedback" />
        <StatCard icon={<Megaphone className="text-accent" />} title="Global Connectivity" value={stats.notices} desc="Active server broadcasts" path="/notices" />
      </div>

      {pendingRequests.length > 0 && (
      <div className="glass-card p-6 border-t-4 border-t-primary">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-textMain flex items-center"><ShieldCheck size={18} className="mr-2 text-primary"/> Pending Registrations</h3>
            <Link to="/users" className="text-primary text-sm hover:underline">Manage All</Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(u => (
              <div key={u.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                 <div>
                    <h4 className="font-semibold text-white text-sm">{u.name}</h4>
                    <p className="text-xs text-textMuted uppercase">{u.role}</p>
                 </div>
                 <div className="flex items-center space-x-2 bg-black/20 p-1.5 rounded-full border border-white/5 shadow-inner">
                    <button onClick={() => handleUpdateStatus(u.id, 'rejected')} className="px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-300 bg-transparent text-textMuted hover:bg-red-500/80 hover:text-white">Reject</button>
                    <button onClick={() => handleUpdateStatus(u.id, 'active')} className="px-3 py-1.5 rounded-full text-xs font-semibold select-none transition-all duration-300 bg-transparent text-textMuted hover:bg-green-500/80 hover:text-white">Approve</button>
                 </div>
              </div>
            ))}
         </div>
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="glass-card p-6 border-t-4 border-t-secondary flex flex-col">
            <h3 className="text-lg font-bold text-textMain mb-4 flex items-center"><FileText size={18} className="mr-2 text-secondary"/> Recent User Feedback</h3>
            <div className="space-y-3 flex-1">
               {feedbacks.map(f => (
                 <div key={f.id} className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl">
                    <p className="text-xs font-semibold text-secondary break-words uppercase tracking-wider">{f.subject}</p>
                    <p className="text-sm text-textMain mt-1">{f.message}</p>
                 </div>
               ))}
               {feedbacks.length === 0 && <p className="text-textMuted italic">No feedback issues reported.</p>}
            </div>
            <Link to="/feedback" className="mt-4 text-sm text-primary font-medium hover:underline text-center">View Full Database</Link>
         </div>

         <div className="glass-card p-6 border-t-4 border-t-red-400 flex flex-col">
            <h3 className="text-lg font-bold text-textMain mb-4 flex items-center"><Terminal size={18} className="mr-2 text-red-400"/> Live System Traces</h3>
            <div className="space-y-3 flex-1 font-mono">
               {logs.map(log => (
                 <div key={log.id} className="p-3 bg-black/10 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl text-xs space-y-1">
                    <div className="text-accent">{'>'} {log.query}</div>
                    <div className="text-textMuted pl-2">ACK: {log.response.substring(0, 45)}...</div>
                 </div>
               ))}
               {logs.length === 0 && <p className="text-textMuted italic font-sans">No neural gateway traces detected.</p>}
            </div>
            <Link to="/system-logs" className="mt-4 text-sm text-red-400 font-medium hover:underline text-center">Access Full Terminal</Link>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, desc, path }) {
  const content = (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass-card p-6 relative overflow-hidden group cursor-pointer border-transparent hover:border-black/10 dark:hover:border-white/10 h-full">
      <div className="absolute -right-4 -bottom-4 opacity-10 blur-xl group-hover:opacity-30 transform scale-150 transition-all">{icon}</div>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-textMuted text-sm font-medium">{title}</p>
          <h4 className="text-3xl font-bold text-textMain mt-2 font-poppins">{value}</h4>
        </div>
        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 group-hover:border-black/20 dark:group-hover:border-white/30 transition-colors">{icon}</div>
      </div>
      <p className="text-xs text-textMuted mt-4 flex items-center shadow-sm">
        <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span> {desc}
      </p>
    </motion.div>
  );

  return path ? <Link to={path} className="block h-full">{content}</Link> : content;
}

function InsightCard({ title, desc, type }) {
  const colors = {
    warning: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-200',
    success: 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-200',
    info: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-200',
  };
  return (
    <div className={`p-4 rounded-xl border ${colors[type]} transition-all hover:bg-opacity-20 cursor-pointer`}>
      <h5 className="font-semibold text-sm mb-1">{title}</h5>
      <p className="text-xs opacity-80 leading-relaxed">{desc}</p>
    </div>
  );
}
