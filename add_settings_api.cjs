const fs = require('fs');
const content = fs.readFileSync('src/server/new_api.ts', 'utf8');
const lines = content.split('\n');

const codeToAdd = `
router.get('/settings/fiscal', async (req, res) => {
  const db = await getDb();
  try {
    const row = await db.get("SELECT value FROM settings WHERE id = 'fiscal'");
    res.json({ success: true, settings: row ? JSON.parse(row.value) : {} });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/settings/fiscal', async (req, res) => {
  const db = await getDb();
  try {
    const value = JSON.stringify(req.body);
    await db.run("INSERT OR REPLACE INTO settings (id, value) VALUES ('fiscal', ?)", [value]);
    res.json({ success: true, settings: req.body });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/settings/gemini-key', async (req, res) => {
  const db = await getDb();
  try {
    const row = await db.get("SELECT value FROM settings WHERE id = 'gemini-key'");
    res.json({ success: true, key: row ? row.value : '' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/settings/gemini-key', async (req, res) => {
  const db = await getDb();
  try {
    await db.run("INSERT OR REPLACE INTO settings (id, value) VALUES ('gemini-key', ?)", [req.body.key]);
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

`;

const exportIndex = lines.findIndex(l => l.includes('export default router;'));
lines.splice(exportIndex, 0, codeToAdd);
fs.writeFileSync('src/server/new_api.ts', lines.join('\n'));
