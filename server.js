const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. MIDDLEWARE
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. ENSURE FOLDERS EXIST
const videoDir = path.join(__dirname, 'public/assets/videos');
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

// 3. MULTER STORAGE CONFIG (300MB Limit)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/videos/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 300 * 1024 * 1024 } 
});

// 4. API ROUTES

// Login with Owner Privileges Check
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Determine Role
    let role = "user";
    if (username.toLowerCase() === "bitviewofficial") {
        role = "owner";
    }

    res.json({ 
        message: `Welcome back, ${username}!`,
        username: username,
        role: role
    });
});

app.post('/api/signup', (req, res) => {
    const { username } = req.body;
    res.json({ message: "Account created! Welcome to the club." });
});

// Video Upload Route
app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No video file was uploaded." });
    }
    res.json({ 
        message: "Success! Video uploaded to your channel.",
        filePath: `/assets/videos/${req.file.filename}` 
    });
});

app.listen(PORT, () => {
    console.log(`BitView Kids Server running on http://localhost:${PORT}`);
});
