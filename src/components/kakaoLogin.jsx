import { requestKakaoLogin } from '../utils/kakaoAuth';

const KakaoLogin = () => {
  const handleKakaoLogin = () => {
    requestKakaoLogin();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
          로그인
        </h1>
        
        <button
          onClick={handleKakaoLogin}
          className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <img 
            src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
            alt="카카오 로고"
            className="w-5 h-5"
          />
          <span>카카오로 시작하기</span>
        </button>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            카카오 계정으로 간편하게 로그인하세요
          </p>
        </div>
      </div>
    </div>
  );
};

export default KakaoLogin;