import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Search, Reply, User, Info, Clock } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Feedback() {
  const { user, token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'history'
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    fetchFeedbacks();
  }, [user, activeTab]);

  const fetchFeedbacks = () => {
    const config = { headers: {} };
    const localToken = localStorage.getItem('token') || token;
    if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

    if (user?.role === 'Admin') {
      axios.get('http://localhost:5000/api/feedback', config).then(res => setFeedbacks(res.data)).catch(err => console.error(err));
    } else if (activeTab === 'history') {
      axios.get('http://localhost:5000/api/feedback/my', config).then(res => setFeedbacks(res.data)).catch(err => console.error(err));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

      await axios.post('http://localhost:5000/api/feedback', { subject, message }, config);
      setSent(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSent(false), 3000);
      if(user?.role !== 'Admin') setActiveTab('history');
    } catch (err) { toast.error('Failed to send feedback'); }
  };

  const handleReply = async (id) => {
    if(!replyText[id]) return toast.error("Please enter a reply");
    try {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;

      await axios.put(`http://localhost:5000/api/feedback/${id}/reply`, { reply: replyText[id] }, config);
      toast.success("Reply sent successfully!");
      fetchFeedbacks();
    } catch (err) { toast.error("Failed to submit reply"); }
  };

  const filteredFeedbacks = feedbacks.filter(f => 
     f.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
     f.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-poppins pb-10">
      <div className="mb-6">
         <h2 className="text-3xl font-bold text-white flex items-center">System Feedback <MessageSquare className="ml-3 text-accent" /></h2>
         <p className="text-textMuted text-sm mt-1">Help us improve the Smart Student Productivity Hub by sharing your suggestions.</p>
      </div>

      {user?.role !== 'Admin' && (
         <div className="flex gap-4 mb-4 border-b border-white/10 pb-2">
           <button onClick={() => setActiveTab('submit')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'submit' ? 'text-accent border-b-2 border-accent' : 'text-textMuted hover:text-white'}`}>Submit Feedback</button>
           <button onClick={() => setActiveTab('history')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'history' ? 'text-accent border-b-2 border-accent' : 'text-textMuted hover:text-white'}`}>My Feedbacks</button>
         </div>
      )}

      {(activeTab === 'submit' && user?.role !== 'Admin') && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-10 relative overflow-hidden group">
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-accent/10 blur-[80px] rounded-full group-hover:bg-accent/20 transition-all duration-700 pointer-events-none"></div>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Subject</label>
                  <input type="text" required value={subject} onChange={e=>setSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors shadow-inner" placeholder="E.g., Bug with Calendar System" />
               </div>
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Message & Context</label>
                  <textarea required rows={5} value={message} onChange={e=>setMessage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-accent transition-colors shadow-inner" placeholder="Explain the feedback in detail..." />
               </div>
               <button type="submit" className="btn-primary py-4 font-bold text-lg rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(232,121,249,0.3)] min-w-[200px]">
                  {sent ? "Sent Successfully!" : <><Send size={18} className="mr-2"/> Submit Feedback</>}
               </button>
            </form>
         </motion.div>
      )}

      {activeTab === 'history' && user?.role !== 'Admin' && (
         <div className="space-y-4 pt-4">
            {feedbacks.length === 0 ? <p className="text-textMuted text-center py-10 glass-card">You haven't submitted any feedback yet.</p> : feedbacks.map(f => (
               <div key={f.id} className="glass-card p-6 border border-white/5">
                  <div className="flex justify-between items-start mb-2">
                     <h4 className="text-lg font-bold text-white">{f.subject}</h4>
                     <span className="text-xs text-textMuted bg-white/5 px-2 py-1 rounded">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-textMuted leading-relaxed mb-4">{f.message}</p>
                  
                  {f.admin_reply ? (
                    <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-xl">
                       <h5 className="flex items-center text-accent font-semibold text-xs uppercase tracking-wider mb-2"><Info size={14} className="mr-2"/> Admin Response</h5>
                       <p className="text-sm text-white/90">{f.admin_reply}</p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                       <p className="text-xs text-textMuted italic flex items-center"><Clock size={12} className="mr-2"/> Awaiting review from administration.</p>
                    </div>
                  )}
               </div>
            ))}
         </div>
      )}

      {user?.role === 'Admin' && (
        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-white">Admin: User Feedbacks</h3>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
               <input type="text" placeholder="Search feedback..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-accent focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="space-y-4">
             {filteredFeedbacks.length === 0 ? <p className="text-textMuted">No feedback matched your search.</p> : filteredFeedbacks.map(f => (
               <div key={f.id} className="glass-card p-6 border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                     <h4 className="text-lg font-bold text-white">{f.subject}</h4>
                     <span className="text-xs text-textMuted bg-white/5 px-2 py-1 rounded">{new Date(f.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-textMuted leading-relaxed mb-4">{f.message}</p>
                  <div className="flex items-center space-x-2 text-xs opacity-70 mb-4 border-b border-white/10 pb-4">
                     <User size={14}/>
                     <span className="font-semibold text-accent">{f.author_name}</span>
                     <span>({f.author_role})</span>
                  </div>
                  
                  {f.admin_reply ? (
                     <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-sm text-white/90">
                        <span className="block text-accent text-xs font-semibold mb-1 uppercase tracking-wider">Your Reply:</span>
                        {f.admin_reply}
                     </div>
                  ) : (
                     <div className="flex gap-2">
                        <input type="text" placeholder="Type a response to this user..." className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-accent focus:outline-none" value={replyText[f.id] || ''} onChange={e => setReplyText({...replyText, [f.id]: e.target.value})} />
                        <button onClick={() => handleReply(f.id)} className="btn-secondary px-6 shrink-0 flex items-center justify-center border-accent text-accent hover:bg-accent/10 hover:text-white">
                           <Reply size={16} className="mr-2"/> Reply
                        </button>
                     </div>
                  )}
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
