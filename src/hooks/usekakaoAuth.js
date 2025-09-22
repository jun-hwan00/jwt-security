import { useState, useEffect } from 'react';

export const useKakaoAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const checkLoginStatus = () => {
      try {
        const userInfo = localStorage.getItem('kakaoUserInfo');
        const token = localStorage.getItem('kakaoToken');

        if (userInfo && token) {
          setUser(JSON.parse(userInfo));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('로그인 상태 확인 중 오류:', error);
      
        localStorage.removeItem('kakaoUserInfo');
        localStorage.removeItem('kakaoToken');
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const logout = () => {
    localStorage.removeItem('kakaoUserInfo');
    localStorage.removeItem('kakaoToken');
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (newUserInfo) => {
    setUser(newUserInfo);
    localStorage.setItem('kakaoUserInfo', JSON.stringify(newUserInfo));
  };

  return {
    user,
    isLoggedIn,
    loading,
    logout,
    updateUser
  };
};