import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Edit2, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const fetchNotices = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notices');
      setNotices(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchNotices(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/notices/${editId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/notices', formData);
      }
      setShowModal(false);
      fetchNotices();
    } catch (err) { console.error(err); toast.error("Not authorized or failed"); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notices/${id}`);
      setNotices(notices.filter(n => n.id !== id));
    } catch (err) { toast.error("Failed to delete notice"); }
  };

  const openModal = (notice = null) => {
    if(notice) {
      setEditId(notice.id);
      setFormData({ title: notice.title, content: notice.content });
    } else {
      setEditId(null);
      setFormData({ title: '', content: '' });
    }
    setShowModal(true);
  };

  const canEdit = user?.role === 'Admin' || user?.role === 'Faculty';

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold font-poppins text-white flex items-center">Campus Notices <Megaphone className="ml-3 text-secondary"/></h2>
           <p className="text-textMuted text-sm mt-1">Official announcements and university updates.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative w-full sm:w-64 shrink-0">
              <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
              <input type="text" placeholder="Search notices..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-textMain focus:border-secondary focus:outline-none transition-colors" />
           </div>
           {canEdit && (
             <button onClick={() => openModal()} className="btn-primary flex items-center shadow-neon shrink-0">
                <Plus size={18} className="mr-2" /> Publish Notice
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
         {loading ? <p className="text-center text-textMuted w-full col-span-full">Loading notices...</p> : filteredNotices.length === 0 ? <p className="text-center text-textMuted w-full col-span-full py-10">No notices match your search.</p> : filteredNotices.map((n, i) => (
           <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 flex flex-col justify-between">
              <div>
                 <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-4">
                    <h3 className="text-lg font-bold text-white leading-tight">{n.title}</h3>
                    {canEdit && (
                       <div className="flex space-x-2 shrink-0 ml-2">
                          <button onClick={() => openModal(n)} className="p-1.5 text-textMuted hover:text-white transition-colors"><Edit2 size={16}/></button>
                          <button onClick={() => handleDelete(n.id)} className="p-1.5 text-textMuted hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                       </div>
                    )}
                 </div>
                 <p className="text-sm text-textMuted leading-relaxed">{n.content}</p>
              </div>
              <div className="mt-6 flex justify-between items-center text-xs opacity-60">
                 <span>By {n.author || 'Admin'}</span>
                 <span>{new Date(n.created_at).toLocaleDateString()}</span>
              </div>
           </motion.div>
         ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-lg p-6 rounded-2xl relative">
              <h3 className="text-xl font-bold text-white mb-4">{editId ? 'Edit Notice' : 'Publish Notice'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                 <input type="text" placeholder="Notice Title" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary focus:outline-none" />
                 <textarea placeholder="Announcement content..." required rows={5} value={formData.content} onChange={e=>setFormData({...formData, content: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-secondary focus:outline-none" />
                 <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg text-textMuted hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="btn-secondary text-white border-secondary bg-secondary/20 shadow-neon">Save Notice</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
