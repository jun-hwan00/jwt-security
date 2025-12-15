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
    db.run("CREATE TABLE users (id TEXT, password TEXT, name TEXT, nickname TEXT, profileImage TEXT)");
    db.run("INSERT INTO users VALUES ('test', '1234', '김논문', '김논문', NULL)");

    db.run(`CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT,
        authorImage TEXT,
        content TEXT,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        timestamp TEXT,
        userId TEXT
    )`);

    db.run(`INSERT INTO posts (author, authorImage, content, likes, comments, timestamp, userId)
            VALUES ('테스트유저1', 'https://via.placeholder.com/40', '게시글 test', 5, 2, '1시간 전', 'user1')`);
    db.run(`INSERT INTO posts (author, authorImage, content, likes, comments, timestamp, userId)
            VALUES ('테스트유저2', 'https://via.placeholder.com/40', '만들기 잼', 12, 4, '3시간 전', 'user2')`);

    console.log(">> DB Initialized (users + posts)");
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

app.get('/api/posts', (req, res) => {
    db.all("SELECT * FROM posts ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ posts: rows });
    });
});

app.post('/api/posts', (req, res) => {
    const { author, authorImage, content, userId } = req.body;

    const timestamp = '방금 전';

    db.run(
        `INSERT INTO posts (author, authorImage, content, likes, comments, timestamp, userId)
         VALUES (?, ?, ?, 0, 0, ?, ?)`,
        [author, authorImage, content, timestamp, userId],
        function(err) {
            if (err) {
                console.error("Post creation error:", err);
                return res.status(500).json({ error: err.message });
            }

            db.get("SELECT * FROM posts WHERE id = ?", [this.lastID], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });

                console.log("[POST CREATED]", row.content.substring(0, 50));
                res.json({ success: true, post: row });
            });
        }
    );
});

app.patch('/api/profile', (req, res) => {
    const { nickname, statusMessage, profileImage } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        console.log(`\n========================================`);
        console.log(`🔓 [프로필 변경 감지!]`);
        console.log(`========================================`);
        console.log(`사용자 ID: ${decoded.id}`);
        console.log(`기존 닉네임: ${decoded.nickname || decoded.name}`);
        console.log(`변경 닉네임: ${nickname}`);
        console.log(`변경 프로필 이미지: ${profileImage}`);
        console.log(`변경 상태 메시지: ${statusMessage}`);
        console.log(`========================================\n`);

     
        db.run(
            `UPDATE users SET nickname = ?, profileImage = ? WHERE id = ?`,
            [nickname || decoded.nickname, profileImage, decoded.id],
            function(err) {
                if (err) {
                    console.error("Profile update error:", err);
                }
            }
        );

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: decoded.id,
                nickname: nickname || decoded.nickname,
                statusMessage: statusMessage,
                profileImage: profileImage
            }
        });
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ message: "Invalid token" });
    }
});


app.get('/api/me', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

 
        db.get("SELECT * FROM users WHERE id = ?", [decoded.id], (err, row) => {
            if (err || !row) {
                return res.json({
                    id: decoded.id,
                    nickname: decoded.nickname || decoded.name,
                    profileImage: null
                });
            }

            res.json({
                id: row.id,
                nickname: row.nickname || row.name,
                profileImage: row.profileImage,
                name: row.name
            });
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});