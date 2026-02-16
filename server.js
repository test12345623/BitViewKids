const express = require('express');const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Setup Video Directory
const videoDir = path.join(__dirname, 'public/assets/videos');
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

// 2. Multer Configuration (300MB)
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/assets/videos/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 300 * 1024 * 1024 } 
});

// 3. API Routes
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    let role = (username.toLowerCase() === "bitviewofficial") ? "owner" : "user";
    res.json({ message: "Welcome!", username, role });
});

app.get('/api/videos', (req, res) => {
    fs.readdir(videoDir, (err, files) => {
        if (err) return res.status(500).json({ error: "Folder error" });
        res.json(files.filter(f => !f.startsWith('.')));
    });
});

app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No video" });
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

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
