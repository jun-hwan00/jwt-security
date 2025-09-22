import { Link } from 'react-router-dom';
import { useKakaoAuth } from '../hooks/usekakaoAuth';

const Home = () => {
  const { user, isLoggedIn, loading, logout } = useKakaoAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">My App</h1>
            
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {user.profileImage && (
                      <img
                        src={user.profileImage}
                        alt="프로필"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-gray-700">안녕하세요, {user.nickname}님!</span>
                  </div>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  카카오 로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            카카오 로그인 테스트
          </h2>
          
          {isLoggedIn ? (
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">로그인 정보</h3>
              <div className="space-y-2 text-left">
                <p><span className="font-medium">ID:</span> {user.id}</p>
                <p><span className="font-medium">닉네임:</span> {user.nickname}</p>
                <p><span className="font-medium">이메일:</span> {user.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-xl text-gray-600 mb-8">
              카카오 계정으로 로그인하세요!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;