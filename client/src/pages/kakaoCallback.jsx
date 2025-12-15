import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

const KakaoCallback = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('카카오 인가 코드를 확인 중입니다...');
  const hasRequested = useRef(false); 
  
  useEffect(() => {
    
    if (hasRequested.current) {
      console.log("이미 로그인 처리 완료됨 - 스킵");
      return;
    }
    
    const loginHandler = async () => {
      try {
        const code = new URL(window.location.href).searchParams.get("code");
      
        if (!code) {
            console.log("인가 코드 없음 - 메인으로 이동");
            setStatus('인가 코드가 없습니다. 메인으로 이동합니다.');
            setTimeout(() => navigate('/'), 1000);
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
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('kakaoUserInfo', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));

        console.log("✅ localStorage 저장 완료!");
        console.log("저장된 accessToken:", localStorage.getItem('accessToken'));

        setStatus('로그인 성공! 메인으로 이동합니다.');
        
        if (onLoginSuccess) {
            onLoginSuccess(user);
        }

        setTimeout(() => {
          console.log("메인 페이지로 이동");
          navigate('/', { replace: true });
        }, 2000);

      } catch (error) {
        console.error("❌ 로그인 에러:", error);
        console.error("에러 상세:", error.response?.data || error.message);
        

        hasRequested.current = false;
        setStatus('로그인 실패. 다시 시도해주세요.');
        

        setTimeout(() => navigate('/'), 3000);
      }
    };

    loginHandler();
  }, [navigate, onLoginSuccess]); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mb-4"></div>
       <h2 className="text-xl font-bold text-gray-700">{status}</h2>
       <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요...</p>
    </div>
  );
};

export default KakaoCallback;