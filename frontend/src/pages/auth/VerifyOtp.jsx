import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!email) {
    navigate('/forgot-password');
    return null;
  }

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      setLoading(true);
      setError('');
      try {
        await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp: otpValue });
        setLoading(false);
        navigate('/reset-password', { state: { email, otp: otpValue } });
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.error || 'Invalid or expired OTP');
      }
    }
  };

  const handleResend = async () => {
     try {
       await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
       toast.success("OTP resent!");
     } catch (err) {
       toast.error("Failed to resend OTP");
     }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-poppins relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-md p-8 md:p-10 relative z-10 rounded-3xl">
         <div className="text-center mb-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/10">
               <KeyRound size={28} className="text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">Verify OTP</h2>
            <p className="text-textMuted text-sm">We sent a verification code to your email.</p>
         </div>

         <form onSubmit={handleVerify} className="space-y-6">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">{error}</div>}
            <div className="flex justify-center space-x-2">
               {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    className="w-10 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-colors shadow-inner"
                    maxLength={1}
                  />
               ))}
            </div>

            <button type="submit" disabled={otp.join('').length < 6 || loading} className="w-full bg-gradient-to-r from-accent to-primary text-white py-4 font-bold text-lg rounded-xl flex items-center justify-center mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(232,121,249,0.3)]">
               {loading ? 'Verifying...' : 'Verify & Proceed'} <ArrowRight className="ml-2" size={18} />
            </button>
         </form>

         <div className="mt-8 text-center text-sm flex flex-col items-center space-y-4">
            <p className="text-textMuted">Didn't receive code? <button type="button" onClick={handleResend} className="text-accent hover:underline">Resend OTP</button></p>
            <Link to="/login" className="text-textMuted hover:text-white transition-colors flex items-center">
               <ArrowLeft size={16} className="mr-2" /> Back to Login
            </Link>
         </div>
      </motion.div>
    </div>
  );
}
