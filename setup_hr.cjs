const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./sid_database.sqlite');

db.serialize(() => {
  db.run('ALTER TABLE usuarios ADD COLUMN sueldo_base DECIMAL(10,2) DEFAULT 0', (err) => {
    if (err) console.log('usuarios alter error:', err.message);
    else console.log('Added sueldo_base to usuarios');
  });

  db.run(`CREATE TABLE IF NOT EXISTS nomina_mensual (
    id VARCHAR(255) PRIMARY KEY,
    mes_anio VARCHAR(50) NOT NULL,
    total_pagado DECIMAL(10,2) NOT NULL,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'Pagado'
  )`, (err) => {
    if (err) console.log('nomina create error:', err.message);
    else console.log('Created nomina_mensual table');
  });
});
