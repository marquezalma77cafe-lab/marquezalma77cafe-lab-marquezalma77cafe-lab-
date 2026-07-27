/**
 * Servidor de la plataforma de análisis de URLs de redes sociales.
 *
 * - Sirve la interfaz web estática desde /public.
 * - Expone una API JSON en POST /api/analyze y GET /api/analyze?url=...
 *
 * El análisis es puro (sin salidas a red), así que la API funciona en
 * cualquier entorno, incluso sin conectividad externa.
 */

const path = require('path');
const express = require('express');
const analyzer = require('./src/analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname, 'public')));
// El navegador carga el motor de análisis compartido desde /src.
app.use('/src', express.static(path.join(__dirname, 'src')));

function handleAnalyze(rawUrl, res) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return res.status(400).json({ ok: false, error: 'Falta el parámetro "url".' });
  }
  const result = analyzer.analyze(rawUrl);
  return res.status(result.ok ? 200 : 422).json(result);
}

app.get('/api/analyze', (req, res) => {
  handleAnalyze(req.query.url, res);
});

app.post('/api/analyze', (req, res) => {
  handleAnalyze(req.body && req.body.url, res);
});

// Lista de plataformas soportadas (útil para clientes de la API).
app.get('/api/platforms', (req, res) => {
  res.json({
    ok: true,
    platforms: analyzer.PLATFORMS.map((p) => ({ id: p.id, name: p.name, hosts: p.hosts })),
  });
});

app.get('/api/health', (req, res) => res.json({ ok: true, status: 'up' }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Analizador de URLs escuchando en http://localhost:${PORT}`);
  });
}

module.exports = app;
