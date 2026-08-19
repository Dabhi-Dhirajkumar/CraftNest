import toast from 'react-hot-toast';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Brain, Activity } from 'lucide-react';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('focus'); // focus, shortBreak, longBreak

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      toast.success('Session Complete!');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if(mode === 'focus') setTimeLeft(25 * 60);
    if(mode === 'shortBreak') setTimeLeft(5 * 60);
    if(mode === 'longBreak') setTimeLeft(15 * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    if(newMode === 'focus') setTimeLeft(25 * 60);
    if(newMode === 'shortBreak') setTimeLeft(5 * 60);
    if(newMode === 'longBreak') setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const circumference = 2 * Math.PI * 120;
  const totalSeconds = mode === 'focus' ? 25*60 : mode === 'shortBreak' ? 5*60 : 15*60;
  const strokeDashoffset = circumference - (timeLeft / totalSeconds) * circumference;

  return (
    <div className="space-y-6 font-poppins pb-10 flex flex-col items-center">
      <div className="w-full max-w-2xl text-center mb-6">
         <h2 className="text-3xl font-bold text-textMain flex items-center justify-center">
           Deep Focus <Brain className="ml-3 text-accent" />
         </h2>
         <p className="text-textMuted text-sm mt-1">Boost productivity via targeted sprint techniques.</p>
      </div>

      <div className="glass-card w-full max-w-2xl p-8 flex flex-col items-center relative overflow-hidden group">
         <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[80px] pointer-events-none transition-all"></div>
         <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[80px] pointer-events-none transition-all"></div>

         <div className="flex space-x-2 bg-black/10 dark:bg-white/5 p-1 rounded-full mb-10 z-10 relative border border-black/10 dark:border-white/10">
            <button onClick={()=>switchMode('focus')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode==='focus'? 'bg-accent text-white shadow-neon' : 'text-textMuted hover:text-textMain'}`}>Pomodoro</button>
            <button onClick={()=>switchMode('shortBreak')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode==='shortBreak'? 'bg-secondary text-white shadow-[0_0_10px_rgba(14,165,233,0.8)]' : 'text-textMuted hover:text-textMain'}`}>Short Break</button>
            <button onClick={()=>switchMode('longBreak')} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode==='longBreak'? 'bg-primary text-white shadow-[0_0_10px_rgba(107,33,168,0.8)]' : 'text-textMuted hover:text-textMain'}`}>Long Break</button>
         </div>

         <div className="relative w-72 h-72 flex items-center justify-center z-10 mb-10">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/5 dark:text-white/5" />
               <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="8" fill="transparent"
                       strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
                       className={`${mode==='focus'?'text-accent': mode==='shortBreak'?'text-secondary':'text-primary'} transition-all duration-1000 ease-linear drop-shadow-lg`} />
            </svg>
            <div className="text-6xl font-black text-textMain tracking-widest font-mono drop-shadow-md">
               {formatTime(timeLeft)}
            </div>
         </div>

         <div className="flex space-x-6 z-10 relative">
            <button onClick={toggleTimer} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isActive ? 'bg-black/20 border-2 border-white/20' : 'bg-gradient-to-r from-primary to-accent shadow-neon'}`}>
               {isActive ? <Pause size={28} /> : <Play size={28} className="translate-x-1" />}
            </button>
            <button onClick={resetTimer} className="w-16 h-16 rounded-full flex items-center justify-center text-textMuted bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
               <RotateCcw size={24} />
            </button>
         </div>

      </div>
    </div>
  );
}
