const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer'); // Run 'npm install multer' first!

const app = express();
const PORT = process.env.PORT || 3000;

// 1. MIDDLEWARE
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 2. ENSURE FOLDERS EXIST
// This creates the 'videos' folder if it doesn't exist so the server doesn't crash
const videoDir = path.join(__dirname, 'public/assets/videos');
if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
}

// 3. MULTER STORAGE CONFIG (Handles 300MB)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/assets/videos/');
    },
    filename: (req, file, cb) => {
        // Renames file to "timestamp-originalName.mp4" to avoid name double-ups
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 300 * 1024 * 1024 } // 300MB Hard Limit
});

// 4. API ROUTES

// Login Mock (Replace with your actual BCrypt logic)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Logics go here...
    res.json({ message: `Welcome back, ${username}!` });
});

// Signup Mock
app.post('/api/signup', (req, res) => {
    const { username, password } = req.body;
    // Logics go here...
    res.json({ message: "Account created!" });
});

// THE VIDEO UPLOAD ROUTE
// 'video' matches the formData.append('video', file) in your HTML
app.post('/api/upload', upload.single('video'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No video file was uploaded." });
    }

    console.log(`Video Received: ${req.file.filename}`);
    
    res.json({ 
        message: "Success! Video uploaded to BitView Kids.",
        filePath: `/assets/videos/${req.file.filename}` 
    });
});

// 5. START SERVER
app.listen(PORT, () => {
    console.log(`BitView Kids Server running on http://localhost:${PORT}`);
});
