import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import './style/Menu.css'; 

class Menu extends Component {
  static contextType = AuthContext;

  render() {
    return (
      <nav className="admin-navbar">

        <ul className="menu-list">
          <li className="menu-item"><Link to='/admin/home'>Trang chủ</Link></li>
          <li className="menu-item"><Link to='/admin/category'>Danh mục</Link></li>
          <li className="menu-item"><Link to='/admin/post'>Bài viết</Link></li>
          <li className="menu-item"><Link to='/admin/comment'>Bình luận</Link></li>
          <li className="menu-item"><Link to='/admin/reader'>Độc giả</Link></li>
        </ul>

        {/* Thông tin tài khoản và Đăng xuất bên phải */}
        <div className="admin-info">
          Chào <b>{this.context.username}</b>
          <Link 
            to='/admin/home' 
            className="logout-link" 
            onClick={() => this.lnkLogoutClick()}
          >
            [ Đăng xuất ]
          </Link>
        </div>
      </nav>
    );
  }

  // Hàm xử lý đăng xuất
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}

export default Menu;