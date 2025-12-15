// 카카오 OAuth 인증 유틸리티
const KAKAO_CLIENT_ID = '75488b61c393b0af86caaf9a94b182e9';
const REDIRECT_URI = 'http://localhost:5173/auth/callback';

export const requestKakaoLogin = () => {
  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  window.location.href = kakaoAuthUrl;
};
