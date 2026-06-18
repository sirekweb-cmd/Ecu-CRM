const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/Project, /g, '');
c = c.replace(/status: 'initial'/g, "status: 'nuevo lead'");
c = c.replace(/status: 'development'/g, "status: 'en desarrollo'");
c = c.replace(/status: 'billed'/g, "status: 'cobrado'");
c = c.replace(/status: 'finished'/g, "status: 'finalizado'");

c = c.replace(/status === 'initial'/g, "status === 'nuevo lead'");
c = c.replace(/status === 'development'/g, "status === 'en desarrollo'");
c = c.replace(/status === 'billed'/g, "status === 'cobrado'");
c = c.replace(/status === 'finished'/g, "status === 'finalizado'");

c = c.replace(/'proyectos'/g, "'dashboard'");

c = c.replace(/subtotal,\n\s*taxRate/g, "subtotal,\n      discount: 0,\n      retenciones: 0,\n      type: 'invoice',\n      taxRate");

fs.writeFileSync('src/App.tsx', c);
