import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Clock, Shield, ArrowRight, Sun, Moon, Calendar, CheckCircle, BarChart3, Users, Zap, BookOpen, Send } from 'lucide-react';

export default function Landing() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain font-poppins relative overflow-x-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute right-[-10%] top-[30%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 md:px-12 relative z-10 glass-card m-4 rounded-full border border-black/5 dark:border-white/5 shadow-lg">
         <div className="text-xl font-bold neon-text tracking-wide flex items-center">
            <Sparkles className="mr-2" size={24} /> Smart Student Productivity Hub
         </div>
         <div className="flex space-x-3 items-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-textMain transition-colors cursor-pointer mr-2" aria-label="Toggle Theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="px-4 md:px-6 py-2 rounded-full font-medium text-textMain hover:bg-black/5 dark:hover:bg-white/10 transition-colors">Login</Link>
            <Link to="/signup" className="btn-primary rounded-full px-5 md:px-6 py-2 pb-2">Get Started</Link>
         </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-4 relative z-10 mt-16 md:mt-24 mb-32">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="px-4 py-1.5 rounded-full text-xs font-bold border border-accent/50 bg-accent/10 text-accent uppercase tracking-widest mb-6 inline-block shadow-neon">
               The Future of Student Productivity
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-textMain leading-tight mt-4 tracking-tight">
               Meet Your <span className="bg-gradient-to-r from-primary via-secondary to-accent text-transparent bg-clip-text">Smart System</span> <br/> Smart Student Productivity Hub
            </h1>
            <p className="mt-8 text-lg md:text-xl text-textMuted max-w-3xl mx-auto leading-relaxed">
               Intelligently organize your tasks, get dynamic schedule optimizations, and stay ahead of your deadlines with our predictive system engine designed strictly for high-performing students.
            </p>
         </motion.div>
         
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-12 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/signup" className="btn-primary px-8 py-4 text-lg rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(232,121,249,0.5)] hover:scale-105 transition-transform duration-300">
               Start for Free <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link to="/login" className="btn-secondary px-8 py-4 text-lg rounded-full flex items-center justify-center text-textMain border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
               View Dashboard Demo
            </Link>
         </motion.div>
      </div>

      {/* Core Features Overview */}
      <div className="py-20 px-6 md:px-12 relative z-10 border-t border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
         <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-textMain mb-4">Master Your Academic Life</h2>
            <p className="text-textMuted max-w-2xl mx-auto text-lg">Everything you need to maintain peak productivity and eliminate the chaos of campus schedules.</p>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <FeatureCard 
               icon={<Brain size={32} className="text-primary" />} 
               title="Predictive Prioritization" 
               desc="Our engine analyzes your upcoming deadlines and suggests the mathematically optimal task ordering so you never miss another due date." 
            />
            <FeatureCard 
               icon={<Calendar size={32} className="text-secondary" />} 
               title="Smart Schematics" 
               desc="Auto-generate timelines that fit your registered classes, preferred study hours, and important breaks perfectly." 
            />
            <FeatureCard 
               icon={<BarChart3 size={32} className="text-accent" />} 
               title="Deep Analytics" 
               desc="Understand exactly how your productivity changes over the semester with highly detailed, interactive graph reports." 
            />
            <FeatureCard 
               icon={<BookOpen size={32} className="text-green-500" />} 
               title="Unified Resources" 
               desc="Directly connect with faculty portals to automatically sync your syllabus, materials, and important reading links." 
            />
            <FeatureCard 
               icon={<CheckCircle size={32} className="text-blue-500" />} 
               title="Focus Timers" 
               desc="Utilize built-in Pomodoro techniques integrated directly into your schedule to keep your cognitive momentum high." 
            />
            <FeatureCard 
               icon={<Users size={32} className="text-orange-500" />} 
               title="Secure Collaboration" 
               desc="Interact directly with admin and faculty announcements with role-based security preserving your data integrity." 
            />
         </div>
      </div>

      {/* How it Works / Steps */}
      <div className="py-24 px-6 md:px-12 max-w-6xl mx-auto relative z-10">
         <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-8">
               <h2 className="text-4xl font-bold text-textMain leading-tight">Works like magic, <br/>built for academic reality.</h2>
               <p className="text-textMuted text-lg leading-relaxed">Stop manually juggling assignments across five different syllabus PDFs. Let the system do the heavy lifting.</p>
               
               <div className="space-y-8 mt-10">
                  <div className="flex items-start">
                     <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-primary font-bold text-xl shrink-0 mr-5 border border-primary/30 shadow-[0_0_15px_rgba(107,33,168,0.3)]">1</div>
                     <div>
                        <h4 className="text-xl font-bold text-textMain mb-2">Create Your Identity</h4>
                        <p className="text-textMuted leading-relaxed">Register your secure account using custom credentials or your standard Google workspace integration instantly.</p>
                     </div>
                  </div>
                  <div className="flex items-start">
                     <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-secondary font-bold text-xl shrink-0 mr-5 border border-secondary/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]">2</div>
                     <div>
                        <h4 className="text-xl font-bold text-textMain mb-2">Input Your Parameters</h4>
                        <p className="text-textMuted leading-relaxed">Provide your tasks, events, and focus limits. Smart Student Productivity Hub scales immediately to shape around your specific data map.</p>
                     </div>
                  </div>
                  <div className="flex items-start">
                     <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-accent font-bold text-xl shrink-0 mr-5 border border-accent/30 shadow-[0_0_15px_rgba(217,70,239,0.3)]">3</div>
                     <div>
                        <h4 className="text-xl font-bold text-textMain mb-2">Experience Autopilot</h4>
                        <p className="text-textMuted leading-relaxed">Follow the streamlined dashboard and complete objectives sequentially without cognitive overload.</p>
                     </div>
                  </div>
               </div>
            </div>
            
            <div className="lg:w-1/2 relative w-full aspect-square md:aspect-video lg:aspect-square rounded-[3rem] glass-card overflow-hidden border border-black/10 dark:border-white/10 p-8 flex flex-col justify-center items-center shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/5 pointer-events-none"></div>
                <div className="relative z-10 w-full space-y-4">
                   <div className="h-12 w-2/3 bg-black/10 dark:bg-white/10 rounded-2xl mb-8 animate-pulse text-transparent">_</div>
                   <div className="h-10 w-full bg-black/5 dark:bg-white/5 rounded-xl flex items-center px-4"><span className="w-4 h-4 rounded-full bg-primary mr-3"></span></div>
                   <div className="h-10 w-5/6 bg-black/5 dark:bg-white/5 rounded-xl flex items-center px-4"><span className="w-4 h-4 rounded-full bg-secondary mr-3"></span></div>
                   <div className="h-10 w-full bg-black/5 dark:bg-white/5 rounded-xl flex items-center px-4"><span className="w-4 h-4 rounded-full bg-accent mr-3"></span></div>
                   <div className="h-32 w-full bg-black/5 dark:bg-white/5 rounded-2xl mt-8 flex items-center justify-center border border-black/5 dark:border-white/5 shadow-inner">
                      <Zap className="text-secondary animate-bounce delay-150" size={56} />
                   </div>
                </div>
            </div>
         </div>
      </div>

      {/* Hero CTA */}
      <div className="py-24 relative z-10 px-4">
         <div className="max-w-5xl mx-auto glass-card rounded-[3rem] p-12 lg:p-20 text-center border-t border-black/10 dark:border-white/20 shadow-[0_0_50px_rgba(232,121,249,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-accent/20 pointer-events-none"></div>
            <h2 className="text-4xl md:text-6xl font-black text-textMain mb-6 relative z-10 tracking-tight">Ready to supercharge your grades?</h2>
            <p className="text-xl text-textMuted mb-12 max-w-2xl mx-auto relative z-10">Join thousands of students and faculty members orchestrating their academic ecosystems on Smart Student Productivity Hub today.</p>
            <Link to="/signup" className="inline-flex btn-primary px-10 py-5 text-xl font-bold rounded-full items-center shadow-[0_0_40px_rgba(107,33,168,0.5)] hover:scale-105 transition-transform relative z-10">
               Create Free Account <ArrowRight className="ml-3" size={24} />
            </Link>
         </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-black/10 dark:border-white/5 pt-20 pb-10 px-6 md:px-12 relative z-10 bg-black/5 dark:bg-white/5 mt-auto">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
            <div className="lg:col-span-2 pr-4">
               <div className="flex items-center text-lg md:text-xl font-bold text-textMain mb-6">
                  <Sparkles className="mr-2 text-primary shrink-0" size={24} /> Smart Student Productivity Hub
               </div>
               <p className="text-textMuted text-sm leading-relaxed max-w-sm mb-6">
                  The ultimate intelligent ecosystem designed to orchestrate the chaotic academic lives of students, providing predictive pathways to absolute success and stress-free graduation.
               </p>
               <div className="flex items-center space-x-2 text-xs font-semibold text-textMain bg-black/5 dark:bg-white/5 w-fit px-4 py-2 rounded-full border border-black/10 dark:border-white/10 mb-8">
                  <Shield size={14} className="text-green-500" />
                  <span>Trusted by 10,000+ Students Worldwide</span>
               </div>
               <div className="flex space-x-4 mt-6">
                  {['Twitter', 'LinkedIn', 'Instagram', 'GitHub'].map((social, i) => (
                     <a key={i} href="#" className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-textMuted hover:text-white hover:bg-primary transition-all">
                        <span className="text-xs font-bold">{social[0]}</span>
                     </a>
                  ))}
               </div>
            </div>
            
            <div className="lg:col-span-1">
               <h4 className="text-textMain font-bold mb-6 tracking-wide uppercase text-xs">Platform</h4>
               <ul className="space-y-4 text-sm text-textMuted font-medium">
                  <li><Link to="/features" className="hover:text-primary transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Features</Link></li>
                  <li><Link to="/integrations" className="hover:text-secondary transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Integrations</Link></li>
                  <li><Link to="/pricing" className="hover:text-accent transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Pricing</Link></li>
                  <li><Link to="/changelog" className="hover:text-textMain transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Changelog</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-1">
               <h4 className="text-textMain font-bold mb-6 tracking-wide uppercase text-xs">Company</h4>
               <ul className="space-y-4 text-sm text-textMuted font-medium">
                  <li><Link to="/about" className="hover:text-primary transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> About Us</Link></li>
                  <li><Link to="/careers" className="hover:text-secondary transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Careers</Link></li>
                  <li><Link to="/blog" className="hover:text-accent transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Blog</Link></li>
                  <li><Link to="/contact" className="hover:text-textMain transition-colors flex items-center pr-2"><ArrowRight size={12} className="mr-2 opacity-0 hover:opacity-100 transition-opacity"/> Contact</Link></li>
               </ul>
            </div>

            <div className="lg:col-span-2 pl-0 lg:pl-8">
               <h4 className="text-textMain font-bold mb-6 tracking-wide uppercase text-xs">Stay Updated</h4>
               <p className="text-textMuted text-sm mb-4">Subscribe to our newsletter for the latest student productivity tips directly to your inbox.</p>
               <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="Enter your email address" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-textMain focus:outline-none focus:border-secondary transition-colors" required />
                  <button type="submit" className="absolute right-1 w-9 h-9 flex items-center justify-center bg-secondary text-white rounded-lg hover:bg-secondary/80 transition-colors">
                     <Send size={14} />
                  </button>
               </form>
               <p className="text-[10px] text-textMuted mt-3">By subscribing, you agree to our <Link to="/privacy" className="underline hover:text-textMain">Privacy Policy</Link>.</p>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto pt-8 border-t border-black/10 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-textMuted text-xs font-mono">
               &copy; {new Date().getFullYear()} Smart Student Productivity Hub. All rights reserved. Built for high-performing students.
            </div>
            <div className="flex items-center space-x-2 text-xs text-textMuted">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               <span>All Systems Operational</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }} className="glass-card p-8 rounded-3xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_10px_30px_rgba(255,255,255,0.02)] flex flex-col items-start text-left">
       <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-black/5 dark:border-white/5">
          {icon}
       </div>
       <h3 className="text-xl font-bold text-textMain mb-3">{title}</h3>
       <p className="text-textMuted leading-relaxed text-sm md:text-base">{desc}</p>
    </motion.div>
  );
}
