import toast from 'react-hot-toast';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings as SettingsIcon, Moon, Sun, Monitor, Bell, Lock, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Settings() {
  const { user, updateThemeSync } = useAuth();
  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [notifs, setNotifs] = useState(true);
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Settings toggle states
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailSummaries, setEmailSummaries] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const handleThemeChange = async (newTheme) => {
    setTheme(newTheme);
    updateThemeSync(newTheme);
    try {
      await axios.put('http://localhost:5000/api/users/profile', { name: user.name, theme: newTheme });
    } catch(err) { console.error('Failed to save theme'); }
  };

  return (
    <div className="max-w-5xl mx-auto font-poppins pb-10">
      <div className="mb-8">
         <h2 className="text-3xl font-bold text-white flex items-center">
           Preferences <SettingsIcon className="ml-3 text-secondary animate-[spin_4s_linear_infinite]" />
         </h2>
         <p className="text-textMuted text-sm mt-1">Customize your system experience and application appearance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="col-span-1 space-y-2">
            {[
              { id: 'appearance', label: 'Appearance', icon: Monitor },
              { id: 'ai', label: 'System Engine', icon: Sparkles },
              { id: 'notifs', label: 'Notifications', icon: Bell },
              { id: 'security', label: 'Privacy & Security', icon: Lock },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center p-4 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary/20 text-textMain border border-primary/50 shadow-[0_0_10px_rgba(107,33,168,0.3)]' : 'text-textMuted hover:bg-black/10 dark:hover:bg-white/5 hover:text-textMain glass-card border-transparent'} font-medium`}>
                 <tab.icon size={20} className="mr-3" /> {tab.label}
              </button>
            ))}
         </div>

         <div className="col-span-1 md:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'appearance' && (
                <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8 min-h-[400px]">
                   <h3 className="text-xl font-bold text-textMain mb-6 border-b border-black/10 dark:border-white/10 pb-4">Theme Settings</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div onClick={() => handleThemeChange('dark')} className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${theme === 'dark' ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(107,33,168,0.5)]' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-black/30 dark:hover:border-white/30'}`}>
                         <Moon size={32} className={theme === 'dark' ? 'text-primary' : 'text-textMuted'} />
                         <span className="mt-4 text-sm font-bold text-textMain">Dark Mode</span>
                      </div>
                      <div onClick={() => handleThemeChange('light')} className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${theme === 'light' ? 'border-secondary bg-secondary/10 shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-black/30 dark:hover:border-white/30'}`}>
                         <Sun size={32} className={theme === 'light' ? 'text-secondary' : 'text-textMuted'} />
                         <span className="mt-4 text-sm font-bold text-textMain">Light Mode</span>
                      </div>
                      <div onClick={() => handleThemeChange('system')} className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${theme === 'system' ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(217,70,239,0.5)]' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-black/30 dark:hover:border-white/30'}`}>
                         <Monitor size={32} className={theme === 'system' ? 'text-accent' : 'text-textMuted'} />
                         <span className="mt-4 text-sm font-bold text-textMain">System Built</span>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8 group relative overflow-hidden min-h-[400px]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[50px] rounded-full group-hover:bg-accent/30 transition-colors pointer-events-none"></div>
                   <h3 className="text-xl font-bold text-textMain mb-6 border-b border-black/10 dark:border-white/10 pb-4 relative z-10 flex items-center"><Sparkles size={20} className="mr-2 text-accent"/> System Toggles</h3>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="font-semibold text-textMain">Smart Prioritization</h4>
                            <p className="text-xs text-textMuted mt-1 max-w-[80%]">Allow System to automatically rank your tasks based on analytical predictions and deadlines.</p>
                         </div>
                         <button onClick={() => setAiEnabled(!aiEnabled)} className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${aiEnabled ? 'bg-accent' : 'bg-black/20 dark:bg-white/20'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${aiEnabled ? 'left-[26px]' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                         <div>
                            <h4 className="font-semibold text-textMain">Predictive Analytics alerts</h4>
                            <p className="text-xs text-textMuted mt-1 max-w-[80%]">Get notified when you are falling behind your normal velocity.</p>
                         </div>
                         <button onClick={() => setNotifs(!notifs)} className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${notifs ? 'bg-primary' : 'bg-black/20 dark:bg-white/20'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${notifs ? 'left-[26px]' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'notifs' && (
                <motion.div key="notifs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8 min-h-[400px]">
                   <h3 className="text-xl font-bold text-textMain mb-6 border-b border-black/10 dark:border-white/10 pb-4 flex items-center"><Bell className="mr-3 text-secondary" /> Notification Scopes</h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="font-semibold text-textMain">Desktop Push Notifications</h4>
                            <p className="text-xs text-textMuted mt-1">Receive system-level alerts even when minimizing the browser.</p>
                         </div>
                         <button onClick={() => setPushNotifs(!pushNotifs)} className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${pushNotifs ? 'bg-secondary' : 'bg-black/20 dark:bg-white/20'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${pushNotifs ? 'left-[26px]' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                         <div>
                            <h4 className="font-semibold text-textMain">Weekly Email Summaries</h4>
                            <p className="text-xs text-textMuted mt-1">System generates a compiled email containing productivity scores.</p>
                         </div>
                         <button onClick={() => setEmailSummaries(!emailSummaries)} className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${emailSummaries ? 'bg-secondary' : 'bg-black/20 dark:bg-white/20'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${emailSummaries ? 'left-[26px]' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                   </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass-card p-8 min-h-[400px]">
                   <h3 className="text-xl font-bold text-textMain mb-6 border-b border-black/10 dark:border-white/10 pb-4 flex items-center"><Lock className="mr-3 text-red-500" /> Security & Privacy</h3>
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div>
                            <h4 className="font-semibold text-textMain">Two-Factor Authentication</h4>
                            <p className="text-xs text-textMuted mt-1">Require a secondary OTP when logging into your account.</p>
                         </div>
                         <button onClick={() => setTwoFactor(!twoFactor)} className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${twoFactor ? 'bg-green-500' : 'bg-black/20 dark:bg-white/20'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-md ${twoFactor ? 'left-[26px]' : 'left-0.5'}`}></div>
                         </button>
                      </div>
                      <div className="pt-6 mt-4 border-t border-black/5 dark:border-white/5 space-y-4">
                         <button onClick={()=>toast.success("Change password wizard launched!")} className="w-full btn-secondary flex justify-center py-3">Update Password</button>
                         <button onClick={()=>window.confirm("Are you incredibly sure you want to permanently delete your account?")} className="w-full border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors py-3 rounded-xl font-bold">Terminate Account</button>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
