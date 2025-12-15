const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const helmet = require('helmet');  
const cookieParser = require('cookie-parser');  

const app = express();
const PORT = 4000;
const SECRET_KEY = 'secret_key_for_secure_demo';

const KAKAO_CLIENT_ID = '75488b61c393b0af86caaf9a94b182e9'; 
const KAKAO_REDIRECT_URI = 'http://localhost:5173/auth/callback';

app.use(express.json());
app.use(cookieParser());  


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,  
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "http://localhost:4000"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
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

    console.log(">> 🔒 Secure DB Initialized");
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

       
        res.cookie('access_token', serverToken, {
            httpOnly: true, 
            secure: false,  
            sameSite: 'lax', 
            maxAge: 3600000  
        });

        console.log(`✅ [SECURE LOGIN] ${nickname} - 토큰은 HttpOnly 쿠키로 전송됨`);

        
        res.json({
            message: "Login Success",
            user: {
                nickname: nickname,
                profileImage: kakaoUser.properties?.profile_image,
                id: kakaoUser.id
            }
        });

    } catch (error) {
        console.error("Kakao Login Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Login Failed" });
    }
});


const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token; 

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};


app.get('/api/me', authenticateToken, (req, res) => {
    db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, row) => {
        if (err || !row) {
            return res.json({
                id: req.user.id,
                nickname: req.user.nickname,
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
});


app.post('/api/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });
    console.log("✅ [LOGOUT] 쿠키 삭제됨");
    res.json({ message: "Logout successful" });
});

app.post('/api/login', (req, res) => {
    const { id, password } = req.body;
    db.get("SELECT * FROM users WHERE id = ? AND password = ?", [id, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = jwt.sign({ id: row.id, name: row.name }, SECRET_KEY, { expiresIn: '1h' });
        
        
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000
        });
        
        res.json({ 
            message: "Success", 
            user: { name: row.name } 
        });
    });
});

app.get('/api/posts', (req, res) => {
    db.all("SELECT * FROM posts ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ posts: rows });
    });
});

app.post('/api/posts', authenticateToken, (req, res) => {
    const { author, authorImage, content, userId } = req.body;

    
    const sanitizedContent = content
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    const timestamp = '방금 전';

    db.run(
        `INSERT INTO posts (author, authorImage, content, likes, comments, timestamp, userId)
         VALUES (?, ?, ?, 0, 0, ?, ?)`,
        [author, authorImage, sanitizedContent, timestamp, userId],
        function(err) {
            if (err) {
                console.error("Post creation error:", err);
                return res.status(500).json({ error: err.message });
            }

            db.get("SELECT * FROM posts WHERE id = ?", [this.lastID], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });

                console.log("✅ [SECURE POST CREATED]", row.content.substring(0, 50));
                res.json({ success: true, post: row });
            });
        }
    );
});

app.patch('/api/profile', authenticateToken, (req, res) => {
    const { nickname, statusMessage, profileImage } = req.body;

    console.log(`\n========================================`);
    console.log(`🔒 [보안 프로필 변경 감지]`);
    console.log(`========================================`);
    console.log(`사용자 ID: ${req.user.id}`);
    console.log(`기존 닉네임: ${req.user.nickname}`);
    console.log(`변경 닉네임: ${nickname}`);
    console.log(`변경 프로필 이미지: ${profileImage}`);
    console.log(`변경 상태 메시지: ${statusMessage}`);
    console.log(`========================================\n`);

    db.run(
        `UPDATE users SET nickname = ?, profileImage = ? WHERE id = ?`,
        [nickname || req.user.nickname, profileImage, req.user.id],
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
            id: req.user.id,
            nickname: nickname || req.user.nickname,
            statusMessage: statusMessage,
            profileImage: profileImage
        }
    });
});

app.listen(PORT, () => {
    console.log(`🔒 Secure Server running on http://localhost:${PORT}`);
    console.log(`✅ HttpOnly Cookie 활성화`);
    console.log(`✅ CSP 헤더 적용됨`);
    console.log(`✅ CORS credentials 설정 완료`);
});