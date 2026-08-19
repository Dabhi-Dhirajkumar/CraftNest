const fs = require('fs');

function addFilters(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add states
  if (!content.includes('const [priorityFilter, setPriorityFilter]')) {
    content = content.replace(
      "const [filter, setFilter] = useState('All');",
      "const [filter, setFilter] = useState('All');\n  const [priorityFilter, setPriorityFilter] = useState('All');\n  const [searchQuery, setSearchQuery] = useState('');"
    );
  }

  // Add icons to import
  if (!content.includes('Search, Filter')) {
    content = content.replace(
      "import { Plus, CheckCircle, Circle, AlertCircle, Sparkles, Trash2, Edit2 } from 'lucide-react';",
      "import { Plus, CheckCircle, Circle, AlertCircle, Sparkles, Trash2, Edit2, Search, Filter } from 'lucide-react';"
    );
  }

  // Update UI logic 
  // It handles Tasks filter logic
  if(filePath.includes('Tasks.jsx') && !content.includes('const matchSearch =')) {
     content = content.replace(
        "const filteredTasks = tasks.filter(t => filter === 'All' ? true : t.status === filter);",
        "const filteredTasks = tasks.filter(t => { const matchStatus = filter === 'All' ? true : t.status === filter; const matchPriority = priorityFilter === 'All' ? true : t.priority === priorityFilter; const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())); return matchStatus && matchPriority && matchSearch; });"
     );

     // Replace header (We will just use regex to match the inner div)
     const matchDiv = /<div className="flex items-center justify-between mb-6 border-b border-white\/10 pb-4">[\s\S]*?<\/div>\s*<\/div>/;
     
     const newHeader = `<div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 border-b border-white/10 pb-4 gap-4">
            <h3 className="font-semibold text-lg flex items-center shrink-0"><CheckCircle className="mr-2 text-primary" size={20} /> Your Tasks</h3>
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
                  <input type="text" placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:border-primary focus:outline-none focus:bg-white/10 transition-colors" />
               </div>
               <div className="relative shrink-0">
                  <Filter className="absolute left-3 top-2.5 text-textMuted" size={16} />
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-textMuted focus:border-primary focus:outline-none cursor-pointer appearance-none">
                     <option value="All">All Priorities</option>
                     <option value="High">High Priority</option>
                     <option value="Medium">Medium Priority</option>
                     <option value="Low">Low Priority</option>
                  </select>
               </div>
               <div className="flex space-x-1 shrink-0 p-1 bg-white/5 rounded-xl border border-white/10">
                  {['All', 'Pending', 'Completed'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={\`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 \${filter === f ? 'bg-primary/20 text-white shadow-sm' : 'text-textMuted hover:bg-white/10'}\`}>
                      {f}
                    </button>
                  ))}
               </div>
            </div>
         </div>`;
     
     content = content.replace(matchDiv, newHeader);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Patched!");
}

addFilters("d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Tasks.jsx");
