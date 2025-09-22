import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import KakaoLogin from './components/kakaoLogin';
import KakaoCallback from './components/kakaoCallback';
import Home from './components/home';

function App(){
  return (
    <Router>
      <div className="App">
        <Routes>
           <Route path="/" element={<Home />} />
          <Route path="/login" element={<KakaoLogin />} />
          <Route path="/auth/callback" element={<KakaoCallback />} />
        </Routes>
      </div>
    </Router>
  )
}
export default App;