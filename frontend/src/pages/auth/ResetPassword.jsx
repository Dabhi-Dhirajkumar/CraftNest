import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const otp = location.state?.otp;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!email || !otp) {
    navigate('/forgot-password');
    return null;
  }

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
       return setError("Passwords do not match");
    }
    
    // Validate password pattern
    if (!/(?=.*[A-Z])/.test(password) || !/(?=.*\d)/.test(password) || !/(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~-])/.test(password)) {
       return setError("Password must contain uppercase, number, and special character.");
    }

    setLoading(true);
    setError('');
    
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { email, otp, newPassword: password });
      toast.success("Password updated successfully!");
      navigate('/login');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-poppins relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 rounded-3xl">
         <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/10">
               <ShieldCheck size={28} className="text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">New Password</h2>
            <p className="text-textMuted text-sm">Enter your new secure password.</p>
         </div>

         <form onSubmit={handleReset} className="space-y-5">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">{error}</div>}
            
            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">New Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-colors shadow-inner" placeholder="••••••••" />
               </div>
            </div>

            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Confirm Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-colors shadow-inner" placeholder="••••••••" />
               </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 font-bold text-lg rounded-xl flex items-center justify-center mt-6 shadow-neon disabled:opacity-50">
               {loading ? 'Saving...' : 'Save New Password'} <ArrowRight className="ml-2" size={18} />
            </button>
         </form>

      </motion.div>
    </div>
  );
}
