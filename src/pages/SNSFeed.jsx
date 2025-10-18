import React, { useState } from 'react';
import { Camera, Heart, MessageCircle, Send, LogOut } from 'lucide-react';

const SNSFeed = ({ user, onLogout }) => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: '테스트유저1',
      authorImage: 'https://via.placeholder.com/40',
      content: '안녕하세요! 첫 게시물입니다 😊',
      likes: 5,
      comments: 2,
      timestamp: '1시간 전'
    },
    {
      id: 2,
      author: '테스트유저2',
      authorImage: 'https://via.placeholder.com/40',
      content: 'React로 SNS 만들기 재미있네요!',
      likes: 12,
      comments: 4,
      timestamp: '3시간 전'
    }
  ]);
  const likeUp = (postId) => {
    setPosts(posts.map(post => post.id === postId ? {...post, likes: post.likes +1}: post))
  }
  const [name, setName] = useState("블로그")

  const [newPost, setNewPost] = useState('');

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      author: user.nickname,
      authorImage: user.profileImage || 'https://via.placeholder.com/40',
      content: newPost,
      likes: 0,
      comments: 0,
      timestamp: '방금 전'
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="w-6 h-6 text-yellow-500" />
            <h1 className="text-xl font-bold text-gray-900">VulnSNS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            
            <span className="text-sm text-gray-700 hidden sm:block">{user.nickname}</span>
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
                className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handlePostSubmit}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Send className="w-4 h-4" />
                  <span>게시</span>
                </button>
              </div>
            </div>
          </div>
        </div>


        
        <div>{name}</div>



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
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="flex items-center space-x-6 text-gray-600 border-t border-gray-100 pt-3">
                <button className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span onClick = {() => likeUp(post.id)} className="text-sm">{post.likes}</span>
                </button>



                <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.comments}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        
      

        {/* 취약점 표시 */}
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">🔓 구현된 취약점</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• JWT 토큰이 localStorage에 저장됨 (XSS 공격에 취약)</li>
            <li>• dangerouslySetInnerHTML 사용 (Stored XSS 취약점)</li>
            <li>• 입력값 sanitization 미적용</li>
            <li>• CSP (Content Security Policy) 미적용</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default SNSFeed;