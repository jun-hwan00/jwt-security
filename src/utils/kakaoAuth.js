import axios from "axios"

export const requestKakaoLogin = () => {
  const REST_API = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  
  window.location.href = kakaoURL;
};

export const getToken = async (code) => {
  const grant_type = "authorization_code";
  const REST_API = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  
  try {
    const res = await axios.post(
      `https://kauth.kakao.com/oauth/token?grant_type=${grant_type}&client_id=${REST_API}&redirect_uri=${REDIRECT_URI}&code=${code}`,
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

export const getCodeFromURL = () => {
  return new URL(window.location.href).searchParams.get("code");
};