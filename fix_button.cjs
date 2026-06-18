const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
  /<button onClick=\{\(\) => setShowAdminLogin\(false\)\} className="absolute top-6 left-6 z-50 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">Volver al Portal Público<\/button>/,
  `<button onClick={() => setShowAdminLogin(false)} className="absolute top-6 left-6 md:top-8 md:left-8 z-50 px-5 py-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-sm font-medium shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg> Volver al Portal</button>`
);

fs.writeFileSync('src/App.tsx', c);
