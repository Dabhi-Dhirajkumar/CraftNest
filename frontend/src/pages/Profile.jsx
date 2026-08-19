import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Award, Key, Save, Edit3, Shield } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({ name: user?.name || '', password: '', theme: user?.theme || 'dark' });
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: formData.name, theme: formData.theme };
      if (formData.password) payload.password = formData.password;
      
      const res = await axios.put('http://localhost:5000/api/users/profile', payload);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(''), 3000);
      
      // Update local storage token simulation just by resetting state mostly - 
      // actual implementation could refresh token if token contains name/theme
      window.location.reload(); 
    } catch (err) { toast.error('Failed to update profile'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-poppins pb-10">
      <div>
         <h2 className="text-3xl font-bold text-white flex items-center">
           User Profile <UserIcon className="ml-3 text-primary" />
         </h2>
         <p className="text-textMuted text-sm mt-1">Manage your personal information and credentials.</p>
      </div>

      <div className="glass-card p-8 flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8 relative overflow-hidden group">
         <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/40 transition-all duration-700"></div>
         <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-accent p-1 cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
               <div className="w-full h-full bg-background rounded-full flex items-center justify-center border-4 border-background">
                  <UserIcon size={64} className="text-white opacity-80" />
               </div>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 transition-colors">
               <Edit3 size={16} className="text-white" />
            </button>
         </div>
         
         <div className="flex-1 relative z-10 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-white tracking-wide">{user?.name}</h3>
            <p className="text-textMuted text-sm mt-1 flex items-center"><Mail size={14} className="mr-2"/> {user?.email}</p>
            <p className="text-accent text-sm mt-2 font-medium flex items-center"><Award size={14} className="mr-2"/> System {user?.role}</p>
         </div>
      </div>

      {message && <div className="p-4 bg-green-500/20 text-green-300 rounded-xl border border-green-500/40 text-center">{message}</div>}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-card p-8">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center"><Shield size={18} className="mr-2 text-secondary"/> Personal Details</h4>
            <div className="space-y-4">
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Full Name</label>
                  <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary transition-colors" />
               </div>
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Email (Read Only)</label>
                  <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none transition-colors cursor-not-allowed opacity-70" defaultValue={user?.email} disabled />
               </div>
            </div>
            <button type="submit" className="btn-primary w-full mt-6 py-3 flex justify-center items-center">
               <Save size={18} className="mr-2" /> Save Changes
            </button>
         </div>

         <div className="glass-card p-8">
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center"><Key size={18} className="mr-2 text-accent"/> Security</h4>
            <div className="space-y-4">
               <div>
                  <label className="text-xs text-textMuted uppercase tracking-wider mb-1 block">Update Password</label>
                  <input type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-accent transition-colors" placeholder="Leave blank to keep current" />
               </div>
            </div>
         </div>
      </form>
    </div>
  );
}
