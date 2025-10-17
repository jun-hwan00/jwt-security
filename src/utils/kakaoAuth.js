import axios from "axios";

// 환경변수에서 카카오 설정 가져오기
export const KAKAO_CONFIG = {
  REST_API_KEY: import.meta.env.VITE_KAKAO_REST_API_KEY,
  REDIRECT_URI: import.meta.env.VITE_KAKAO_REDIRECT_URI,
};

// 카카오 로그인 요청
export const requestKakaoLogin = () => {
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CONFIG.REST_API_KEY}&redirect_uri=${KAKAO_CONFIG.REDIRECT_URI}&response_type=code`;
  window.location.href = kakaoURL;
};

// URL에서 인가 코드 추출
export const getCodeFromURL = () => {
  return new URL(window.location.href).searchParams.get("code");
};

// 액세스 토큰 발급
export const getToken = async (code) => {
  const grant_type = "authorization_code";
  
  try {
    const res = await axios.post(
      `https://kauth.kakao.com/oauth/token?grant_type=${grant_type}&client_id=${KAKAO_CONFIG.REST_API_KEY}&redirect_uri=${KAKAO_CONFIG.REDIRECT_URI}&code=${code}`,
      {},
      {
        headers: {
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      }
    );
    
    return res.data.access_token;
  } catch (error) {
    console.error("토큰 발급 실패:", error);
    throw error;
  }
};

// 사용자 정보 조회
export const getUserData = async (token) => {
  try {
    const res = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return res.data;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    throw error;
  }
};