import React from 'react';
import { Camera } from 'lucide-react';

const LoginPage = () => {
  const handleKakaoLogin = () => {
    
    const REST_API_KEY = '75488b61c393b0af86caaf9a94b182e9'; 
    
    
    const REDIRECT_URI = 'http://localhost:5173/auth/callback'; 
    
    
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    console.log('🔗 카카오 URL:', kakaoURL);
    
    window.location.href = kakaoURL;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VulnSNS</h1>
          <p className="text-gray-600">취약한 소셜 네트워크 (연구용)</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleKakaoLogin}
            className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <img 
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
              alt="카카오 로고"
              className="w-5 h-5"
            />
            <span>카카오로 시작하기</span>
          </button>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-red-600 text-center">
              ⚠️ 이 애플리케이션은 보안 취약점 연구용입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;