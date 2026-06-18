import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./sid_database.sqlite');

db.serialize(() => {
  db.run("UPDATE productos SET departamento = 'Bazar' WHERE departamento = 'Oficina'");
  db.run("UPDATE productos SET departamento = 'Bazar' WHERE departamento IS NULL");
  db.run("UPDATE productos SET departamento = 'Bazar' WHERE departamento = ''");
  db.run("UPDATE productos SET departamento = 'Tecnología' WHERE departamento = 'Laboratorio'");
  db.run("UPDATE usuarios SET departamento_enum = 'Bazar' WHERE departamento_enum = 'Oficina'");
  db.run("UPDATE usuarios SET departamento_enum = 'Tecnología' WHERE departamento_enum = 'Laboratorio'");
  console.log("Database departments reverted successfully.");
});
db.close();
