const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the "public" folder as the website
app.use(express.static(path.join(__dirname, 'public')));

// --- DATABASE SIMULATION ---
// In a real app, this would be MongoDB. For now, it lives in memory.
const userVault = []; 

// --- ROUTES ---

// 1. Sign Up (Secure Hash)
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check if user already exists
        if (userVault.find(u => u.username === username)) {
            return res.status(400).json({ error: "Username taken!" });
        }

        // Hash the password (Hard to Hack)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        userVault.push({ username, password: hashedPassword });
        console.log(`New User Registered: ${username}`);
        
        res.status(201).json({ message: "Account created! Please log in." });
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

// 2. Login (Verify Hash)
app.post('/api/login', async (req, res) => {
    const user = userVault.find(u => u.username === req.body.username);
    if (!user) return res.status(400).json({ error: "User not found" });

    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            res.json({ message: "Success", username: user.username });
        } else {
            res.status(403).json({ error: "Wrong password" });
        }
    } catch {
        res.status(500).json({ error: "Server error" });
    }
});

// 3. Upload Simulation (The "BitView" Part)
app.post('/api/upload', (req, res) => {
    // In a real app, we would use 'multer' here to save the file.
    // For this prototype, we just say "Yes, we got it."
    console.log("Video upload request received.");
    res.json({ message: "Video uploaded successfully to BitView Kids!" });
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BitView Kids server running on port ${PORT}`);
});