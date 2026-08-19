import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.name) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(formData.password)) {
         newErrors.password = 'Must contain at least one number';
      } else if (!/(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~-])/.test(formData.password)) {
        newErrors.password = 'Must contain at least one special character';
      }
    }

    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setServerError('');
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Registration sent! Please wait for Admin approval.', { duration: 5000 });
      // Optional: Delay navigation or let user click to login
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
      setServerError(err.response?.data?.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-poppins relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 rounded-3xl shadow-[0_0_40px_rgba(232,121,249,0.2)]">
         <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">Create Account</h2>
            <p className="text-textMuted text-sm">Join Smart Student Productivity Hub today.</p>
         </div>
         
         {serverError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">{serverError}</div>}

         <form onSubmit={handleSignup} className="space-y-4">
            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Full Name</label>
               <div className="relative">
                  <User className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="text" onChange={e => {setFormData({...formData, name: e.target.value}); setErrors({...errors, name: ''});}} className={`w-full bg-white/5 border ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent'} rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:bg-white/10 transition-colors shadow-inner`} placeholder="Sarah Student" />
               </div>
               {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name}</p>}
            </div>

            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Email Address</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="email" onChange={e => {setFormData({...formData, email: e.target.value}); setErrors({...errors, email: ''});}} className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent'} rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:bg-white/10 transition-colors shadow-inner`} placeholder="student@campus.edu" />
               </div>
               {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Account Role</label>
               <div className="relative">
                  <Shield className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <select onChange={e => setFormData({...formData, role: e.target.value})} value={formData.role} className="w-full bg-background border border-white/10 rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:border-accent transition-colors shadow-inner appearance-none cursor-pointer">
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Admin">Admin</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Password</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="password" onChange={e => {setFormData({...formData, password: e.target.value}); setErrors({...errors, password: ''});}} className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent'} rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:bg-white/10 transition-colors shadow-inner`} placeholder="••••••••" />
               </div>
               {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
            </div>

            <button type="submit" className="w-full btn-primary bg-gradient-to-r from-accent to-primary py-4 font-bold text-lg rounded-xl flex items-center justify-center mt-6">
               Sign Up <ArrowRight className="ml-2" size={18} />
            </button>
         </form>

         <p className="text-center text-sm text-textMuted mt-10">
            Already have an account? <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
         </p>
      </motion.div>
    </div>
  );
}
