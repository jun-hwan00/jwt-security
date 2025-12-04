const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 4000;
const SECRET_KEY = 'secret_key_for_vulnerable_demo';


const KAKAO_CLIENT_ID = '75488b61c393b0af86caaf9a94b182e9'; 
const KAKAO_REDIRECT_URI = 'http://localhost:5173/auth/callback';

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE users (id TEXT, password TEXT, name TEXT)");
    db.run("INSERT INTO users VALUES ('test', '1234', '김논문')");
    console.log(">> DB Initialized");
});

app.post('/api/auth/kakao', async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: "No code provided" });
    }

    try {
        const tokenResponse = await axios.post(
            'https://kauth.kakao.com/oauth/token',
            null,
            {
                params: {
                    grant_type: 'authorization_code',
                    client_id: KAKAO_CLIENT_ID,
                    redirect_uri: KAKAO_REDIRECT_URI,
                    code: code,
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                },
            }
        );

        const kakaoAccessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
            headers: {
                Authorization: `Bearer ${kakaoAccessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
        });

        const kakaoUser = userResponse.data;
        const nickname = kakaoUser.properties?.nickname || "KakaoUser";

        const serverToken = jwt.sign(
            { 
                id: kakaoUser.id, 
                nickname: nickname 
            },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        console.log(`[LOGIN SUCCESS] ${nickname}`);

        res.json({
            message: "Login Success",
            accessToken: serverToken,
            user: {
                nickname: nickname,
                profileImage: kakaoUser.properties?.profile_image
            }
        });

    } catch (error) {
        console.error("Kakao Login Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Login Failed" });
    }
});

app.post('/api/login', (req, res) => {
    const { id, password } = req.body;
    db.get("SELECT * FROM users WHERE id = ? AND password = ?", [id, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = jwt.sign({ id: row.id, name: row.name }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "Success", accessToken: token, user: { name: row.name } });
    });
});

app.post('/api/posts', (req, res) => {
    console.log("Post created:", req.body);
    res.json({ success: true, message: "Post Created" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});