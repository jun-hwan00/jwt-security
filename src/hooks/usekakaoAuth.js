import { useState, useEffect } from 'react';

export const useKakaoAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 의도적 취약점: localStorage에서 토큰 확인
    const kakaoUserInfo = localStorage.getItem('kakaoUserInfo');
    const kakaoToken = localStorage.getItem('kakaoToken');
    
    if (kakaoUserInfo && kakaoToken) {
      setUser(JSON.parse(kakaoUserInfo));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('kakaoUserInfo');
    localStorage.removeItem('kakaoToken');
    setUser(null);
  };

  return { 
    user, 
    isLoggedIn: !!user, 
    loading, 
    logout 
  };
};