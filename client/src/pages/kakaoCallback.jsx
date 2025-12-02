import React, { useEffect, useState } from 'react';
import { getCodeFromURL, getToken, getUserData } from '../utils/kakaoAuth';

const KakaoCallback = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleKakaoCallback = async () => {
      try {
        const code = getCodeFromURL();
        
        if (!code) {
          setError('인가 코드를 받아올 수 없습니다.');
          return;
        }

        console.log('인가 코드:', code);
        const token = await getToken(code);
        console.log('토큰 발급 성공:', token);

        const userData = await getUserData(token);
        console.log('사용자 정보:', userData);

        const nickname = userData.properties?.nickname;
        const email = userData.kakao_account?.email;
        const profileImage = userData.properties?.profile_image;

        console.log(`닉네임: ${nickname}, 이메일: ${email}`);

        // 의도적 취약점: localStorage에 토큰 저장
        const userInfo = {
          id: userData.id,
          nickname,
          email,
          profileImage,
          token
        };
        
        localStorage.setItem('kakaoUserInfo', JSON.stringify(userInfo));
        localStorage.setItem('kakaoToken', token);

        onLoginSuccess();

      } catch (error) {
        console.error('카카오 로그인 처리 중 오류:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    handleKakaoCallback();
  }, [onLoginSuccess]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        <p className="mt-4 text-gray-600">카카오 로그인 처리중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">로그인 오류</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default KakaoCallback;