const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/activeTab ===\s*\n\s*\?/g, 'false\n                    ?');
c = c.replace(/activeTab !== && activeTab !== 'facturacion'/g, "activeTab !== 'facturacion'");
c = c.replace(/activeTab === && \(/g, "false && (");
c = c.replace(/activeTab === \? 'text-indigo-600 font-bold' : 'text-slate-400'/g, "false ? 'text-indigo-600 font-bold' : 'text-slate-400'");

fs.writeFileSync('src/App.tsx', c);
