const fs = require('fs');
let content = fs.readFileSync('d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Feedback.jsx', 'utf8');

if (!content.includes('const [searchQuery')) {
  content = content.replace(
    '  const [feedbacks, setFeedbacks] = useState([]);',
    '  const [feedbacks, setFeedbacks] = useState([]);\n  const [searchQuery, setSearchQuery] = useState(\'\');'
  );
}

if (!content.includes('placeholder="Search feedback..."')) {
  const matchOldAdminHeader = /<h3 className="text-2xl font-bold mb-6 text-white border-b border-white\/10 pb-4">Admin: User Feedbacks<\/h3>\s*<div className="space-y-4">/;
  const newAdminHeader = `<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-bold text-white">Admin: User Feedbacks</h3>
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
               <input type="text" placeholder="Search feedback..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-accent focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="space-y-4">`;
  
  content = content.replace(matchOldAdminHeader, newAdminHeader);
}

if (!content.includes('f.subject.toLowerCase()')) {
  content = content.replace(
    '{feedbacks.length === 0 ? <p className="text-textMuted">No feedback received yet.</p> : feedbacks.map(f => (',
    '{feedbacks.length === 0 ? <p className="text-textMuted">No feedback received yet.</p> : feedbacks.filter(f => f.subject.toLowerCase().includes(searchQuery.toLowerCase()) || f.message.toLowerCase().includes(searchQuery.toLowerCase())).map(f => ('
  );
}

fs.writeFileSync('d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Feedback.jsx', content, 'utf8');
