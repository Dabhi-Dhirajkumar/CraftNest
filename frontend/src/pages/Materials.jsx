import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Link as LinkIcon, Download, Trash2, Plus, Server, User, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Materials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', link: '' });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const isStaff = user?.role === 'Admin' || user?.role === 'Faculty';

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/materials');
      setMaterials(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { Object.keys(user).length && fetchMaterials(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/materials', formData);
      setIsModalOpen(false);
      setFormData({ title: '', subject: '', link: '' });
      fetchMaterials();
    } catch (err) { toast.error('Failed to share learning resource.'); }
  };

  const deleteMaterial = async (id) => {
    if(!window.confirm('Delete this study resource entirely from the platform?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/materials/${id}`);
      fetchMaterials();
    } catch (err) { toast.error('Failed to delete material'); }
  };

  const directToLink = (url) => {
    window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
  };

  const subjects = ['All', ...new Set(materials.map(m => m.subject))];

  const filteredMaterials = materials.filter(m => {
     const matchCategory = categoryFilter === 'All' || m.subject === categoryFilter;
     const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject.toLowerCase().includes(searchQuery.toLowerCase());
     return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6 font-poppins pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-textMain flex items-center">
             Study Materials <BookOpen className="ml-3 text-secondary" />
           </h2>
           <p className="text-textMuted text-sm mt-1">Cross-platform digital library for assigned curriculum content.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
              <input type="text" placeholder="Search materials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-textMain focus:border-secondary focus:outline-none transition-colors" />
           </div>
           <div className="relative shrink-0">
              <Filter className="absolute left-3 top-2.5 text-textMuted" size={16} />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-textMuted focus:border-secondary focus:outline-none appearance-none cursor-pointer">
                 {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
              </select>
           </div>
           {isStaff && (
             <button onClick={() => setIsModalOpen(true)} className="btn-secondary flex items-center justify-center whitespace-nowrap bg-primary/20 text-textMain shadow-none">
                <Plus size={18} className="mr-2"/> Upload
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading && <div className="text-textMuted col-span-full">Syncing institutional records...</div>}
        <AnimatePresence>
          {filteredMaterials.map(mat => (
            <motion.div key={mat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 flex flex-col group relative hover:border-textMuted/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                 <div className="pr-4">
                    <h3 className="text-xl font-bold text-textMain mb-1">{mat.title}</h3>
                    <span className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">{mat.subject}</span>
                 </div>
                 {isStaff && (
                    <button onClick={(e) => { e.stopPropagation(); deleteMaterial(mat.id); }} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg shrink-0 transition-colors">
                       <Trash2 size={16}/>
                    </button>
                 )}
              </div>
              
              <div className="mt-4 space-y-2 mb-6 text-sm text-textMuted flex-1">
                 <p className="flex items-center"><User size={14} className="mr-2 text-primary" /> Prof. {mat.uploaded_by}</p>
                 <p className="flex items-center"><Server size={14} className="mr-2 text-accent" /> {new Date(mat.created_at).toLocaleDateString()}</p>
              </div>

              <button onClick={() => directToLink(mat.link)} className="w-full flex items-center justify-center p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 text-textMain font-medium transition-colors">
                 <LinkIcon size={16} className="mr-2"/> Access Link
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        {!loading && filteredMaterials.length === 0 && <div className="text-textMuted col-span-full py-10 text-center border-dashed border-2 border-black/10 dark:border-white/10 rounded-2xl">No study materials match your search filters.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-6 relative overflow-hidden">
            <h3 className="text-xl font-bold text-textMain mb-6 flex items-center"><Download className="mr-2 text-secondary"/> Share Material</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Resource Title</label>
                  <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-secondary" placeholder="e.g. Chapter 4 Slides" />
               </div>
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Course/Subject</label>
                  <input type="text" required value={formData.subject} onChange={e=>setFormData({...formData, subject: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-secondary" placeholder="e.g. Advanced Systems" />
               </div>
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">External Link (Drive/Cloud/URL)</label>
                  <input type="text" required value={formData.link} onChange={e=>setFormData({...formData, link: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-textMain focus:outline-none focus:border-secondary" placeholder="https://docs.google.com/..." />
               </div>
               <div className="flex space-x-3 pt-4 border-t border-black/5 dark:border-white/5">
                  <button type="submit" className="flex-1 btn-primary bg-secondary from-secondary to-blue-500 shadow-none">Broadcast File</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary border border-transparent">Cancel</button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
