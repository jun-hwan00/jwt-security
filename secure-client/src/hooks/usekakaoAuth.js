import { useState, useEffect } from 'react';
import axios from 'axios';


axios.defaults.withCredentials = true;

export const useKakaoAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  
    const checkAuthStatus = async () => {
      try {
       
        const response = await axios.get('http://localhost:4000/api/me', {
          withCredentials: true
        });
        
        if (response.data) {
          setUser(response.data);
          console.log("✅ 인증 확인 완료:", response.data.nickname);
        }
      } catch (error) {
        console.log("인증되지 않은 사용자");
       
        sessionStorage.removeItem('userInfo');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const logout = async () => {
    try {
     
      await axios.post('http://localhost:4000/api/logout', {}, {
        withCredentials: true
      });
      
      sessionStorage.removeItem('userInfo');
      setUser(null);
      console.log("✅ 로그아웃 완료");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return { 
    user, 
    isLoggedIn: !!user, 
    loading, 
    logout 
  };
};