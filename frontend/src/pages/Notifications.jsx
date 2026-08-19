import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function Notifications() {
  const [notifications, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      setNotifs(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const getIconAndStyle = (type) => {
    switch (type) {
      case 'warning': return { icon: <AlertTriangle size={20} className="text-red-400" />, style: 'border-l-4 border-red-400 bg-white/5' };
      case 'info': return { icon: <Info size={20} className="text-secondary" />, style: 'border-l-4 border-secondary bg-white/5' };
      case 'success': return { icon: <CheckCircle size={20} className="text-green-400" />, style: 'border-l-4 border-green-400 bg-white/5' };
      default: return { icon: <Bell size={20} />, style: 'border-l-4 border-gray-400 bg-white/5' };
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('http://localhost:5000/api/notifications/read');
      setNotifs(n => n.map(x => ({ ...x, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`);
      setNotifs(n => n.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Helper function to format timestamp
  const formatTime = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (diff < 60) return `${diff} secs ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-poppins">
      <div className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
           <h2 className="text-3xl font-bold text-white flex items-center">
             Notifications <Bell className="ml-3 text-primary animate-pulse" />
           </h2>
           <p className="text-textMuted text-sm mt-1">Smart alerts managed by your Virtual Companion.</p>
        </div>
        <button onClick={markAllRead} className="text-sm font-medium text-textMuted hover:text-white transition-colors">Mark all reading</button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
             <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="glass-card p-10 text-center text-textMuted">Loading notifications...</motion.div>
          ) : notifications.length === 0 ? (
             <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="glass-card p-10 text-center text-textMuted">You have no new notifications.</motion.div>
          ) : (
            notifications.map((notif) => {
              const { icon, style } = getIconAndStyle(notif.type);
              return (
                <motion.div 
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`glass-card p-4 sm:p-6 flex items-start sm:items-center justify-between transition-all hover:bg-white/10 ${style} ${notif.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start sm:items-center space-x-4">
                     <div className="p-2 bg-black/20 rounded-xl relative">
                        {icon}
                        {!notif.read && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background animate-pulse"></span>}
                     </div>
                     <div>
                        <p className={`text-sm ${notif.read ? 'text-textMuted' : 'text-white'}`}>{notif.text}</p>
                        <p className="text-xs text-textMuted mt-1">{formatTime(notif.created_at)}</p>
                     </div>
                  </div>
                  <button onClick={() => deleteNotif(notif.id)} className="p-2 text-textMuted hover:text-red-400 transition-colors bg-black/20 rounded-lg shrink-0 sm:ml-4">
                     <Trash2 size={16} />
                  </button>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
