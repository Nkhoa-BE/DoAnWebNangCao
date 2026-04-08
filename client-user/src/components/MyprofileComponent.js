import axios from "axios";
import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import MyContext from "../contexts/MyContext";
import './style/MyProfile.css'

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: "",
      txtPassword: "",
      txtName: "",
      txtEmail: "",
    };
  }

  componentDidMount() {
    // Load dữ liệu từ Context vào State khi Component vừa hiển thị
    if (this.context.user) {
      this.setState({
        txtUsername: this.context.user.username,
        txtPassword: this.context.user.password,
        txtName: this.context.user.name,
        txtEmail: this.context.user.email,
      });
    }
  }

  // Hàm xử lý khi nhấn nút UPDATE
  btnUpdateClick(e) {
    e.preventDefault();
    const { txtUsername, txtPassword, txtName, txtEmail } = this.state;

    if (txtUsername && txtPassword && txtName && txtEmail) {
      const user = { 
        username: txtUsername, 
        password: txtPassword, 
        name: txtName, 
        email: txtEmail 
      };
      this.apiPutUser(this.context.user._id, user);
    } else {
      alert("Vui lòng nhập đầy đủ thông tin!");
    }
  }

  // Gọi API cập nhật thông tin lên Backend
  apiPutUser(id, user) {
    const config = {
      headers: { "x-access-token": this.context.token },
    };

    axios.put("/api/user/users/" + id, user, config).then((res) => {
      const result = res.data;
      if (result) {
        alert("Cập nhật hồ sơ thành công!");
        this.context.setUser(result); // Cập nhật lại User trong Context toàn cục
      } else {
        alert("Cập nhật thất bại. Vui lòng thử lại!");
      }
    }).catch(err => {
      console.error(err);
      alert("Lỗi kết nối Server!");
    });
  }

  render() {
    // Bảo mật: Nếu chưa đăng nhập (không có token) thì đá về trang Login
    if (this.context.token === "") {
      return <Navigate replace to="/login" />;
    }

    return (
      <div className="profile-container">
        <h2 className="profile-title">Thông Tin Cá Nhân</h2>

        <form onSubmit={(e) => this.btnUpdateClick(e)}>
          <table className="profile-table">
            <tbody>
              <tr>
                <td>Tên đăng nhập</td>
                <td>
                  <input
                    className="profile-input"
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value })}
                    placeholder="Username..."
                  />
                </td>
              </tr>

              <tr>
                <td>Mật khẩu</td>
                <td>
                  <input
                    className="profile-input"
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) => this.setState({ txtPassword: e.target.value })}
                    placeholder="Password..."
                  />
                </td>
              </tr>

              <tr>
                <td>Họ và Tên</td>
                <td>
                  <input
                    className="profile-input"
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => this.setState({ txtName: e.target.value })}
                    placeholder="Full Name..."
                  />
                </td>
              </tr>

              <tr>
                <td>Email</td>
                <td>
                  <input
                    className="profile-input"
                    type="email"
                    value={this.state.txtEmail}
                    onChange={(e) => this.setState({ txtEmail: e.target.value })}
                    placeholder="Email address..."
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <button 
                    type="submit" 
                    className="btn-update"
                    onClick={(e) => this.btnUpdateClick(e)}
                  >
                    CẬP NHẬT HỒ SƠ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }
}

export default Myprofile;