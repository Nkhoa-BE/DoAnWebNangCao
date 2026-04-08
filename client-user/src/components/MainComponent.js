import React, { Component } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import các thành phần giao diện
import Menu from './MenuComponent';
import Home from './HomeComponent';
import Post from './PostComponent';
import PostDetail from './PostDetailComponent';
import Signup from './SignupComponent';
import Active from './ActiveComponent';
import Login from './LoginComponent';
import Myprofile from './MyprofileComponent';
import Mysaved from './MySavedComponent';
class Main extends Component {
  render() {
    return (
      <div className="body-customer">
        {/* Header cố định */}
        <Menu />

        {/* Nội dung thay đổi theo URL */}
        <main className="esports-main-content" style={{ minHeight: '70vh', background: '#0a0a0f' }}>
          <Routes>
            {/* Điều hướng mặc định */}
            <Route path="/" element={<Navigate replace to="/home" />} />
            <Route path="/home" element={<Home />} />

            {/* Route hiển thị danh sách bài viết theo chuyên mục & tìm kiếm */}
            <Route path="/posts/category/:cid" element={<Post />} />
            <Route path="/posts/search/:keyword" element={<Post />} />

            {/* Route hiển thị CHI TIẾT bài viết */}
            {/* Khớp với Link to='/posts/...' trong HomeComponent và PostComponent */}
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/signup" element={<Signup />} />
            <Route path='/active' element={<Active />} />
            <Route path='/login' element={<Login />} />
            <Route path='/myprofile' element={<Myprofile />} />
            <Route path='/mysaved' element={<Mysaved />} />
            {/* Bạn có thể thêm Login/Signup ở đây sau này */}
          </Routes>
        </main>

        {/* Footer đơn giản cho trang báo */}
        <footer style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: '1px solid #1e1e2e',
          marginTop: '40px',
          background: '#06060c',
          color: '#606070',
          fontSize: '13px',
          fontFamily: "'Inter', sans-serif"
        }}>
          © 2026 Esports VLU
        </footer>
      </div>
    );
  }
}

export default Main;