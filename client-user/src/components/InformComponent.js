import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Inform extends Component {
  static contextType = MyContext;

  render() {
    const { token, user, mysaved } = this.context;

    return (
      <div className="esports-inform-bar">
        {/* Bên trái: Chức năng hội viên */}
        <div className="esports-inform-left">
          {token ? (
            <span>
              Chào, <b>{user?.name}</b>
              <Link to='/home' onClick={() => this.btnLogoutClick()}> Đăng xuất</Link>
              <Link to='/myprofile'> Hồ sơ</Link>
            </span>
          ) : (
            <span>
              <Link to='/login'>Đăng nhập</Link>
              <Link to='/signup'> Đăng ký</Link>
              <Link to='/active'> Kích hoạt</Link>
            </span>
          )}
        </div>

        {/* Bên phải: Tiện ích độc giả */}
        <div className="esports-inform-right">
          <Link to='/mysaved'>🔖 Tin đã lưu ({mysaved?.length || 0})</Link>
          <span>⚡ Chào mừng đến với <b>Esports 24/7</b></span>
        </div>
      </div>
    );
  }

  btnLogoutClick() {
    this.context.setToken('');
    this.context.setUser(null);
    this.context.setMysaved([]);
  }
}

export default Inform;