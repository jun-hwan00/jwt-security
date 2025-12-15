import React, { useState, useEffect } from 'react';
import { Camera, Heart, MessageCircle, Send, LogOut } from 'lucide-react';
import axios from 'axios';
import DOMPurify from 'dompurify';


axios.defaults.withCredentials = true;

const SNSFeed = ({ user, onLogout }) => {
  const [posts, setPosts] = useState([]);
  const likeUp = (postId) => {
    setPosts(posts.map(post => post.id === postId ? {...post, likes: post.likes +1}: post))
  }
  const [name, setName] = useState("블로그")

  const [newPost, setNewPost] = useState('');

  
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/posts', {
        withCredentials: true 
      });
      setPosts(response.data.posts);
    } catch (error) {
      console.error('게시물 불러오기 실패:', error);
    }
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: user.nickname,
    statusMessage: user.statusMessage || '',
    profileImage: user.profileImage || ''
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      
      const response = await axios.patch('http://localhost:4000/api/profile', profileData, {
        withCredentials: true 
      });

      if (response.data.success) {
        alert('프로필 수정 완료!');
        setIsEditingProfile(false);
        
      }
    } catch (error) {
      console.error('프로필 수정 실패:', error);
      alert('프로필 수정에 실패했습니다.');
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
   
      const sanitizedContent = DOMPurify.sanitize(newPost, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
        ALLOWED_ATTR: []
      });

      const response = await axios.post('http://localhost:4000/api/posts', {
        author: user.nickname,
        authorImage: user.profileImage || 'https://via.placeholder.com/40',
        content: sanitizedContent, 
        userId: user.id || 'anonymous'
      }, {
        withCredentials: true 
      });

      if (response.data.success) {
        setPosts([response.data.post, ...posts]);
        setNewPost('');
      }
    } catch (error) {
      console.error('게시물 작성 실패:', error);
      alert('게시물 작성에 실패했습니다.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-green-500" />
            <h1 className="text-xl font-bold text-gray-900">Secure SNS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user.profileImage && (
              <img
                src={user.profileImage}
                alt="프로필"
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <span className="text-sm text-gray-700 hidden sm:block">{user.nickname}</span>
             <button
              onClick={() => setIsEditingProfile(true)}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
            >
              프로필 수정
            </button>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">프로필 수정</h2>
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    닉네임
                  </label>
                  <input
                    type="text"
                    value={profileData.nickname}
                    onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    프로필 이미지 URL
                  </label>
                  <input
                    type="text"
                    value={profileData.profileImage}
                    onChange={(e) => setProfileData({...profileData, profileImage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    placeholder="https://example.com/image.jpg"
                  />
                  {profileData.profileImage && (
                    <div className="mt-2">
                      <img
                        src={profileData.profileImage}
                        alt="미리보기"
                        className="w-20 h-20 rounded-full object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                      />
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태 메시지
                  </label>
                  <textarea
                    value={profileData.statusMessage}
                    onChange={(e) => setProfileData({...profileData, statusMessage: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows={3}
                    placeholder="상태 메시지를 입력하세요"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg"
                  >
                    저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostSubmit(e);
                  }
                }}
                placeholder="무슨 생각을 하고 계신가요?"
                className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePostSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>게시</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start space-x-3 mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{post.author}</h3>
                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
              </div>

              <div
                className="text-gray-800 mb-3"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(post.content, {
                    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
                    ALLOWED_ATTR: []
                  })
                }}
              />

              <div className="flex items-center space-x-6 text-gray-600 border-t border-gray-100 pt-3">
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span onClick={() => likeUp(post.id)} className="text-sm">{post.likes}</span>
                </button>

                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🔒 적용된 보안 기능</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• JWT 토큰이 HttpOnly Cookie로 관리됨 (XSS 방어)</li>
            <li>• DOMPurify 적용 (Stored XSS 방어)</li>
            <li>• withCredentials를 통한 안전한 쿠키 전송</li>
            <li>• localStorage 사용 제거</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default SNSFeed;