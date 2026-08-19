import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      if (!/(?=.*[A-Z])/.test(password)) {
        newErrors.password = 'Must contain at least one uppercase letter';
      } else if (!/(?=.*\d)/.test(password)) {
        newErrors.password = 'Must contain at least one number';
      } else if (!/(?=.*[!@#$%^&*()_+\[\]{};':"\\|,.<>/?`~-])/.test(password)) {
        newErrors.password = 'Must contain at least one special character';
      }
    }

    return newErrors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    
    try {
      await login(email, password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
      setServerError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setServerError('');
        await googleLogin(tokenResponse.access_token);
        toast.success('Successfully logged in with Google!');
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google Login failed');
        setServerError(err.response?.data?.error || 'Google Login failed');
      }
    },
    onError: () => {
      setServerError('Google Login was unsuccessful');
    }
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-poppins relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 rounded-3xl shadow-[0_0_40px_rgba(107,33,168,0.2)]">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">Welcome Back</h2>
            <p className="text-textMuted text-sm">Login to your Smart Student Productivity Hub.</p>
         </div>

         {serverError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">{serverError}</div>}

         <form onSubmit={handleLogin} className="space-y-4">
            <div>
               <label className="text-xs text-textMuted uppercase tracking-wider mb-2 block font-semibold">Email Address</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="email" onChange={e => {setEmail(e.target.value); setErrors({...errors, email: ''});}} value={email} className={`w-full bg-white/5 border ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'} rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:bg-white/10 transition-colors shadow-inner`} placeholder="student@campus.edu" />
               </div>
               {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>}
            </div>

            <div>
               <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-textMuted uppercase tracking-wider block font-semibold">Password</label>
                  <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
               </div>
               <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-textMuted" size={18} />
                  <input type="password" onChange={e => {setPassword(e.target.value); setErrors({...errors, password: ''});}} value={password} className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'} rounded-xl p-3.5 pl-12 text-white focus:outline-none focus:bg-white/10 transition-colors shadow-inner`} placeholder="••••••••" />
               </div>
               {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password}</p>}
            </div>

            <button type="submit" className="w-full btn-primary py-4 font-bold text-lg rounded-xl flex items-center justify-center mt-6">
               Sign In <ArrowRight className="ml-2" size={18} />
            </button>

            <div className="relative flex items-center py-2 mt-4">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-textMuted text-xs">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>
            
            <button type="button" onClick={handleGoogleLogin} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-3.5 font-semibold text-white rounded-xl flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google
            </button>
         </form>

         <p className="text-center text-sm text-textMuted mt-10">
            Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
         </p>
      </motion.div>
    </div>
  );
}
