const fs = require('fs');

const liveTimerCode = `
const LiveTimer = ({ createdAt }) => {
  const [elapsed, setElapsed] = React.useState('');

  React.useEffect(() => {
    if (!createdAt) return;
    const start = new Date(createdAt).getTime();
    
    const update = () => {
      const diff = Date.now() - start;
      if (diff < 0) return setElapsed('Just joined');
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      let str = '';
      if (d > 0) str += \`\${d}d \`;
      str += \`\${h}h \${m}m \${s}s\`;
      setElapsed(str);
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return <span className="text-[10px] text-accent mt-0.5 tracking-wider font-mono flex items-center"><Activity size={10} className="mr-1 inline animate-pulse"/>{elapsed}</span>;
};
`;

let content = fs.readFileSync('d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/components/Layout.jsx', 'utf8');

if (!content.includes('LiveTimer')) {
  // Add component definition
  content = content.replace('export default function Layout', liveTimerCode + '\nexport default function Layout');

  // Replace layout user section
  const targetHTML = `{sidebarOpen && (
                 <div className="ml-3 truncate">
                   <p className="text-sm font-semibold text-white">{user?.name || 'Loading...'}</p>
                   <p className="text-xs text-textMuted truncate">{user?.role || 'Guest'}</p>
                 </div>
               )}`;

  const replacedHTML = `{sidebarOpen && (
                 <div className="ml-3 truncate flex flex-col justify-center">
                   <p className="text-sm font-semibold text-white truncate leading-tight">{user?.name || 'Loading...'}</p>
                   <div className="flex items-center space-x-2">
                     <p className="text-xs text-textMuted truncate">{user?.role || 'Guest'}</p>
                   </div>
                   {user?.created_at && <LiveTimer createdAt={user.created_at} />}
                 </div>
               )}`;
               
  content = content.replace(targetHTML, replacedHTML);

  fs.writeFileSync('d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/components/Layout.jsx', content, 'utf8');
}
