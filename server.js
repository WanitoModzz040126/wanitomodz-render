const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Lahat ng mahahalagang link ay nasa backend (hindi nakikita sa frontend source code)
const config = {
  downloadUrl: 'https://github.com/WanitoModz040126/MLBB-SKIN-PATCHER/releases/download/untagged-d985482180c39244607b/WanitoModz.Patcher.apk',
  telegram: 'https://t.me/wanitomodzz',
  telegramChannel: 'https://t.me/wanitomodzz_channel',
  youtube: 'https://youtube.com/@wanitomodzz',
  facebook: '#',
  instagram: '#',
  audioUrl: 'https://github.com/WanitoModz040126/Website/raw/refs/heads/main/ssstik.io_1780353436563.mp3',
  tutorialShizukuUrl: 'https://www.dropbox.com/s/xxxxxxxxx/tutorial_shizuku.mp4?dl=1',
  tutorialPatchUrl: 'https://www.dropbox.com/s/xxxxxxxxx/tutorial_patch.mp4?dl=1'
};

// Rate limiting para anti‑DDOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

// Security headers gamit ang helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
  xPoweredBy: false,
}));
app.use(cors());
app.use(limiter);
app.use(express.json());

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
}));

// Endpoint para ibigay ang configuration sa frontend
app.get('/api/config', (req, res) => {
  res.json(config);
});

// Lahat ng ibang routes ay mapupunta sa index.html (SPA style)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`WanitoModz Tool — server running on http://localhost:${PORT}`);
});