const db = require('better-sqlite3')('database.sqlite');
const fs = require('fs');
db.exec(fs.readFileSync('add_cotizaciones_table.sql', 'utf-8'));
console.log('Cotizaciones table created');
