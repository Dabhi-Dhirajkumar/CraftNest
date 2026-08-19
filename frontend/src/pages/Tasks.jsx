import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, Circle, AlertCircle, Sparkles, Trash2, Edit2, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', priority: 'Low', status: 'Pending' });

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/tasks');
      setTasks(res.data);
      setLoading(false);
    } catch (err) { console.error('Error fetching tasks', err); setLoading(false); }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-400 bg-red-400/10 border border-red-400/20';
      case 'Medium': return 'text-orange-400 bg-orange-400/10 border border-orange-400/20';
      case 'Low': return 'text-green-400 bg-green-400/10 border border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const toggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const res = await axios.put(`http://localhost:5000/api/tasks/${task.id}`, { ...task, status: newStatus });
      setTasks(tasks.map(t => t.id === task.id ? res.data : t));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) { console.error(err); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const res = await axios.put(`http://localhost:5000/api/tasks/${editId}`, formData);
        setTasks(tasks.map(t => t.id === editId ? res.data : t));
      } else {
        const res = await axios.post('http://localhost:5000/api/tasks', formData);
        setTasks([...tasks, res.data]);
      }
      setShowModal(false);
    } catch (err) { console.error(err); }
  };

  const openModal = (task = null) => {
    if(task) {
      setEditId(task.id);
      setFormData({ title: task.title, description: task.description || '', deadline: task.deadline ? task.deadline.slice(0, 16) : '', priority: task.priority, status: task.status });
    } else {
      setEditId(null);
      setFormData({ title: '', description: '', deadline: '', priority: 'Low', status: 'Pending' });
    }
    setShowModal(true);
  };

  const aiPredictPriorities = async () => {
    // We send current tasks to System /priority endpoint to optimize them based on deadline
    // Real API integration
    try {
       const updated = [...tasks];
       for (let i = 0; i < updated.length; i++) {
          if (updated[i].status !== 'Completed' && updated[i].deadline) {
             const rs = await axios.post('http://localhost:5000/api/ai/priority', { title: updated[i].title, deadline: updated[i].deadline });
             if(rs.data.priority) {
                const save = await axios.put(`http://localhost:5000/api/tasks/${updated[i].id}`, { ...updated[i], priority: rs.data.priority });
                updated[i] = save.data;
             }
          }
       }
       setTasks(updated);
       toast.success("System successfully analyzed and reprioritized your tasks.");
    } catch (err) { console.error('System Error', err); }
  };

  const filteredTasks = tasks.filter(t => {
     const matchStatus = filter === 'All' ? true : t.status === filter;
     const matchPriority = priorityFilter === 'All' ? true : t.priority === priorityFilter;
     const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
     return matchStatus && matchPriority && matchSearch;
  });

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold font-poppins text-white">Task Manager</h2>
           <p className="text-textMuted text-sm mt-1">Manage, prioritize, and crush your goals.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={aiPredictPriorities} className="btn-secondary flex items-center shadow-[0_0_15px_rgba(232,121,249,0.3)] hover:border-accent group">
             <Sparkles size={18} className="mr-2 text-accent group-hover:animate-spin" /> Auto-Prioritize
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center group">
             <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" /> New Task
          </button>
        </div>
      </div>

      <div className="glass-card p-6 min-h-[500px]">
         <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h3 className="font-semibold text-lg flex items-center"><CheckCircle className="mr-2 text-primary" size={20} /> Your Tasks</h3>
            <div className="flex space-x-2">
               {['All', 'Pending', 'Completed'].map(f => (
                 <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${filter === f ? 'bg-primary/20 text-white border border-primary/50 shadow-[0_0_10px_rgba(107,33,168,0.5)]' : 'bg-white/5 text-textMuted hover:bg-white/10'}`}>
                   {f}
                 </button>
               ))}
            </div>
         </div>

         {loading ? <p className="text-center mt-10 text-white animate-pulse">Loading API data...</p> : (
            <div className="space-y-3">
               <AnimatePresence>
                 {filteredTasks.length === 0 ? <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-10 text-textMuted">No tasks found.</motion.div> : filteredTasks.map((task) => (
                   <motion.div key={task.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${task.status === 'Completed' ? 'bg-white/5 border-white/5 opacity-60' : 'bg-white/10 border-white/10 hover:border-primary/50 shadow-glass'}`}>
                     <div className="flex items-center space-x-4">
                        <button onClick={() => toggleStatus(task)} className="focus:outline-none">
                          {task.status === 'Completed' ? <CheckCircle className="text-green-500" size={24}/> : <Circle className="text-textMuted hover:text-primary transition-colors" size={24}/>}
                        </button>
                        <div>
                          <h4 className={`font-semibold ${task.status === 'Completed' ? 'line-through text-textMuted' : 'text-white'}`}>{task.title}</h4>
                          <p className="text-xs text-textMuted mt-1 flex items-center"><AlertCircle size={12} className="mr-1" /> Due: {task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline'}</p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-4">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        <button onClick={() => openModal(task)} className="p-1.5 text-textMuted hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(task.id)} className="p-1.5 text-textMuted hover:text-red-400 bg-white/5 hover:bg-red-400/10 rounded-md transition-colors"><Trash2 size={16}/></button>
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
              <h3 className="text-xl font-bold text-white mb-4">{editId ? 'Edit Task' : 'New Task'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                 <input type="text" placeholder="Task Title" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" />
                 <textarea placeholder="Description" rows={2} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none" />
                 <input type="datetime-local" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none custom-date" />
                 <select value={formData.priority} onChange={e=>setFormData({...formData, priority: e.target.value})} className="w-full bg-background border border-white/10 rounded-lg p-3 text-white focus:border-primary focus:outline-none">
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                 </select>
                 <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2 rounded-lg text-textMuted hover:text-white transition-colors">Cancel</button>
                    <button type="submit" className="btn-primary">{editId ? 'Save Changes' : 'Create Task'}</button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
