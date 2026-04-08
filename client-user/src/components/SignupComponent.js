import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtEmail: '',
      loading: false,
      error: '',
      success: '',
    };
  }

  btnSignupClick(e) {
    e.preventDefault();
    const { txtUsername, txtPassword, txtName, txtEmail } = this.state;
    this.setState({ error: '', success: '' });

    if (!txtUsername || !txtPassword || !txtName || !txtEmail) {
      this.setState({ error: 'Vui lòng điền đầy đủ tất cả các trường.' });
      return;
    }

    this.setState({ loading: true });
    axios.post('/api/user/signup', { username: txtUsername, password: txtPassword, name: txtName, email: txtEmail })
      .then((res) => {
        const result = res.data;
        this.setState({ loading: false });
        if (result.success) {
          this.setState({
            success: result.message || 'Đăng ký thành công! Hãy đăng nhập.',
            txtUsername: '', txtPassword: '', txtName: '', txtEmail: '',
          });
        } else {
          this.setState({ error: result.message || 'Đăng ký thất bại.' });
        }
      })
      .catch(() => this.setState({ loading: false, error: 'Có lỗi xảy ra. Vui lòng thử lại.' }));
  }

  render() {
    const { txtUsername, txtPassword, txtName, txtEmail, loading, error, success } = this.state;

    return (
      <div className="auth-page">
        <div className="auth-box">

          <div className="auth-logo">
            <span className="auth-logo-icon">E</span>
            <span className="auth-logo-text">TRUNG TÂM <span className="auth-logo-accent">ESPORTS</span></span>
          </div>

          <h2 className="auth-title">ĐĂNG KÝ</h2>
          <p className="auth-sub">Tạo tài khoản để tham gia cộng đồng.</p>

          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Tên đăng nhập</label>
              <input className="auth-input" type="text" placeholder="Nhập username..."
                value={txtUsername}
                onChange={(e) => this.setState({ txtUsername: e.target.value, error: '' })} />
            </div>

            <div className="auth-field">
              <label className="auth-label">Mật khẩu</label>
              <input className="auth-input" type="password" placeholder="Nhập mật khẩu..."
                value={txtPassword}
                onChange={(e) => this.setState({ txtPassword: e.target.value, error: '' })} />
            </div>

            <div className="auth-field">
              <label className="auth-label">Họ tên</label>
              <input className="auth-input" type="text" placeholder="Tên hiển thị..."
                value={txtName}
                onChange={(e) => this.setState({ txtName: e.target.value, error: '' })} />
            </div>

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="Nhập email..."
                value={txtEmail}
                onChange={(e) => this.setState({ txtEmail: e.target.value, error: '' })} />
            </div>

            <button className="auth-btn" disabled={loading} onClick={(e) => this.btnSignupClick(e)}>
              {loading ? <span className="auth-spinner" /> : 'ĐĂNG KÝ'}
            </button>
          </div>

          <div className="auth-links">
            <span>Đã có tài khoản? </span>
            <Link to="/login" className="auth-link">Đăng nhập</Link>
          </div>

        </div>
      </div>
    );
  }
}

export default Signup;