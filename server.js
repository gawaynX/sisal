const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const DATA_FILE = 'markers.json';

// Lade Marker-Daten
app.get('/markers', (req, res) => {
  fs.readFile(DATA_FILE, (err, data) => {
    if (err) return res.json([]);
    res.json(JSON.parse(data));
  });
});

// Speichere neuen Marker
app.post('/upload', upload.single('image'), (req, res) => {
  const { lat, lng, castrated } = req.body;
  const markers = fs.existsSync(DATA_FILE) ? JSON.parse(fs.readFileSync(DATA_FILE)) : [];

  const newMarker = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    imageUrl: req.file ? '/uploads/' + req.file.filename : null,
    castrated: castrated === 'true'
  };

  markers.push(newMarker);
  fs.writeFileSync(DATA_FILE, JSON.stringify(markers, null, 2));
  res.status(200).json({ success: true });
});

app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));