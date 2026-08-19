import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Analytics() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: {} };
        const localToken = localStorage.getItem('token') || token;
        if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

        // Admin might want all tasks or just their own, for simplicity fetch tasks and logs
        const taskRes = await axios.get('http://localhost:5000/api/tasks', config).catch(() => ({ data: [] }));
        setTasks(taskRes.data);

        // Fetch AI logs (Admin can see all, student sees their own if implemented)
        const logRes = await axios.get('http://localhost:5000/api/ai/logs', config).catch(() => ({ data: [] }));
        setLogs(logRes.data.slice(0, 5));
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to load analytics data", err);
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const total = tasks.length;
  const assignments = tasks.filter(t => t.category === 'Assignment').length;
  const exams = tasks.filter(t => t.category === 'Exam').length;
  const reading = tasks.filter(t => t.category === 'Reading').length;

  if (loading) return <div className="p-6 text-white animate-pulse">Loading live analytics...</div>;
  return (
    <div className="space-y-6 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold font-poppins text-white flex items-center">
             Analytics & Reports <BarChart2 className="ml-3 text-accent" />
           </h2>
           <p className="text-textMuted text-sm mt-1">System detailed insights on your productivity trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Weekly Productivity (Simulated/Mapped from Tasks) */}
        <div className="col-span-1 lg:col-span-2 glass-card p-6 h-80 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-secondary/10 blur-[60px] rounded-full group-hover:bg-secondary/30 transition-all duration-700"></div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 relative z-10 flex items-center"><TrendingUp size={18} className="mr-2 text-secondary" /> Volume Trend</h3>
            <p className="text-xs text-textMuted relative z-10">Historical task volume mapped vs completion rate.</p>
          </div>
          <div className="flex-1 flex items-end space-x-3 mt-4 relative z-10">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, idx) => {
              // Dynamic visuals based on actual task mass
              const baseline = total > 0 ? 20 : 5;
              const h1 = Math.min((baseline + (pending * (idx+1) * 2)), 80);
              const h2 = Math.min((baseline + (completed * (idx+1) * 3)), 90);
              return (
                <div key={week} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full flex justify-center items-end space-x-1 h-48">
                     <motion.div initial={{ height: 0 }} animate={{ height: `${h1}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className="w-1/3 bg-primary rounded-t-sm opacity-80" title="Pending Volume"></motion.div>
                     <motion.div initial={{ height: 0 }} animate={{ height: `${h2}%` }} transition={{ duration: 1, delay: idx * 0.1 + 0.2 }} className="w-1/3 bg-accent rounded-t-sm shadow-[0_0_10px_rgba(232,121,249,0.5)]" title="Completed Volume"></motion.div>
                  </div>
                  <span className="text-xs text-textMuted mt-3">{week}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Distribution */}
        <div className="col-span-1 glass-card p-6 h-80 flex flex-col relative overflow-hidden group">
           <h3 className="text-lg font-semibold text-white mb-6 relative z-10 flex items-center"><PieChartIcon size={18} className="mr-2 text-primary" /> Task Distro</h3>
           <div className="flex-1 relative flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border-[16px] border-textMuted/10 relative">
                 <div className="absolute inset-0 rounded-full border-[16px] border-primary" style={{clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 50%)'}}></div>
                 <div className="absolute inset-0 rounded-full border-[16px] border-accent shadow-neon" style={{clipPath: `polygon(50% 50%, 0 50%, 0 0, ${total > 0 ? (completed/total)*100 : 100}% 0)`}}></div>
              </div>
              <div className="absolute flex flex-col items-center justify-center">
                 <span className="text-3xl font-bold font-poppins text-white">{total || 0}</span>
                 <span className="text-xs text-textMuted">Total</span>
              </div>
           </div>
           <div className="flex justify-center space-x-4 mt-6">
              <div className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-accent mr-2"></span> Completed ({completed})</div>
              <div className="flex items-center text-xs"><span className="w-3 h-3 rounded-full bg-primary mr-2"></span> Pending ({pending})</div>
           </div>
        </div>

      </div>

       <div className="glass-card p-6">
         <h3 className="text-lg font-semibold text-white mb-6 flex items-center"><Activity size={18} className="mr-2 text-green-400" /> Recent System Activity Logs</h3>
         <div className="space-y-4">
            {logs.map(log => (
              <div key={log.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group transition-colors hover:bg-white/10">
                 <div>
                    <p className="text-sm font-semibold text-white font-mono break-all line-clamp-1 group-hover:line-clamp-none">{log.query}</p>
                    <p className="text-xs text-textMuted mt-1 line-clamp-1">{log.response}</p>
                 </div>
                 <span className="text-xs text-textMuted ml-4 shrink-0 px-2 py-1 bg-black/20 rounded-md border border-white/5">{new Date(log.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                 <p className="text-textMuted">No recent system activity recorded.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
