import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Clock, User, Activity, Search } from 'lucide-react';
import axios from 'axios';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/ai/logs');
        setLogs(res.data);
      } catch (err) { console.error("Failed to fetch logs"); }
      setLoading(false);
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.query.toLowerCase().includes(search.toLowerCase()) || 
    log.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-poppins pb-10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-textMain flex items-center">
             System Logs <Terminal className="ml-3 text-red-400" />
           </h2>
           <p className="text-textMuted text-sm mt-1">Admin view defining platform interaction requests over System.</p>
        </div>
        <div className="flex items-center glass-card px-4 py-2 border-white/20">
           <Search size={18} className="text-textMuted mr-2" />
           <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter logs..." className="bg-transparent border-none focus:outline-none text-textMain text-sm w-48" />
        </div>
      </div>

      <div className="flex-1 glass-card p-4 overflow-hidden flex flex-col">
         {loading ? (
             <div className="flex-1 flex justify-center items-center"><span className="animate-pulse flex items-center text-textMuted"><Activity className="mr-2"/> Scanning nodes...</span></div>
         ) : (
             <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
                <AnimatePresence>
                  {filteredLogs.map((log, idx) => (
                    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{delay: idx*0.05}} key={log.id} className="p-4 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl hover:bg-black/20 dark:hover:bg-white/10 transition-colors">
                       <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center text-sm font-semibold text-secondary"><User size={14} className="mr-2"/> {log.name}</div>
                           <div className="flex items-center text-xs text-textMuted"><Clock size={12} className="mr-1"/> {new Date(log.created_at).toLocaleString()}</div>
                       </div>
                       <div className="mt-2 space-y-2">
                           <div className="p-3 bg-black/20 dark:bg-black/40 rounded-lg text-sm font-mono text-textMuted border border-black/10 dark:border-white/5 break-words">
                               <span className="text-accent">{'> '}</span> {log.query}
                           </div>
                           <div className="p-3 bg-primary/10 rounded-lg text-sm text-textMain border border-primary/20 break-words">
                               <span className="font-bold text-primary mr-2">SYS_ACK:</span> {log.response}
                           </div>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filteredLogs.length === 0 && <div className="text-center py-10 text-textMuted">No logic events found within firewall bounds.</div>}
             </div>
         )}
      </div>
    </div>
  );
}
