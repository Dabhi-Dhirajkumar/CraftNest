const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Users.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Tasks.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Settings.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Schedule.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Profile.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Notices.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Materials.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/FocusTimer.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Feedback.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Dashboard.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/Courses.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/auth/VerifyOtp.jsx",
  "d:/React Project/Smart Student Productivity Hub/campus-companion/frontend/src/pages/auth/ResetPassword.jsx"
];

for (const file of filesToUpdate) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Replace alert
  const alertRegex = /alert\((.*?)\)/g;
  if (alertRegex.test(content)) {
    content = content.replace(alertRegex, (match, msg) => {
      msg = msg.trim();
      let type = 'success';
      // Identify error-like messages
      if (msg.includes('Fail') || msg.includes('fail') || msg.includes('Not ') || msg.includes('err.')) {
        type = 'error';
      }
      return `toast.${type}(${msg})`;
    });
    modified = true;
  }

  if (modified) {
    // Add import if not present
    if (!content.includes("import toast")) {
      // Find the last import statement
      const importRegex = /import.*?;?\\n/g;
      let lastIndex = 0;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        lastIndex = match.index + match[0].length;
      }
      
      const p1 = content.slice(0, lastIndex);
      const p2 = content.slice(lastIndex);
      content = p1 + "import toast from 'react-hot-toast';\n" + p2;
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${path.basename(file)}`);
  }
}
