import axios from 'axios';
import React, { Component } from 'react';
import AuthContext from '../contexts/AuthContext';
import './style/Comment.css';

function formatDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

class CommentComponent extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      loading: true,
      searchTerm: '',
      selectedPost: null,
      posts: [],
    };
  }

  componentDidMount() {
    this.apiGetAllComments();
    this.apiGetPosts();
  }

  apiGetAllComments() {
    this.setState({ loading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/comments', config)
      .then((res) => this.setState({ comments: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  apiGetCommentsByPost(postId) {
    this.setState({ loading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/comments/post/' + postId, config)
      .then((res) => this.setState({ comments: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  apiGetPosts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/posts?page=1', config)
      .then((res) => this.setState({ posts: res.data.posts || [] }))
      .catch(() => {});
  }

  apiDeleteComment(id) {
    if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/comments/' + id, config)
      .then(() => {
        this.setState((prev) => ({
          comments: prev.comments.filter((c) => c._id !== id),
        }));
      })
      .catch(() => alert('Xóa thất bại!'));
  }

  handlePostFilter(postId) {
    if (!postId) {
      this.setState({ selectedPost: null });
      this.apiGetAllComments();
    } else {
      const post = this.state.posts.find((p) => p._id === postId);
      this.setState({ selectedPost: post || null });
      this.apiGetCommentsByPost(postId);
    }
  }

  render() {
    const { comments, loading, searchTerm, selectedPost, posts } = this.state;

    // Tạo map postId -> title để lookup nhanh
    const postMap = {};
    posts.forEach((p) => { postMap[p._id] = p.title; });

    const filtered = comments.filter((c) => {
      const name = c.reader?.name || c.reader?.username || '';
      const content = c.content || '';
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return (
      <div className="cm-wrap">

        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-left">
            <span className="cm-header-icon">💬</span>
            <div>
              <h2 className="cm-title">Quản Lý Bình Luận</h2>
              <p className="cm-sub">
                {selectedPost
                  ? `Bài: "${selectedPost.title?.substring(0, 40)}..." — ${filtered.length} bình luận`
                  : `Tất cả — ${filtered.length} bình luận`}
              </p>
            </div>
          </div>
          <button className="cm-refresh-btn" onClick={() => this.apiGetAllComments()}>
            🔄 Tải lại
          </button>
        </div>

        {/* Toolbar */}
        <div className="cm-toolbar">
          <div className="cm-search-wrap">
            <span className="cm-search-ico">🔍</span>
            <input
              className="cm-search"
              type="text"
              placeholder="Tìm theo tên hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => this.setState({ searchTerm: e.target.value })}
            />
            {searchTerm && (
              <button className="cm-search-clear" onClick={() => this.setState({ searchTerm: '' })}>✕</button>
            )}
          </div>

          <select
            className="cm-filter-post"
            value={selectedPost?._id || ''}
            onChange={(e) => this.handlePostFilter(e.target.value)}
          >
            <option value="">Tất cả bài viết</option>
            {posts.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title?.substring(0, 50)}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="cm-loading">
            <div className="cm-spinner" />
            <p>Đang tải bình luận...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty">
            <div className="cm-empty-icon">📭</div>
            <p>Không có bình luận nào</p>
          </div>
        ) : (
          <div className="cm-list">
            {filtered.map((cmt) => (
              <CommentCard
                key={cmt._id}
                cmt={cmt}
                postTitle={postMap[cmt.post_id] || null}
                onDelete={(id) => this.apiDeleteComment(id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

function CommentCard({ cmt, postTitle, onDelete }) {
  const name = cmt.reader?.name || cmt.reader?.username || 'Ẩn danh';
  const username = cmt.reader?.username || '';
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <div className="cm-card">
      <div className="cm-card-avatar">{initial}</div>
      <div className="cm-card-body">
        <div className="cm-card-header">
          <div className="cm-card-user">
            <span className="cm-card-name">{name}</span>
            {username && <span className="cm-card-username">@{username}</span>}
          </div>
          <div className="cm-card-meta">
            <span className="cm-card-date">{formatDate(cmt.createdAt)}</span>
            <button
              className="cm-delete-btn"
              onClick={() => onDelete(cmt._id)}
              title="Xóa bình luận"
            >🗑️</button>
          </div>
        </div>

        <p className="cm-card-content">{cmt.content}</p>

        {/* Hiển thị tên bài viết thay vì Post ID hex */}
        {cmt.post_id && (
          <div className="cm-card-post-ref">
            <span className="cm-card-post-label">📄 Bài viết:</span>
            <span className="cm-card-post-title">
              {postTitle || `ID: ${cmt.post_id}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentComponent;