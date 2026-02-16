const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// IMPORTANT: Serve the 'public' folder as root
app.use(express.static(path.join(__dirname, 'public')));

// Persistent Folder Setup
const videoDir = path.join(__dirname, 'public', 'assets', 'videos');

if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, videoDir); // Absolute path prevents "missing folder" errors
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 } // Increased to 500MB
});

// API Routes
app.get('/api/videos', (req, res) => {
    fs.readdir(videoDir, (err, files) => {
        if (err) return res.status(500).json([]);
        // Filter out hidden files and return the list
        const videoFiles = files.filter(f => !f.startsWith('.'));
        res.json(videoFiles);
    });
});

app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No video uploaded" });
    res.json({ message: "Uploaded!", filename: req.file.filename });
});

app.delete('/api/videos/:name', (req, res) => {
    const filePath = path.join(videoDir, req.params.name);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: "Deleted" });
    } else {
        res.status(404).json({ error: "File not found" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 BitView Kids running at http://localhost:${PORT}`);
});
