const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./src/server/database.sqlite');

db.serialize(() => {
  db.run("UPDATE productos SET departamento = 'Bazar' WHERE departamento = 'Oficina' OR departamento IS NULL");
  db.run("UPDATE productos SET departamento = 'Tecnología' WHERE departamento = 'Laboratorio'");
  db.run("UPDATE usuarios SET departamento_enum = 'Bazar' WHERE departamento_enum = 'Oficina' OR departamento_enum IS NULL");
  db.run("UPDATE usuarios SET departamento_enum = 'Tecnología' WHERE departamento_enum = 'Laboratorio'");
  console.log("Database updated");
});
db.close();
