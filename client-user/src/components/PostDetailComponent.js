import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import './style/Home.css';

function getImageSrc(image) {
  if (!image) return null;
  if (image.startsWith('data:') || image.startsWith('http')) return image;
  if (image.length > 200) return 'data:image/jpeg;base64,' + image;
  return '/images/' + image;
}

function formatDate(createdAt) {
  if (!createdAt) return '';
  return new Date(createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

class PostDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      post: null,
      loading: true,
      saved: false,
      // comment
      comments: [],
      commentText: '',
      commentLoading: false,
      commentError: '',
    };
  }

  componentDidMount() {
    const { id } = this.props.params;
    this.apiGetPost(id);
    this.apiGetComments(id);
  }

  componentDidUpdate(prevProps) {
    const { id } = this.props.params;
    if (id !== prevProps.params.id) {
      this.setState({ loading: true, post: null, comments: [] });
      this.apiGetPost(id);
      this.apiGetComments(id);
    }
  }

  // ── POST ──────────────────────────────────────────
  apiGetPost(id) {
    axios.get('/api/user/posts/' + id)
      .then((res) => this.setState({ post: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  btnSavePostClick(e) {
    e.preventDefault();
    if (!this.context.token) {
      alert('Vui lòng đăng nhập để lưu bài viết!');
      return;
    }
    const { post, saved } = this.state;
    if (saved) { alert('Bài viết này đã được lưu trước đó!'); return; }
    const mysaved = [...this.context.mysaved];
    if (mysaved.findIndex(x => x._id === post._id) === -1) {
      mysaved.push(post);
      this.context.setMysaved(mysaved);
      this.setState({ saved: true });
      alert('Đã lưu bài viết!');
    } else {
      alert('Bài viết này đã được lưu trước đó!');
    }
  }

  // ── COMMENTS ──────────────────────────────────────
  apiGetComments(postId) {
    axios.get('/api/user/comments/' + postId)
      .then((res) => this.setState({ comments: res.data }))
      .catch(() => {});
  }

  apiPostComment() {
    const { post, commentText, comments } = this.state;
    const token = this.context.token;

    if (!token) {
      this.setState({ commentError: 'Vui lòng đăng nhập để bình luận!' });
      return;
    }
    if (!commentText.trim()) {
      this.setState({ commentError: 'Nội dung bình luận không được trống!' });
      return;
    }

    this.setState({ commentLoading: true, commentError: '' });

    axios.post('/api/user/comments',
      { postId: post._id, content: commentText },
      { headers: { 'x-access-token': token } }
    ).then((res) => {
      if (res.data.success) {
        this.setState({
          comments: [res.data.comment, ...comments],
          commentText: '',
          commentLoading: false,
        });
      } else {
        this.setState({ commentError: res.data.message, commentLoading: false });
      }
    }).catch(() => {
      this.setState({ commentError: 'Lỗi kết nối!', commentLoading: false });
    });
  }

  // ── RENDER ────────────────────────────────────────
  render() {
    const { post, loading, saved, comments, commentText, commentLoading, commentError } = this.state;
    const isLoggedIn = !!this.context.token;
    const user = this.context.user;

    if (loading) {
      return (
        <div className="pd-loading">
          <div className="pd-spinner" />
          <p>Đang tải bài viết...</p>
        </div>
      );
    }

    if (!post) {
      return (
        <div className="pd-error">
          <h2>Không tìm thấy bài viết</h2>
          <Link to="/home" className="pd-back-btn">← Về trang chủ</Link>
        </div>
      );
    }

    const imgSrc = getImageSrc(post.image);

    return (
      <div className="pd-wrap">
        <div className="pd-container">

          {/* Breadcrumb */}
          <nav className="pd-breadcrumb">
            <Link to="/home" className="pd-breadcrumb-link">Trang chủ</Link>
            <span className="pd-breadcrumb-sep"> / </span>
            {post.category?.name && (
              <>
                <span className="pd-breadcrumb-link">{post.category.name}</span>
                <span className="pd-breadcrumb-sep"> / </span>
              </>
            )}
            <span className="pd-breadcrumb-current">{post.title?.substring(0, 40)}...</span>
          </nav>

          <article className="pd-article">
            {post.category?.name && (
              <span className="pd-cat-tag">{post.category.name.toUpperCase()}</span>
            )}
            <h1 className="pd-title">{post.title}</h1>

            <div className="pd-meta">
              {post.author && (
                <span className="pd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                  {post.author}
                </span>
              )}
              {post.createdAt && (
                <span className="pd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                  </svg>
                  {formatDate(post.createdAt)}
                </span>
              )}
              <button
                className={`pd-save-btn ${saved ? 'pd-save-btn--saved' : ''}`}
                onClick={(e) => this.btnSavePostClick(e)}
              >
                {saved ? '✓ Đã lưu' : '💾 Lưu bài'}
              </button>
            </div>

            {post.summary && <p className="pd-summary">{post.summary}</p>}

            {imgSrc && (
              <div className="pd-img-wrap">
                <img className="pd-img" src={imgSrc} alt={post.title} />
              </div>
            )}

            <div className="pd-content">
              {post.content?.split('\n').map((para, i) =>
                para.trim() ? <p key={i}>{para}</p> : <br key={i} />
              )}
            </div>

            <div className="pd-footer">
              <Link to="/home" className="pd-back-link">← Quay lại trang chủ</Link>
              <button
                className={`pd-save-btn-lg ${saved ? 'pd-save-btn--saved' : ''}`}
                onClick={(e) => this.btnSavePostClick(e)}
              >
                {saved ? '✓ Đã lưu bài viết' : '💾 Lưu bài viết'}
              </button>
            </div>
          </article>

          {/* ===== BÌNH LUẬN ===== */}
          <section className="cmt-section">
            <div className="hn-section-header">
              <span className="hn-section-bar" />
              <h2 className="hn-section-title">
                Bình luận ({comments.length})
              </h2>
            </div>

            {/* Form gửi bình luận */}
            {isLoggedIn ? (
              <div className="cmt-form">
                <div className="cmt-form-avatar">
                  {(user?.name || user?.username || 'U')[0].toUpperCase()}
                </div>
                <div className="cmt-form-right">
                  <textarea
                    className="cmt-input"
                    placeholder="Viết bình luận của bạn..."
                    value={commentText}
                    rows={3}
                    onChange={(e) => this.setState({ commentText: e.target.value, commentError: '' })}
                  />
                  {commentError && <p className="cmt-error">{commentError}</p>}
                  <div className="cmt-form-actions">
                    <span className="cmt-form-user">
                      Đang đăng nhập: <strong>{user?.name || user?.username}</strong>
                    </span>
                    <button
                      className="cmt-submit-btn"
                      disabled={commentLoading}
                      onClick={() => this.apiPostComment()}
                    >
                      {commentLoading ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="cmt-login-prompt">
                <p>
                  Vui lòng <Link to="/login" className="auth-link">đăng nhập</Link> để bình luận.
                </p>
              </div>
            )}

            {/* Danh sách bình luận */}
            <div className="cmt-list">
              {comments.length === 0 ? (
                <div className="cmt-empty">
                  <span>💬</span>
                  <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                </div>
              ) : (
                comments.map((cmt) => (
                  <div key={cmt._id} className="cmt-item">
                    <div className="cmt-avatar">
                      {(cmt.reader?.name || cmt.reader?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div className="cmt-body">
                      <div className="cmt-header">
                        <span className="cmt-name">{cmt.reader?.name || cmt.reader?.username}</span>
                        <span className="cmt-date">{formatDate(cmt.createdAt)}</span>
                      </div>
                      <p className="cmt-content">{cmt.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>
      </div>
    );
  }
}

export default withRouter(PostDetail);