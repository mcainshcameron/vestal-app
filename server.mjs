import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

app.use(compression());
app.use(express.static(distPath, { extensions: ['html'] }));

/**
 * SPA fallback to index.html
 * Express 5 uses path-to-regexp v6 which no longer supports '*' as a path string.
 * Use a RegExp catch-all instead to avoid "Missing parameter name" errors.
 */
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
