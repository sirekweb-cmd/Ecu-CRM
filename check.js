import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
async function run() {
  const db = await open({ filename: 'sid_database.sqlite', driver: sqlite3.Database });
  const rows = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log(rows);
}
run();
