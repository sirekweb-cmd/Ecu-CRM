import express from 'express';
import path from 'path';
import apiRouter from './src/server/api';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve API routes
app.use('/api', apiRouter);

// Serve static files from the Vite build directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing (React Router / dynamic tabs)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ECU-CRM Production Server is running on port ${PORT}`);
});
