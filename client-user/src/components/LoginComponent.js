import axios from "axios";
import React, { Component } from "react";
import MyContext from "../contexts/MyContext";
import withRouter from "../utils/withRouter";
import { Link } from "react-router-dom";

class Login extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
      loading: false,
      error: "",
    };
  }

  render() {
    const { txtUsername, txtPassword, loading, error } = this.state;
    return (
      <div className="auth-page">
        <div className="auth-box">
          {/* Logo */}
          <div className="auth-logo">
            <span className="auth-logo-icon">E</span>
            <span className="auth-logo-text">TRUNG TÂM <span className="auth-logo-accent">ESPORTS</span></span>
          </div>

          <h2 className="auth-title">ĐĂNG NHẬP</h2>
          <p className="auth-sub">Chào mừng trở lại! Đăng nhập để tiếp tục.</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Tên đăng nhập</label>
              <input
                className="auth-input"
                type="text"
                placeholder="Nhập username..."
                value={txtUsername}
                onChange={(e) => this.setState({ txtUsername: e.target.value, error: "" })}
                onKeyDown={(e) => e.key === "Enter" && this.btnLoginClick(e)}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Mật khẩu</label>
              <input
                className="auth-input"
                type="password"
                placeholder="Nhập mật khẩu..."
                value={txtPassword}
                onChange={(e) => this.setState({ txtPassword: e.target.value, error: "" })}
                onKeyDown={(e) => e.key === "Enter" && this.btnLoginClick(e)}
              />
            </div>

            <button
              className="auth-btn"
              disabled={loading}
              onClick={(e) => this.btnLoginClick(e)}
            >
              {loading ? <span className="auth-spinner" /> : "ĐĂNG NHẬP"}
            </button>
          </div>

          <div className="auth-links">
            <span>Chưa có tài khoản? </span>
            <Link to="/signup" className="auth-link">Đăng ký ngay</Link>
          </div>
          <div className="auth-links" style={{ marginTop: 8 }}>
            <Link to="/active" className="auth-link">Kích hoạt tài khoản</Link>
          </div>
        </div>
      </div>
    );
  }

  btnLoginClick(e) {
    e.preventDefault();
    const { txtUsername, txtPassword } = this.state;
    if (txtUsername && txtPassword) {
      this.setState({ loading: true, error: "" });
      this.apiLogin({ username: txtUsername, password: txtPassword });
    } else {
      this.setState({ error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
    }
  }

  apiLogin(account) {
    axios.post("/api/user/login", account)
      .then((res) => {
        const result = res.data;
        this.setState({ loading: false });
        if (result.success === true) {
          this.context.setToken(result.token);
          this.context.setUser(result.user);
          this.props.navigate("/home");
        } else {
          this.setState({ error: result.message });
        }
      })
      .catch(() => {
        this.setState({ loading: false, error: "Lỗi kết nối đến máy chủ." });
      });
  }
}

export default withRouter(Login);