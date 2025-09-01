const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = 3000;
const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

// Configure CORS to allow requests from your frontend
const corsOptions = {
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:3000"], // Adjust if needed
    //origin: ["http://127.0.0.1:5500", "http://localhost:5500","http://localhost:3000"] ,// Adjust if needed
    credentials: true,                // Allow cookies
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, 
        httpOnly: true, 
        sameSite: 'lax',
        domain: "127.0.0.1",  // Explicitly set to 127.0.0.1
        path: '/'
    }
}));


// app.use(session({
//     secret: 'supersecretkey', 
//     resave: false,
//     saveUninitialized: false,
//     cookie: { secure: false, httpOnly: true, sameSite: 'lax' , path: '/' }
// }));
// res.cookie('sessionId', session, {
//     httpOnly: true,   // Ensures security
//     secure: false,    // Set to true in production (https)
//     sameSite: 'Lax',  // Ensures cookies are sent correctly
//     path: '/'         // Ensures cookie is available everywhere
// });


// PostgreSQL Connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// ==========================
// Rumor Topics Endpoints
// ==========================

// GET /rumors - Retrieve all rumor topics
app.get('/rumors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM rumors ORDER BY created_at DESC');
        res.json({ rumors: result.rows });
    } catch (error) {
        console.error("Error fetching rumors:", error);
        res.status(500).json({ error: "Failed to fetch rumors" });
    }
});

// POST /rumors - Create a new rumor topic (admin only)
app.post('/rumors', async (req, res) => {
    if (!req.session.admin) return res.status(403).json({ error: "Unauthorized" });
    const { title, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO rumors (title, description) VALUES ($1, $2) RETURNING *',
            [title, description]
        );
        res.json({ message: "Rumor created successfully", rumor: result.rows[0] });
    } catch (error) {
        console.error("Error creating rumor:", error);
        res.status(500).json({ error: "Failed to create rumor" });
    }
});

// ==========================
// News Endpoints
// ==========================

// GET /news - Retrieve news articles (combining API-fetched and manual news)
// Optionally filter by a rumor (using rumor_id) or a search query (using query param)
app.get('/news', async (req, res) => {
    try {
        let apiNews = [];
        const searchQuery = req.query.query || "";
        
        // If a search query is provided, use it for API search; otherwise, get top headlines.
        if (searchQuery) {
            const apiResponse = await axios.get(
                `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&apikey=${GNEWS_API_KEY}`
            );
            apiNews = apiResponse.data.articles;
        } else {
            const apiResponse = await axios.get(
                `https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=us&apikey=${GNEWS_API_KEY}`
            );
            apiNews = apiResponse.data.articles;
        }
        
        // For manually added news, check if a rumor_id filter is provided
        let manualNewsQuery = 'SELECT * FROM news';
        const params = [];
        if (req.query.rumor_id) {
            manualNewsQuery += ' WHERE rumor_id = $1';
            params.push(req.query.rumor_id);
        }
        manualNewsQuery += ' ORDER BY id DESC';
        const dbResult = await pool.query(manualNewsQuery, params);
        const manualNews = dbResult.rows;
        
        // Combine manual and API news
        const combinedNews = [...manualNews, ...apiNews];
        res.json({ articles: combinedNews });
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

// POST /add-news - Add a news article (admin only), including rumor_id
app.post('/add-news', async (req, res) => {
    if (!req.session.admin) return res.status(403).json({ error: 'Unauthorized' });
    const { title, source, description, image_url, article_url, rumor_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO news (title, source, description, image_url, article_url, rumor_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [title, source, description, image_url, article_url, rumor_id]
        );
        res.json({ message: 'News added successfully' });
    } catch (error) {
        console.error("Error adding news:", error);
        res.status(500).json({ error: "Failed to add news" });
    }
});

// ==========================
// Authentication Endpoints
// ==========================

// POST /register-admin - Register a new admin (run once)
app.post('/register-admin', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO admins (username, password) VALUES ($1, $2)',
            [username, hashedPassword]
        );
        res.json({ message: 'Admin registered successfully' });
    } catch (error) {.
        console.error("Error registering admin:", error);
        res.status(500).json({ error: "Failed to register admin" });
    }
});

// POST /login - Admin login
// app.post('/login', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
//         if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
//         const admin = result.rows[0];
//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

//         req.session.admin = username;
//         req.session.user = username;
//         res.cookie('sessionID', req.sessionID, { httpOnly: true, secure: false, sameSite: "lax" });
//         return res.json({ message: 'Login successful' });
//     } catch (error) {
//         console.error("Login error:", error);
//         res.status(500).json({ error: "Login failed" });
//     }
// });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const admin = result.rows[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        // Set session variables
        req.session.admin = username;
        req.session.user = username;

        // Do not explicitly set res.cookie here—express-session will do that.
        return res.json({ message: 'Login successful' });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ error: "Login failed" });
    }
});



// POST /logout - Admin logout
app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

// GET /is-admin - Check if user is admin
app.get('/is-admin', (req, res) => {
    res.json({ isAdmin: !!req.session.admin });
});

// GET /check-auth - Check if user is authenticated
// app.get("/check-auth", (req, res) => {
//     if (req.session.user) {
//         res.json({ isAuthenticated: true });
//     } else {
//         res.json({ isAuthenticated: false });
//     }
// });
app.get('/check-auth', (req, res) => {
    console.log('Session:', req.session);  // Debugging
    if (req.session && req.session.user) {
        res.json({ isAdmin: req.session.user.isAdmin });
    } else {
        res.json({ isAdmin: false });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});