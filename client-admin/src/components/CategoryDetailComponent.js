import axios from 'axios';
import React, { Component } from 'react';
import AuthContext from '../contexts/AuthContext';

class CategoryDetail extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: '',
      toast: null   // { type: 'success'|'error', msg: string }
    };
    this._toastTimer = null;
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({ txtID: this.props.item._id, txtName: this.props.item.name });
      } else {
        this.setState({ txtID: '', txtName: '' });
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this._toastTimer);
  }

  showToast(type, msg) {
    clearTimeout(this._toastTimer);
    this.setState({ toast: { type, msg } });
    this._toastTimer = setTimeout(() => this.setState({ toast: null }), 3000);
  }

  // ── Event Handlers ──────────────────────────────

  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName.trim();
    if (!name) {
      this.showToast('error', 'Vui lòng nhập tên thể loại!');
      return;
    }
    this.apiPostCategory({ name });
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const { txtID, txtName } = this.state;
    if (!txtID) { this.showToast('error', 'Chưa chọn thể loại để cập nhật!'); return; }
    if (!txtName.trim()) { this.showToast('error', 'Tên thể loại không được để trống!'); return; }
    this.apiPutCategory(txtID, { name: txtName.trim() });
  }

  btnDeleteClick(e) {
    e.preventDefault();
    const { txtID, txtName } = this.state;
    if (!txtID) { this.showToast('error', 'Chưa chọn thể loại để xóa!'); return; }
    if (!window.confirm(`Bạn chắc chắn muốn xóa thể loại "${txtName}" không?`)) return;
    this.apiDeleteCategory(txtID);
  }

  // ── APIs ────────────────────────────────────────

  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then((res) => {
      if (res.data) {
        this.showToast('success', `Đã thêm thể loại "${cate.name}" thành công!`);
        this.setState({ txtName: '' });
        this.apiGetCategories();
      }
    }).catch(() => this.showToast('error', 'Thêm thất bại! Vui lòng thử lại.'));
  }

  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      if (res.data) {
        this.showToast('success', 'Cập nhật thành công!');
        this.apiGetCategories();
      }
    }).catch(() => this.showToast('error', 'Cập nhật thất bại!'));
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      if (res.data) {
        this.showToast('success', 'Xóa thể loại thành công!');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else {
        this.showToast('error', 'Xóa thất bại!');
      }
    }).catch(() => this.showToast('error', 'Không thể xóa! Thể loại này có thể đang chứa bài viết.'));
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.props.updateCategories(res.data);
    });
  }

  // ── Render ──────────────────────────────────────

  render() {
    const { txtID, txtName, toast } = this.state;
    const isEditing = !!txtID;

    return (
      <div className="cd-wrap">

        {/* Toast notification */}
        {toast && (
          <div className={`cd-toast cd-toast--${toast.type}`}>
            <span className="cd-toast-icon">{toast.type === 'success' ? '✓' : '⚠'}</span>
            {toast.msg}
          </div>
        )}

        {/* Mode indicator */}
        <div className={`cd-mode-bar cd-mode-bar--${isEditing ? 'edit' : 'add'}`}>
          <span className="cd-mode-dot" />
          <span className="cd-mode-label">
            {isEditing ? `Chế độ chỉnh sửa · ID: ${txtID.slice(-8)}` : 'Chế độ thêm mới'}
          </span>
        </div>

        {/* Form */}
        <form className="cd-form">

          {/* ID field — chỉ hiện khi đang edit */}
          {isEditing && (
            <div className="cd-field">
              <label className="cd-label">
                <span className="cd-label-icon">🔑</span>
                Mã ID (chỉ đọc)
              </label>
              <input
                className="cd-input cd-input--readonly"
                type="text"
                value={txtID}
                readOnly
                disabled
              />
            </div>
          )}

          {/* Name field */}
          <div className="cd-field">
            <label className="cd-label">
              <span className="cd-label-icon">🎮</span>
              Tên thể loại
            </label>
            <input
              className="cd-input"
              type="text"
              value={txtName}
              onChange={(e) => this.setState({ txtName: e.target.value })}
              placeholder="VD: Valorant, LMHT, Dota 2..."
              autoComplete="off"
            />
            <p className="cd-hint">Tên sẽ hiển thị trong danh mục bài viết</p>
          </div>

          {/* Buttons */}
          <div className="cd-btn-group">
            {/* THÊM MỚI — chỉ active khi không đang edit */}
            <button
              className={`cd-btn cd-btn--add${isEditing ? ' cd-btn--disabled' : ''}`}
              onClick={(e) => this.btnAddClick(e)}
              disabled={isEditing}
              title={isEditing ? 'Bỏ chọn thể loại để thêm mới' : 'Thêm thể loại mới'}
            >
              <span>➕</span> Thêm Mới
            </button>

            {/* CẬP NHẬT — chỉ active khi đang edit */}
            <button
              className={`cd-btn cd-btn--update${!isEditing ? ' cd-btn--disabled' : ''}`}
              onClick={(e) => this.btnUpdateClick(e)}
              disabled={!isEditing}
              title={!isEditing ? 'Chọn thể loại từ danh sách để cập nhật' : 'Lưu thay đổi'}
            >
              <span>✏️</span> Cập Nhật
            </button>

            {/* XÓA — chỉ active khi đang edit */}
            <button
              className={`cd-btn cd-btn--delete${!isEditing ? ' cd-btn--disabled' : ''}`}
              onClick={(e) => this.btnDeleteClick(e)}
              disabled={!isEditing}
              title={!isEditing ? 'Chọn thể loại từ danh sách để xóa' : 'Xóa thể loại này'}
            >
              <span>🗑️</span> Xóa
            </button>
          </div>

          {/* Guide */}
          <div className="cd-guide">
            <div className="cd-guide-title">Hướng dẫn</div>
            <div className="cd-guide-list">
              <div className="cd-guide-item">
                <span className="cd-guide-dot cd-guide-dot--cyan" />
                Nhập tên → nhấn <strong>Thêm Mới</strong> để tạo thể loại
              </div>
              <div className="cd-guide-item">
                <span className="cd-guide-dot cd-guide-dot--gold" />
                Chọn hàng ở bảng trái → sửa tên → nhấn <strong>Cập Nhật</strong>
              </div>
              <div className="cd-guide-item">
                <span className="cd-guide-dot cd-guide-dot--pink" />
                Chọn hàng ở bảng trái → nhấn <strong>Xóa</strong> để xóa
              </div>
            </div>
          </div>

        </form>
      </div>
    );
  }
}

export default CategoryDetail;