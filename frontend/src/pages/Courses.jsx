import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, Trash2, Edit2, Bookmark, User, Tag } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: '', instructor: '', credits: 3 });
  const [editingId, setEditingId] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/courses');
      setCourses(res.data);
    } catch (err) { console.error("Failed to fetch courses"); }
  };

  useEffect(() => { Object.keys(user).length && fetchCourses(); }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/courses/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/courses', formData);
      }
      setIsModalOpen(false);
      setFormData({ title: '', department: '', instructor: '', credits: 3 });
      setEditingId(null);
      fetchCourses();
    } catch (err) { toast.error('Operation failed!'); }
  };

  const startEdit = (course) => {
    setFormData({ title: course.title, department: course.department, instructor: course.instructor, credits: course.credits });
    setEditingId(course.id);
    setIsModalOpen(true);
  };

  const deleteCourse = async (id) => {
    if(!window.confirm('Delete this course permanently?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/courses/${id}`);
      fetchCourses();
    } catch (err) { toast.error('Failed to delete course'); }
  };

  return (
    <div className="space-y-6 font-poppins pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white flex items-center">
             Campus Courses <Book className="ml-3 text-secondary" />
           </h2>
           <p className="text-textMuted text-sm mt-1">Admin control center for modifying active programs.</p>
        </div>
        <button onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ title: '', department: '', instructor: '', credits: 3 }); }} className="btn-primary flex items-center justify-center whitespace-nowrap">
           <Plus size={18} className="mr-2"/> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {courses.map(course => (
            <motion.div key={course.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 flex flex-col relative group overflow-hidden hover:border-white/20 transition-all cursor-pointer">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Book size={64}/></div>
              
              <div className="flex items-start justify-between relative z-10 mb-4">
                 <h3 className="text-xl font-bold text-white break-words pr-4">{course.title}</h3>
                 <div className="flex space-x-2 shrink-0">
                    <button onClick={() => startEdit(course)} className="p-2 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => deleteCourse(course.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"><Trash2 size={16}/></button>
                 </div>
              </div>
              
              <div className="space-y-3 mt-auto relative z-10">
                 <div className="flex items-center text-sm text-textMuted"><Tag size={14} className="mr-2 text-accent"/> {course.department}</div>
                 <div className="flex items-center text-sm text-textMuted"><User size={14} className="mr-2 text-primary"/> Prof. {course.instructor}</div>
                 <div className="flex items-center text-sm font-semibold text-secondary"><Bookmark size={14} className="mr-2"/> {course.credits} Credits</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'Edit Course' : 'Create New Course'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Course Title</label>
                  <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-secondary transition-colors" placeholder="e.g. Advanced Databases" />
               </div>
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Department</label>
                  <input type="text" required value={formData.department} onChange={e=>setFormData({...formData, department: e.target.value})} className="w-full bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-secondary transition-colors" placeholder="e.g. Computer Science" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Instructor</label>
                     <input type="text" required value={formData.instructor} onChange={e=>setFormData({...formData, instructor: e.target.value})} className="w-full bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-secondary transition-colors" placeholder="e.g. Smith" />
                  </div>
                  <div>
                     <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Credits</label>
                     <input type="number" min="1" max="10" required value={formData.credits} onChange={e=>setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-secondary transition-colors" />
                  </div>
               </div>
               <div className="flex space-x-3 pt-4">
                  <button type="submit" className="flex-1 btn-primary">{editingId ? 'Save Changes' : 'Publish Course'}</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary">Cancel</button>
               </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
