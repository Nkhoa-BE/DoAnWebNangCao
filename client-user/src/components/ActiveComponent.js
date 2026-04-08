import axios from "axios";
import React, { Component } from "react";

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: "",
      txtToken: "",
    };
  }

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">KÍCH HOẠT TÀI KHOẢN</h2>

        <form>
          <table className="align-center">
            <tbody>
              <tr>
                <td>User ID</td>
                <td>
                  <input
                    type="text"
                    placeholder="Nhập ID từ Email"
                    value={this.state.txtID}
                    onChange={(e) => {
                      this.setState({ txtID: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td>Token</td>
                <td>
                  <input
                    type="text"
                    placeholder="Nhập mã Token"
                    value={this.state.txtToken}
                    onChange={(e) => {
                      this.setState({ txtToken: e.target.value });
                    }}
                  />
                </td>
              </tr>

              <tr>
                <td></td>
                <td>
                  <input
                    type="submit"
                    value="KÍCH HOẠT"
                    onClick={(e) => this.btnActiveClick(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnActiveClick(e) {
    e.preventDefault();

    const id = this.state.txtID;
    const token = this.state.txtToken;

    if (id && token) {
      this.apiActive(id, token);
    } else {
      alert("Vui lòng nhập đầy đủ ID và mã Token để kích hoạt.");
    }
  }

  apiActive(id, token) {
    const body = { id: id, token: token };

    // Cập nhật đường dẫn thành /api/user/active để khớp với Server
    axios.post("/api/user/active", body).then((res) => {
      const result = res.data;

      if (result.success) {
        alert("Chúc mừng! Tài khoản của bạn đã được kích hoạt thành công.");
        // Bạn có thể thêm điều hướng về trang Login ở đây:
        // this.props.navigate('/login'); 
      } else {
        alert(result.message || "Kích hoạt thất bại. Vui lòng kiểm tra lại ID và mã Token.");
      }
    }).catch(err => {
      console.error(err);
      alert("Đã có lỗi xảy ra trong quá trình kết nối với máy chủ.");
    });
  }
}

export default Active;