import express from 'express';
import path from 'path';
import apiRouter from './src/server/api';
import newApiRouter from './src/server/new_api';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve API routes
app.use('/api', newApiRouter);
app.use('/api', apiRouter);

// Serve static files from the Vite build directory
const distPath = path.join(import.meta.dirname, 'dist');
app.use(express.static(distPath, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Fallback to index.html for SPA routing (React Router / dynamic tabs)
app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`S.I.D-CRM Production Server is running on port ${PORT}`);
});
