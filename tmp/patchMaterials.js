const fs = require('fs');

function patchMaterials(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert states
  if (!content.includes('const [categoryFilter')) {
    content = content.replace(
      /const \[materials, setMaterials\] = useState\(\[\]\);/,
      `const [materials, setMaterials] = useState([]);\n  const [searchQuery, setSearchQuery] = useState('');\n  const [categoryFilter, setCategoryFilter] = useState('All');`
    );
  }

  // Insert logic
  if (!content.includes('const filteredMaterials')) {
    content = content.replace(
      "return (\n    <div className=\"space-y-6 font-poppins pb-10\">",
      `const subjects = ['All', ...new Set(materials.map(m => m.subject))];\n\n  const filteredMaterials = materials.filter(m => {\n     const matchCategory = categoryFilter === 'All' || m.subject === categoryFilter;\n     const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject.toLowerCase().includes(searchQuery.toLowerCase());\n     return matchCategory && matchSearch;\n  });\n\n  return (\n    <div className="space-y-6 font-poppins pb-10">`
    );
  }

  // Replace map
  content = content.replace(/\{materials\.map\(/g, '{filteredMaterials.map(');
  content = content.replace(/materials\.length === 0/g, 'filteredMaterials.length === 0');

  // Replace Header UI
  const matchDiv = /<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">[\s\S]*?<\/div>\s*<div className="grid/;
  
  const newHeader = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-textMain flex items-center">
             Study Materials <BookOpen className="ml-3 text-secondary" />
           </h2>
           <p className="text-textMuted text-sm mt-1">Cross-platform digital library for assigned curriculum content.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 text-textMuted" size={16} />
              <input type="text" placeholder="Search materials..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-textMain focus:border-secondary transition-colors" />
           </div>
           <div className="relative shrink-0">
              <Filter className="absolute left-3 top-2.5 text-textMuted" size={16} />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-9 pr-8 text-sm text-textMuted focus:border-secondary appearance-none cursor-pointer">
                 {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
           {isStaff && (
             <button onClick={() => setIsModalOpen(true)} className="btn-secondary flex items-center justify-center whitespace-nowrap bg-primary/20 text-textMain">
                <Plus size={18} className="mr-2"/> Upload
             </button>
           )}
        </div>
      </div>\n\n      <div className="grid`;

  if(content.match(matchDiv)) {
     content = content.replace(matchDiv, newHeader);
  }

  // Add Icons
  if(!content.includes(', Search, Filter')) {
     content = content.replace(
        "import { BookOpen, Link as LinkIcon, Download, Trash2, Plus, Server, User } from 'lucide-react';",
        "import { BookOpen, Link as LinkIcon, Download, Trash2, Plus, Server, User, Search, Filter } from 'lucide-react';"
     );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Materials patched!");
}

const fs = require('fs');
patchMaterials("d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Materials.jsx");
