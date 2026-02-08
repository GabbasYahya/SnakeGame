const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CSV_PATH = path.join(__dirname, 'scores.csv');

function readScores() {
  if (!fs.existsSync(CSV_PATH)) return {};
  const data = fs.readFileSync(CSV_PATH, 'utf8').trim();
  if (!data) return {};
  const lines = data.split(/\r?\n/);
  const map = {};
  for (let i = 1; i < lines.length; i++) { // skip header
    const line = lines[i];
    if (!line) continue;
    // simple CSV split (names may be quoted)
    const parts = line.split(',');
    const name = parts[0].replace(/^"|"$/g, '');
    const score = parseInt(parts[1], 10) || 0;
    map[name] = score;
  }
  return map;
}

function writeScores(map) {
  const lines = ['name,score'];
  for (const n of Object.keys(map)) {
    const safe = String(n).includes(',') || String(n).includes('"') || String(n).includes('\n')
      ? '"' + String(n).replace(/"/g, '""') + '"'
      : n;
    lines.push(`${safe},${map[n]}`);
  }
  fs.writeFileSync(CSV_PATH, lines.join('\n'), 'utf8');
}

app.post('/api/scores', (req, res) => {
  const { name, score } = req.body || {};
  if (!name || typeof score !== 'number') return res.status(400).json({ error: 'Invalid payload' });
  const scores = readScores();
  const prev = scores[name] || 0;
  if (score > prev) scores[name] = score;
  writeScores(scores);
  return res.json({ ok: true });
});

app.get('/api/scores', (req, res) => {
  if (!fs.existsSync(CSV_PATH)) return res.status(404).send('No scores yet');
  res.sendFile(CSV_PATH);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Score server listening on ${PORT}`));
