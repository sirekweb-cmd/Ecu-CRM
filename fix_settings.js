import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
async function run() {
  const db = await open({ filename: 'sid_database.sqlite', driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  console.log("Settings table created.");
}
run();
