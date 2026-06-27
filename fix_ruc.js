import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
async function run() {
  const db = await open({ filename: 'sid_database.sqlite', driver: sqlite3.Database });
  await db.exec("CREATE TABLE IF NOT EXISTS ruc_cache (ruc TEXT PRIMARY KEY, data TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);");
  console.log("Table created.");
}
run();
