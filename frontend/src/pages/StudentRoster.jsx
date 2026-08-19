import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Clock, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function StudentRoster() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const config = { headers: {} };
        const localToken = localStorage.getItem('token') || token;
        if (localToken) config.headers.Authorization = `Bearer ${localToken}`;
        
        const res = await axios.get('http://localhost:5000/api/users/students', config);
        setStudents(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchStudents();
  }, [token]);

  const displayStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-poppins pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold text-textMain flex items-center">
              Enrolled Students <Users className="ml-3 text-secondary" />
            </h2>
            <p className="text-textMuted text-sm mt-1">Staff overview list for monitoring registered campus students.</p>
         </div>
         <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
            <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-textMain focus:border-secondary focus:outline-none transition-colors" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading && <div className="text-textMuted col-span-full">Loading database...</div>}
         {!loading && displayStudents.map((student, idx) => (
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: idx*0.05}} key={student.id} className="glass-card p-6 flex flex-col relative group">
               <div className="absolute top-4 right-4"><CheckCircle size={18} className="text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] bg-black rounded-full" /></div>
               <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-accent p-1 mb-4">
                  <div className="w-full h-full bg-background rounded-full flex items-center justify-center border-2 border-background">
                     <Users size={24} className="text-textMuted" />
                  </div>
               </div>
               <h3 className="text-lg font-bold text-textMain">{student.name}</h3>
               <p className="text-xs text-textMuted mt-1 flex items-center"><Mail size={12} className="mr-2 text-primary" /> {student.email}</p>
               <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex items-center text-xs text-textMuted">
                 <Clock size={12} className="mr-2" /> Joined {new Date(student.created_at).toLocaleDateString()}
               </div>
            </motion.div>
         ))}
      </div>
    </div>
  );
}
