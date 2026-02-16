const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const videoDir = path.join(__dirname, 'public/assets/videos');
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

// MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/assets/videos/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 300 * 1024 * 1024 } 
});

// NEW: Route to list all videos for the Channel
app.get('/api/videos', (req, res) => {
    fs.readdir(videoDir, (err, files) => {
        if (err) return res.status(500).json({ error: "Cant find videos" });
        // Return list of video filenames
        res.json(files.filter(f => f.endsWith('.mp4') || f.endsWith('.mov')));
    });
});

app.post('/api/login', (req, res) => {
    const { username } = req.body;
    let role = (username.toLowerCase() === "bitviewofficial") ? "owner" : "user";
    res.json({ message: `Welcome back, ${username}!`, role: role });
});

app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file" });
    res.json({ message: "Success! Video uploaded.", filename: req.file.filename });
});

app.listen(PORT, () => console.log(`BitView Kids running on http://localhost:${PORT}`));
