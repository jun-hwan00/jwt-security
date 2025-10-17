import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SNSFeed from './pages/SNSFeed';
import KakaoCallback from './pages/KakaoCallback';
import { useKakaoAuth } from './hooks/useKakaoAuth';

// 콜백 래퍼 컴포넌트
const KakaoCallbackWrapper = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    navigate('/', { replace: true });
    window.location.reload();
  };

  return <KakaoCallback onLoginSuccess={handleLoginSuccess} />;
};

// 메인 앱 컴포넌트
function App() {
  const { user, isLoggedIn, loading, logout } = useKakaoAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? (
              <SNSFeed user={user} onLogout={logout} />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/auth/callback" 
          element={<KakaoCallbackWrapper />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;