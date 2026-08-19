import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Sparkles, MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Schedule() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', event_time: '', location: '', type: 'study' });

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events');
      setSchedule(res.data);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/events/${editId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/events', formData);
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      setSchedule(schedule.filter(s => s.id !== id));
    } catch (err) { console.error(err); }
  };

  const openModal = (evt = null) => {
    if(evt) {
      setEditId(evt.id);
      setFormData({ title: evt.title, event_time: evt.event_time.slice(0, 16), location: evt.location || '', type: evt.type });
    } else {
      setEditId(null);
      setFormData({ title: '', event_time: '', location: '', type: 'study' });
    }
    setShowModal(true);
  };

  const generateAIschedule = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/ai/schedule', {});
      toast.success("System mapped out optimal timings! Note: In a real system, it would automatically save to your calendar here.");
    } catch (err) { console.error(err); }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'study': return 'border-blue-500/50 bg-blue-500/10 text-blue-300 shadow-[inset_4px_0_0_rgba(59,130,246,1)]';
      case 'class': return 'border-orange-500/50 bg-orange-500/10 text-orange-300 shadow-[inset_4px_0_0_rgba(249,115,22,1)]';
      case 'break': return 'border-green-500/50 bg-green-500/10 text-green-300 shadow-[inset_4px_0_0_rgba(34,197,94,1)]';
      case 'meeting': return 'border-purple-500/50 bg-purple-500/10 text-purple-300 shadow-[inset_4px_0_0_rgba(168,85,247,1)]';
      case 'deep-work': return 'border-red-500/50 bg-red-500/10 text-red-300 shadow-[inset_4px_0_0_rgba(239,68,68,1)]';
      default: return 'border-gray-500/50 bg-gray-500/10 text-gray-300 shadow-[inset_4px_0_0_rgba(156,163,175,1)]';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full font-poppins relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold font-poppins text-white flex items-center">
             Smart Schedule <CalendarIcon className="ml-3 text-secondary animate-pulse" />
           </h2>
           <p className="text-textMuted text-sm mt-1">Manage and sync System-optimized timetables dynamically.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={generateAIschedule} className="btn-secondary flex items-center shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:border-secondary group text-xs md:text-sm">
             <Sparkles size={16} className="mr-2 text-secondary group-hover:animate-ping" /> Auto Generate
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center group text-xs md:text-sm">
             <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> New Event
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card p-6 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-30"></div>
        
        {loading ? <p className="text-center mt-10 text-white animate-pulse relative z-10">Syncing Calendar...</p> : (
           <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <AnimatePresence>
                 {schedule.length === 0 ? <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-10 text-textMuted">No events scheduled.</motion.div> : schedule.map((item, idx) => (
                   <motion.div layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} key={item.id} className={`flex items-stretch rounded-xl overflow-hidden glass-card transition-transform hover:scale-[1.02] ${getTypeStyle(item.type)}`}>
                      <div className="p-4 flex flex-col justify-center items-center w-28 md:w-32 border-r border-white/10 bg-white/5 backdrop-blur-md">
                         <span className="font-bold text-xs md:text-sm text-white tracking-wider text-center">{new Date(item.event_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-center bg-black/10">
                         <div className="flex justify-between items-start">
                            <h3 className="text-base md:text-lg font-semibold text-white tracking-wide">{item.title}</h3>
                            <div className="flex space-x-2 shrink-0">
                               <button onClick={() => openModal(item)} className="p-1 hover:text-white transition-colors"><Edit2 size={14}/></button>
                               <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                            </div>
                         </div>
                         <div className="flex flex-col md:flex-row md:items-center mt-2 space-y-2 md:space-y-0 md:space-x-4">
                            <span className="text-[10px] md:text-xs uppercase font-medium tracking-wider opacity-70 px-2 py-0.5 rounded border border-current">{item.type}</span>
                            <span className="text-[10px] md:text-xs flex items-center opacity-80"><MapPin size={12} className="mr-1" /> {item.location || 'No location specified'}</span>
                         </div>
                      </div>
                   </motion.div>
                 ))}
              </AnimatePresence>
           </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card w-full max-w-md p-6 rounded-2xl relative">
              <h3 className="text-xl font-bold text-white mb-4">{editId ? 'Edit Block' : 'Add Calendar Block'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                 <input type="text" placeholder="Event Title" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" />
                 <input type="datetime-local" placeholder="Event Date" required value={formData.event_time} onChange={e=>setFormData({...formData, event_time: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none custom-date" />
                 <input type="text" placeholder="Physical or Virtual Location" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" />
                 <select required value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none">
                    <option value="study">Study Session</option>
                    <option value="class">Class / Lecture</option>
                    <option value="meeting">Group Meeting</option>
                    <option value="deep-work">Deep Work Sprint</option>
                    <option value="break">Break / Restore</option>
                 </select>
                 <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg text-textMuted hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="btn-primary">Save Event</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
