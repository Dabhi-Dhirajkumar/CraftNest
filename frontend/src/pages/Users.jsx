import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Trash2, Check, X, Shield, ShieldOff, Search } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const fetchUsers = () => {
    if (user?.role === 'Admin') {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;
      
      axios.get('http://localhost:5000/api/users', config).then(res => {
         setUsers(res.data);
         setLoading(false);
      }).catch(err => { console.error(err); setLoading(false); });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;
      
      await axios.delete(`http://localhost:5000/api/users/${id}`, config);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) { toast.error("Failed to delete user"); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const config = { headers: {} };
      const localToken = localStorage.getItem('token') || token;
      if (localToken) config.headers.Authorization = `Bearer ${localToken}`;
      
      await axios.put(`http://localhost:5000/api/users/${id}/status`, { status }, config);
       if (status === 'rejected') {
         setUsers(users.filter(u => u.id !== id));
      } else {
         setUsers(users.map(u => u.id === id ? { ...u, status } : u));
      }
    } catch (err) { 
       console.error("Failed API req:", err.response);
       toast.error(err.response?.data?.error || "Failed to update status"); 
    }
  };

  const pendingRequests = users.filter(u => u.status === 'pending');
  const studentHistory = users.filter(u => u.role === 'Student' && u.status !== 'pending');
  const facultyHistory = users.filter(u => u.role === 'Faculty' && u.status !== 'pending');

  let displayUsers = [];
  if (activeTab === 'requests') displayUsers = pendingRequests;
  if (activeTab === 'students') displayUsers = studentHistory;
  if (activeTab === 'faculty') displayUsers = facultyHistory;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayUsers = displayUsers.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-bold text-white flex items-center">User Management <UsersIcon className="ml-3 text-red-400" /></h2>
            <p className="text-textMuted text-sm mt-1">Admin control center for all platform accounts and registrations.</p>
         </div>
         <div className="relative w-full md:w-64 shrink-0">
            <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
            <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-red-400 focus:outline-none transition-colors" />
         </div>
      </div>

      <div className="flex gap-4 mb-4 border-b border-white/10 pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('requests')} 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}>
          Pending Requests ({pendingRequests.length})
        </button>
        <button 
          onClick={() => setActiveTab('students')} 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'students' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}>
          Student History
        </button>
        <button 
          onClick={() => setActiveTab('faculty')} 
          className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'faculty' ? 'text-primary border-b-2 border-primary' : 'text-textMuted hover:text-white'}`}>
          Faculty History
        </button>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
         {loading ? <p className="text-center text-textMuted animate-pulse">Loading users...</p> : displayUsers.length === 0 ? <p className="text-center text-textMuted py-10">No users found in this category.</p> : (
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b border-white/10 text-white/70 text-sm tracking-wider uppercase">
                    <th className="pb-3 px-4 font-semibold">Name</th>
                    <th className="pb-3 px-4 font-semibold">Email</th>
                    <th className="pb-3 px-4 font-semibold">Role</th>
                    <th className="pb-3 px-4 font-semibold">Status</th>
                    <th className="pb-3 px-4 font-semibold text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {displayUsers.map((u, i) => (
                    <motion.tr initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} transition={{delay: i*0.05}} key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                       <td className="py-4 px-4 text-white font-medium">{u.name}</td>
                       <td className="py-4 px-4 text-textMuted text-sm">{u.email}</td>
                       <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role==='Admin' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : u.role==='Faculty' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                             {u.role}
                          </span>
                       </td>
                       <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${u.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : u.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'}`}>
                             {u.status || 'active'}
                          </span>
                       </td>
                       <td className="py-4 px-4 text-right flex justify-end gap-2">
                          {activeTab === 'requests' && (
                            <>
                              <button onClick={() => handleUpdateStatus(u.id, 'active')} className="p-2 bg-white/5 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors cursor-pointer" title="Approve">
                                <Check size={16} />
                              </button>
                              <button onClick={() => handleUpdateStatus(u.id, 'rejected')} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer" title="Reject">
                                <X size={16} />
                              </button>
                            </>
                          )}
                          {(activeTab === 'students' || activeTab === 'faculty') && (
                            <>
                              {(!u.status || u.status === 'active') ? (
                                <button onClick={() => handleUpdateStatus(u.id, 'inactive')} className="p-2 bg-white/5 hover:bg-orange-500/20 text-orange-400 rounded-lg transition-colors cursor-pointer" title="Deactivate/Passout">
                                  <ShieldOff size={16} />
                                </button>
                              ) : (
                                <button onClick={() => handleUpdateStatus(u.id, 'active')} className="p-2 bg-white/5 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors cursor-pointer" title="Activate">
                                  <Shield size={16} />
                                </button>
                              )}
                              <button onClick={() => handleDelete(u.id)} disabled={u.id === user.id} className="p-2 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed" title="Delete">
                                 <Trash2 size={16} />
                              </button>
                            </>
                          )}
                       </td>
                    </motion.tr>
                 ))}
              </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
