import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const KakaoCallback = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('카카오 인가 코드를 확인 중입니다...');
  const hasRequested = useRef(false); 
  useEffect(() => {
   
    if (hasRequested.current) return;
    
    const loginHandler = async () => {
      try {
        const code = new URL(window.location.href).searchParams.get("code");
        
        if (!code) {
            setStatus('인가 코드가 없습니다. 다시 로그인해주세요.');
            return;
        }
        
    
        hasRequested.current = true;
        
        console.log("1. 인가 코드 발견:", code);
        setStatus('2. 서버로 로그인 요청 중...');

        const response = await axios.post('http://localhost:4000/api/auth/kakao', {
            code: code 
        });

        const { accessToken, user } = response.data;
        console.log("3. 서버로부터 받은 토큰:", accessToken);

        localStorage.setItem('kakaoToken', accessToken);
        localStorage.setItem('kakaoUserInfo', JSON.stringify(user));

        setStatus('로그인 성공! 메인으로 이동합니다.');
        
        if (onLoginSuccess) {
            onLoginSuccess(user);
        }
        
        setTimeout(() => navigate('/'), 1000);

      } catch (error) {
        console.error("로그인 에러:", error);
        hasRequested.current = false; 
        setStatus('로그인 실패. 다시 시도해주세요.');
      }
    };

    loginHandler();
  }, []); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
       <h2 className="text-xl font-bold text-gray-700">{status}</h2>
    </div>
  );
};

export default KakaoCallback;