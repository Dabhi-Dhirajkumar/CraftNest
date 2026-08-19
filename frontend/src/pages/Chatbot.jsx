import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am your System Smart Student Productivity Hub. You can ask me to organize your schedule or prioritize tasks.", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages([...messages, newMsg]);
    setInput('');
    setLoading(true);

    try {
      // Real API call to Backend
      const res = await axios.post('http://localhost:5000/api/ai/chat', { query: newMsg.text });
      
      setMessages(prev => [...prev, { id: Date.now()+1, text: res.data.response, sender: 'ai' }]);
      setLoading(false);

    } catch (error) {
       console.error("System Communication Failed", error);
       setMessages(prev => [...prev, { id: Date.now()+1, text: 'I am currently unable to reach the neural gateway. Try again later.', sender: 'ai' }]);
       setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col font-poppins relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-accent/5 blur-3xl rounded-[3rem] -z-10 pointer-events-none"></div>

      <div className="flex items-center space-x-3 mb-6">
         <div className="p-3 bg-white/10 glass-card rounded-2xl relative">
            <Bot className="text-accent relative z-10" size={32} />
            <div className="absolute inset-0 bg-accent/20 blur-md rounded-2xl"></div>
         </div>
         <div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Virtual Assistant</h2>
            <p className="text-textMuted text-sm flex items-center">
               <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_rgba(74,222,128,1)] animate-pulse"></span>
               Online & Ready
            </p>
         </div>
      </div>

      <div className="flex-1 glass-card rounded-3xl p-6 flex flex-col overflow-hidden relative shadow-[0_0_30px_rgba(107,33,168,0.15)]">
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
           {messages.map((msg) => (
             <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ duration: 0.3 }}
                key={msg.id} 
                className={`flex items-start max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
             >
                <div className={`p-2 rounded-full shrink-0 flex items-center justify-center border ${msg.sender === 'user' ? 'ml-3 bg-secondary/20 border-secondary/50 text-secondary' : 'mr-3 bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(107,33,168,0.6)]'}`}>
                   {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-secondary/10 border-secondary/20 rounded-tr-sm text-white' : 'glass-card rounded-tl-sm text-textMain'}`}>
                   <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
             </motion.div>
           ))}
           {loading && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start max-w-[85%]">
                <div className="p-2 mr-3 bg-primary/20 border-primary/50 text-primary shadow-neon rounded-full"><Bot size={18} /></div>
                <div className="p-4 glass-card rounded-2xl rounded-tl-sm flex items-center space-x-2">
                   <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: '0ms'}}></div>
                   <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: '150ms'}}></div>
                   <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{animationDelay: '300ms'}}></div>
                </div>
             </motion.div>
           )}
        </div>

        <form onSubmit={sendMessage} className="mt-6 flex items-center relative">
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             className="w-full bg-background/50 glass-card border flex-1 border-white/20 text-white placeholder-textMuted rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-accent shadow-inner transition-colors"
             placeholder="Ask anything like 'Show my urgent tasks'..."
           />
           <button 
             type="submit" 
             disabled={!input.trim()}
             className="absolute right-2 p-3 bg-gradient-to-r from-primary to-accent rounded-full text-white shadow-neon hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
           >
             <Send size={18} className="ml-0.5" />
           </button>
        </form>
      </div>
    </div>
  );
}
