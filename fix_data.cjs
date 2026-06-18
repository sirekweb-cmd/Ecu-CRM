const fs = require('fs');
let c = fs.readFileSync('src/data.ts', 'utf8');

c = c.replace(/import \{ Client, ActivityLog, User, Project, Invoice \} from '\.\/types';/g, "import { Client, ActivityLog, User, Invoice } from './types';");
c = c.replace(/status: 'initial'/g, "status: 'nuevo lead'");
c = c.replace(/status: 'development'/g, "status: 'en desarrollo'");
c = c.replace(/status: 'billed'/g, "status: 'cobrado'");
c = c.replace(/status: 'finished'/g, "status: 'finalizado'");

// Remove INITIAL_PROJECTS completely.
const projectsStart = c.indexOf('export const INITIAL_PROJECTS');
const invoicesStart = c.indexOf('export const INITIAL_INVOICES');
if (projectsStart !== -1 && invoicesStart !== -1) {
    c = c.substring(0, projectsStart) + c.substring(invoicesStart);
}

// Add invoice missing fields
c = c.replace(/subtotal: ([\d.]+),/g, "subtotal: $1,\n    discount: 0,\n    retenciones: 0,\n    type: 'invoice',");

fs.writeFileSync('src/data.ts', c);
