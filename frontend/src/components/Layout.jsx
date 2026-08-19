import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, MessageSquare, Calendar, Settings, Bell, Menu, X, User, BarChart2, BellRing, Megaphone, HelpCircle, LogOut, Users, Book, Terminal, Activity, CheckCircle, Database, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LiveTimer = ({ createdAt }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    if (!createdAt) return;
    
    const updateTimer = () => {
      const start = new Date(createdAt);
      const now = new Date();
      const diff = Math.floor((now - start) / 1000);
      
      const days = Math.floor(diff / (24 * 3600));
      const hours = Math.floor((diff % (24 * 3600)) / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const secs = diff % 60;
      
      let str = '';
      if (days > 0) str += `${days}d `;
      str += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      setElapsed(str);
    };

    updateTimer(); // initial call
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  if (!createdAt) return null;

  return (
    <div className="text-[10px] text-accent font-mono mt-0.5 flex items-center bg-white/5 w-max px-1.5 py-0.5 rounded-full border border-white/10 shadow-[0_0_5px_rgba(107,33,168,0.3)]">
      <Clock size={10} className="mr-1 text-primary" /> 
      <span>{elapsed}</span>
    </div>
  );
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role based navigation filtering
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['Student', 'Faculty', 'Admin'] },
    { icon: Database, label: 'Materials', path: '/materials', roles: ['Student', 'Faculty', 'Admin'] },
    { icon: Terminal, label: 'System Logs', path: '/system-logs', roles: ['Admin'] },
    { icon: Users, label: 'User Management', path: '/users', roles: ['Admin'] },
    { icon: Book, label: 'Courses Admin', path: '/courses', roles: ['Admin'] },
    { icon: CheckSquare, label: 'Task Manager', path: '/tasks', roles: ['Student'] },
    { icon: Activity, label: 'Focus Timer', path: '/timer', roles: ['Student'] },
    { icon: CheckCircle, label: 'Student Roster', path: '/roster', roles: ['Faculty'] },
    { icon: Calendar, label: 'Schedule', path: '/schedule', roles: ['Student', 'Faculty'] },
    { icon: Megaphone, label: 'Notices', path: '/notices', roles: ['Student', 'Faculty', 'Admin'] },
    { icon: MessageSquare, label: 'Virtual Assistant', path: '/chat', roles: ['Student', 'Faculty'] },
    { icon: BarChart2, label: 'Analytics', path: '/analytics', roles: ['Student', 'Admin'] },
    { icon: HelpCircle, label: 'Feedback', path: '/feedback', roles: ['Student', 'Admin'] },
    { icon: BellRing, label: 'Notifications', path: '/notifications', roles: ['Student', 'Faculty', 'Admin'] },
    { icon: Settings, label: 'Settings', path: '/settings', roles: ['Student', 'Faculty', 'Admin'] },
  ];

  const allowedNavs = navItems.filter(nav => nav.roles.includes(user?.role));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: sidebarOpen ? 260 : 80 }}
        className="hidden md:flex flex-col relative z-20 glass-card m-4 mr-0 rounded-2xl overflow-hidden border-r-0"
      >
        <div className="p-4 flex items-center justify-between">
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-poppins font-bold text-[13px] leading-tight neon-text tracking-widest break-words pr-2">
                Smart Student Productivity Hub
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto px-3 space-y-2 custom-scrollbar">
          {allowedNavs.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/80 to-accent/80 text-white shadow-neon'
                    : 'text-textMuted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon size={22} className={sidebarOpen ? "mr-3 shrink-0" : "mx-auto"} />
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors cursor-pointer justify-center md:justify-start">
             <LogOut size={20} className={sidebarOpen ? "mr-3" : ""} />
             {sidebarOpen && <span className="font-semibold text-sm">Logout</span>}
          </button>
          
          <Link to="/profile">
            <div className="flex items-center p-3 glass-card bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
               <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center shrink-0 border border-primary/50 text-white shadow-[0_0_10px_rgba(107,33,168,0.5)]">
                  <User size={18} />
               </div>
               {sidebarOpen && (
                 <div className="ml-3 truncate">
                   <p className="text-sm font-semibold text-white">{user?.name || 'Loading...'}</p>
                   <p className="text-xs text-textMuted truncate leading-tight">{user?.role || 'Guest'}</p>
                   {user?.created_at && <LiveTimer createdAt={user.created_at} />}
                 </div>
               )}
            </div>
          </Link>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-20 flex items-center justify-between px-8 z-30">
           <div className="flex items-center space-x-4">
              <h2 className="text-xl md:text-2xl font-poppins font-bold text-white tracking-wide mix-blend-screen capitalize">{user?.role} Panel</h2>
           </div>
           
           <div className="flex items-center space-x-6">
              <Link to="/notifications" className="relative p-2 rounded-full glass-card hover:bg-white/10 transition-colors group cursor-pointer block">
                 <Bell size={20} className="text-textMuted group-hover:text-white transition-colors" />
                 <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse"></span>
              </Link>
              <Link to="/profile" className="hidden sm:flex items-center px-4 py-2 glass-card rounded-full space-x-2 border hover:border-white/30 transition-colors cursor-pointer text-textMuted hover:text-white">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                 <span className="text-xs font-medium ">System Online</span>
              </Link>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 pt-0 custom-scrollbar">
           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="h-full">
             {children}
           </motion.div>
        </div>
      </main>

      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
    </div>
  );
}
