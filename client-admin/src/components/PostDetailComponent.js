import axios from 'axios';
import React, { Component } from 'react';
import AuthContext from '../contexts/AuthContext';

class PostDetail extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtTitle: '',
      txtContent: '',
      cmbCategory: '',
      imgPost: '',       // base64 full (với header data:)
      toast: null,       // { type: 'success'|'error', msg }
      isSubmitting: false
    };
    this._toastTimer = null;
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (!this.props.item) {
        this.setState({ txtID: '', txtTitle: '', txtContent: '', cmbCategory: '', imgPost: '' });
        return;
      }
      const item = this.props.item;
      const cateID = item.category
        ? (typeof item.category === 'object' ? item.category._id : item.category)
        : '';
      const imageDisplay = item.image
        ? (item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`)
        : '';
      this.setState({
        txtID: item._id,
        txtTitle: item.title || '',
        txtContent: item.content || '',
        cmbCategory: cateID,
        imgPost: imageDisplay
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this._toastTimer);
  }

  showToast(type, msg) {
    clearTimeout(this._toastTimer);
    this.setState({ toast: { type, msg } });
    this._toastTimer = setTimeout(() => this.setState({ toast: null }), 3500);
  }

  previewImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => this.setState({ imgPost: evt.target.result });
    reader.readAsDataURL(file);
  }

  // ── Handlers ──────────────────────────────────

  btnAddClick(e) {
    e.preventDefault();
    const { txtTitle, txtContent, cmbCategory, imgPost } = this.state;
    if (!txtTitle.trim()) return this.showToast('error', 'Vui lòng nhập tiêu đề bài viết!');
    if (!txtContent.trim()) return this.showToast('error', 'Vui lòng nhập nội dung tóm tắt!');
    if (!cmbCategory) return this.showToast('error', 'Vui lòng chọn thể loại!');
    if (!imgPost) return this.showToast('error', 'Vui lòng chọn ảnh minh họa!');
    const image = imgPost.replace(/^data:image\/[a-z]+;base64,/, '');
    this.apiPostPost({ title: txtTitle.trim(), content: txtContent.trim(), category: cmbCategory, image });
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const { txtID, txtTitle, txtContent, cmbCategory, imgPost } = this.state;
    if (!txtID) return this.showToast('error', 'Chưa chọn bài viết để cập nhật!');
    if (!txtTitle.trim()) return this.showToast('error', 'Tiêu đề không được để trống!');
    if (!cmbCategory) return this.showToast('error', 'Vui lòng chọn thể loại!');
    const image = imgPost.replace(/^data:image\/[a-z]+;base64,/, '');
    this.apiPutPost(txtID, { title: txtTitle.trim(), content: txtContent.trim(), category: cmbCategory, image });
  }

  btnDeleteClick(e) {
    e.preventDefault();
    const { txtID, txtTitle } = this.state;
    if (!txtID) return this.showToast('error', 'Chưa chọn bài viết để xóa!');
    if (!window.confirm(`Bạn chắc chắn muốn xóa bài:\n"${txtTitle}"?`)) return;
    this.apiDeletePost(txtID);
  }

  // ── APIs ─────────────────────────────────────

  apiPostPost(post) {
    this.setState({ isSubmitting: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/posts', post, config)
      .then((res) => {
        if (res.data) {
          this.showToast('success', 'Đăng bài thành công!');
          this.setState({ txtTitle: '', txtContent: '', cmbCategory: '', imgPost: '' });
          this.apiGetPosts();
        } else {
          this.showToast('error', 'Đăng bài thất bại!');
        }
      })
      .catch(() => this.showToast('error', 'Lỗi server! Vui lòng thử lại.'))
      .finally(() => this.setState({ isSubmitting: false }));
  }

  apiPutPost(id, post) {
    this.setState({ isSubmitting: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/posts/' + id, post, config)
      .then((res) => {
        if (res.data) {
          this.showToast('success', 'Cập nhật bài viết thành công!');
          this.apiGetPosts();
        } else {
          this.showToast('error', 'Cập nhật thất bại!');
        }
      })
      .catch(() => this.showToast('error', 'Lỗi server!'))
      .finally(() => this.setState({ isSubmitting: false }));
  }

  apiDeletePost(id) {
    this.setState({ isSubmitting: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/posts/' + id, config)
      .then((res) => {
        if (res.data) {
          this.showToast('success', 'Xóa bài viết thành công!');
          this.setState({ txtID: '', txtTitle: '', txtContent: '', cmbCategory: '', imgPost: '' });
          this.apiGetPosts();
        } else {
          this.showToast('error', 'Xóa thất bại!');
        }
      })
      .catch(() => this.showToast('error', 'Lỗi server!'))
      .finally(() => this.setState({ isSubmitting: false }));
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data });
    });
  }

  apiGetPosts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/posts?page=' + this.props.curPage, config).then((res) => {
      const result = res.data;
      if (result.posts.length !== 0) {
        this.props.updatePosts(result.posts, result.noPages, result.curPage);
      } else {
        const curPage = this.props.curPage - 1 > 0 ? this.props.curPage - 1 : 1;
        axios.get('/api/admin/posts?page=' + curPage, config).then((res2) => {
          this.props.updatePosts(res2.data.posts, res2.data.noPages, curPage);
        });
      }
    });
  }

  // ── Render ───────────────────────────────────

  render() {
    const { categories, txtID, txtTitle, txtContent, cmbCategory, imgPost, toast, isSubmitting } = this.state;
    const isEditing = !!txtID;

    return (
      <div className="pd-wrap">

        {/* Toast */}
        {toast && (
          <div className={`pd-toast pd-toast--${toast.type}`}>
            <span className="pd-toast-icon">{toast.type === 'success' ? '✓' : '⚠'}</span>
            {toast.msg}
          </div>
        )}

        {/* Mode Bar */}
        <div className={`pd-mode-bar pd-mode-bar--${isEditing ? 'edit' : 'add'}`}>
          <span className="pd-mode-dot" />
          <span className="pd-mode-label">
            {isEditing ? `Chỉnh sửa · ID: ...${txtID.slice(-8)}` : 'Chế độ thêm bài mới'}
          </span>
        </div>

        {/* Form */}
        <form className="pd-form">

          {/* ID — chỉ hiện khi edit */}
          {isEditing && (
            <div className="pd-field">
              <label className="pd-label"><span>🔑</span> Mã bài viết (ID)</label>
              <input className="pd-input pd-input--readonly" type="text" value={txtID} readOnly disabled />
            </div>
          )}

          {/* Tiêu đề */}
          <div className="pd-field">
            <label className="pd-label"><span>📝</span> Tiêu đề tin tức</label>
            <input
              className="pd-input"
              type="text"
              value={txtTitle}
              onChange={(e) => this.setState({ txtTitle: e.target.value })}
              placeholder="VD: T1 vô địch MSI 2025 sau màn trình diễn hủy diệt..."
            />
          </div>

          {/* Nội dung */}
          <div className="pd-field">
            <label className="pd-label"><span>📄</span> Nội dung tóm tắt</label>
            <textarea
              className="pd-textarea"
              rows={4}
              value={txtContent}
              onChange={(e) => this.setState({ txtContent: e.target.value })}
              placeholder="Viết tóm tắt ngắn gọn về bài viết..."
            />
            <p className="pd-hint">{txtContent.length} ký tự</p>
          </div>

          {/* Thể loại */}
          <div className="pd-field">
            <label className="pd-label"><span>🎮</span> Thể loại</label>
            <select
              className="pd-select"
              value={cmbCategory}
              onChange={(e) => this.setState({ cmbCategory: e.target.value })}
            >
              <option value="">-- Chọn thể loại --</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Ảnh */}
          <div className="pd-field">
            <label className="pd-label"><span>🖼️</span> Ảnh minh họa</label>
            <label className="pd-file-label">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => this.previewImage(e)}
                style={{ display: 'none' }}
              />
              <span className="pd-file-btn">📂 Chọn ảnh từ máy tính</span>
              <span className="pd-file-hint">{imgPost ? 'Đã có ảnh · click để đổi' : 'JPG, PNG, GIF, WEBP'}</span>
            </label>

            {imgPost && (
              <div className="pd-preview-wrap">
                <img className="pd-preview-img" src={imgPost} alt="Preview" />
                <button
                  type="button"
                  className="pd-preview-remove"
                  onClick={() => this.setState({ imgPost: '' })}
                  title="Xóa ảnh"
                >✕</button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="pd-btn-group">
            <button
              className={`pd-btn pd-btn--add${isEditing ? ' pd-btn--disabled' : ''}`}
              onClick={(e) => this.btnAddClick(e)}
              disabled={isEditing || isSubmitting}
            >
              {isSubmitting && !isEditing ? <span className="pd-spinner" /> : <span>➕</span>}
              Đăng Bài
            </button>

            <button
              className={`pd-btn pd-btn--update${!isEditing ? ' pd-btn--disabled' : ''}`}
              onClick={(e) => this.btnUpdateClick(e)}
              disabled={!isEditing || isSubmitting}
            >
              {isSubmitting && isEditing ? <span className="pd-spinner" /> : <span>✏️</span>}
              Cập Nhật
            </button>

            <button
              className={`pd-btn pd-btn--delete${!isEditing ? ' pd-btn--disabled' : ''}`}
              onClick={(e) => this.btnDeleteClick(e)}
              disabled={!isEditing || isSubmitting}
            >
              <span>🗑️</span> Xóa Bài
            </button>
          </div>

        </form>
      </div>
    );
  }
}

export default PostDetail;