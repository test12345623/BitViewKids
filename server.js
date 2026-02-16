const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. SAFE FOLDER CREATION
const assetsDir = path.join(__dirname, 'public/assets');
const videoDir = path.join(__dirname, 'public/assets/videos');

// Ensure public/assets/videos exists so Multer doesn't error out
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

// 2. MULTER CONFIG
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/videos/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s/g, '_');
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 300 * 1024 * 1024 } // 300MB
});

// 3. ROUTES
app.post('/api/login', (req, res) => {
    try {
        const { username } = req.body;
        let role = (username && username.toLowerCase() === "bitviewofficial") ? "owner" : "user";
        res.json({ message: "Welcome!", username, role });
    } catch (e) {
        res.status(500).json({ error: "Login failed" });
    }
});

app.get('/api/videos', (req, res) => {
    fs.readdir(videoDir, (err, files) => {
        if (err) return res.json([]);
        res.json(files.filter(f => !f.startsWith('.')));
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
        res.status(404).send("Not found");
    }
});

// 4. ERROR HANDLING (Prevents Status 1 Crashes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`🚀 BitView Kids is running at http://localhost:${PORT}`);
}).on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is busy. Try closing other terminal windows!`);
    } else {
        console.log(e);
    }
});
