import axios from 'axios';
import React, { Component } from 'react';
import AuthContext from '../contexts/AuthContext';
import './style/Login.css'; // 1. Import file CSS mới

class Login extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: ''
    };
  }

  render() {
    // Chỉ hiển thị form nếu chưa đăng nhập (token trống)
    if (this.context.token === '') {
      return (
        // 2. Sử dụng class wrapper toàn màn hình để canh giữa
        <div className="login-screen-wrapper">
          {/* 3. Khung Form chính */}
          <div className="login-form-box">
            <h2 className="login-title">ADMIN - GAME NEWS</h2>
            
            <form>
              {/* 4. Nhóm Input Username */}
              <div className="login-input-group">
                <label>Tài khoản</label>
                <input 
                  type="text" 
                  value={this.state.txtUsername} 
                  onChange={(e) => { this.setState({ txtUsername: e.target.value }) }} 
                  placeholder="Nhập tài khoản Admin"
                />
              </div>

              {/* 5. Nhóm Input Password */}
              <div className="login-input-group">
                <label>Mật khẩu</label>
                <input 
                  type="password" 
                  value={this.state.txtPassword} 
                  onChange={(e) => { this.setState({ txtPassword: e.target.value }) }} 
                  placeholder="Nhập mật khẩu"
                />
              </div>

              {/* 6. Nút Đăng nhập */}
              <input 
                type="submit" 
                value="ĐĂNG NHẬP" 
                className="login-submit-btn" 
                onClick={(e) => this.btnLoginClick(e)} 
              />
            </form>
          </div>
        </div>
      );
    }
    // Nếu đã đăng nhập, trả về div trống (để MainComponent hiển thị)
    return (<div />);
  }

  // --- Logic xử lý (Giữ nguyên) ---
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;

    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      alert('Vui lòng nhập đầy đủ tài khoản và mật khẩu!');
    }
  }

  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        alert(result.message);
      }
    }).catch((err) => {
      console.error(err);
      alert('Lỗi kết nối Server!');
    });
  }
}

export default Login;