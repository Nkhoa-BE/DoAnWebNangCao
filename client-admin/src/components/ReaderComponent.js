import axios from 'axios';
import React, { Component } from 'react';
import AuthContext from '../contexts/AuthContext';
import './style/Reader.css';

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateShort(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
class ReaderComponent extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      readers: [],
      loading: true,
      searchTerm: '',
      filterRole: '',    // '' | 'admin' | 'user'
      filterStatus: '',  // '' | 'active' | 'banned'
      selectedReader: null, // user đang xem chi tiết
      detailComments: [],
      detailLoading: false,
      stats: null,
    };
  }

  componentDidMount() {
    this.apiGetReaders();
    this.apiGetStats();
  }

  // ── API ──────────────────────────────────────
  apiGetReaders() {
    this.setState({ loading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/readers', config)
      .then((res) => this.setState({ readers: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  apiGetStats() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/readers/stats', config)
      .then((res) => this.setState({ stats: res.data }))
      .catch(() => {});
  }

  apiToggleBan(reader) {
    const isBanned = reader.status === 'banned';
    const action = isBanned ? 'mở khóa' : 'khóa';
    if (!window.confirm(`Bạn chắc chắn muốn ${action} tài khoản "${reader.name || reader.username}"?`)) return;

    const config = { headers: { 'x-access-token': this.context.token } };
    const newStatus = isBanned ? 'active' : 'banned';
    axios.patch(`/api/admin/readers/${reader._id}/status`, { status: newStatus }, config)
      .then(() => {
        this.setState((prev) => ({
          readers: prev.readers.map((r) =>
            r._id === reader._id ? { ...r, status: newStatus } : r
          ),
          selectedReader: prev.selectedReader?._id === reader._id
            ? { ...prev.selectedReader, status: newStatus }
            : prev.selectedReader,
        }));
      })
      .catch(() => alert(`${action.charAt(0).toUpperCase() + action.slice(1)} thất bại!`));
  }

  apiDeleteReader(reader) {
    if (!window.confirm(`⚠️ Xóa vĩnh viễn tài khoản "${reader.name || reader.username}"?\nHành động này không thể hoàn tác!`)) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete(`/api/admin/readers/${reader._id}`, config)
      .then(() => {
        this.setState((prev) => ({
          readers: prev.readers.filter((r) => r._id !== reader._id),
          selectedReader: null,
        }));
      })
      .catch(() => alert('Xóa thất bại!'));
  }

  apiGetReaderDetail(reader) {
    this.setState({ selectedReader: reader, detailLoading: true, detailComments: [] });
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get(`/api/admin/readers/${reader._id}/comments`, config)
      .then((res) => this.setState({ detailComments: res.data, detailLoading: false }))
      .catch(() => this.setState({ detailLoading: false }));
  }

  apiDeleteComment(commentId) {
    if (!window.confirm('Xóa bình luận này?')) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete(`/api/admin/comments/${commentId}`, config)
      .then(() => {
        this.setState((prev) => ({
          detailComments: prev.detailComments.filter((c) => c._id !== commentId),
        }));
      })
      .catch(() => alert('Xóa thất bại!'));
  }

  // ── FILTER ──────────────────────────────────
  getFiltered() {
    const { readers, searchTerm, filterRole, filterStatus } = this.state;
    return readers.filter((r) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        (r.name || '').toLowerCase().includes(term) ||
        (r.username || '').toLowerCase().includes(term) ||
        (r.email || '').toLowerCase().includes(term);
      const matchRole = !filterRole || r.role === filterRole;
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchRole && matchStatus;
    });
  }

  // ── RENDER ───────────────────────────────────
  render() {
    const { loading, searchTerm, filterRole, filterStatus, selectedReader, detailComments, detailLoading, stats } = this.state;
    const filtered = this.getFiltered();

    return (
      <div className="rd-wrap">

        {/* ── STATS BAR ── */}
        {stats && (
          <div className="rd-stats-bar">
            <StatCard icon="👥" label="Tổng độc giả" value={stats.total ?? '—'} color="blue" />
            <StatCard icon="🆕" label="Mới hôm nay" value={stats.newToday ?? '—'} color="green" />
            <StatCard icon="✅" label="Đang hoạt động" value={stats.active ?? '—'} color="cyan" />
            <StatCard icon="🔒" label="Đã khóa" value={stats.banned ?? '—'} color="red" />
          </div>
        )}

        {/* ── HEADER ── */}
        <div className="rd-header">
          <div className="rd-header-left">
            <span className="rd-header-icon">👤</span>
            <div>
              <h2 className="rd-title">Quản Lý Độc Giả</h2>
              <p className="rd-sub">Tất cả — {filtered.length} người dùng</p>
            </div>
          </div>
          <button className="rd-refresh-btn" onClick={() => this.apiGetReaders()}>
            🔄 Tải lại
          </button>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="rd-toolbar">
          <div className="rd-search-wrap">
            <span className="rd-search-ico">🔍</span>
            <input
              className="rd-search"
              type="text"
              placeholder="Tìm theo tên, username, email..."
              value={searchTerm}
              onChange={(e) => this.setState({ searchTerm: e.target.value })}
            />
            {searchTerm && (
              <button className="rd-search-clear" onClick={() => this.setState({ searchTerm: '' })}>✕</button>
            )}
          </div>

          <select className="rd-filter" value={filterRole} onChange={(e) => this.setState({ filterRole: e.target.value })}>
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select className="rd-filter" value={filterStatus} onChange={(e) => this.setState({ filterStatus: e.target.value })}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="banned">Đã khóa</option>
          </select>
        </div>

        {/* ── TABLE ── */}
        {loading ? (
          <div className="rd-loading">
            <div className="rd-spinner" />
            <p>Đang tải danh sách độc giả...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rd-empty">
            <div className="rd-empty-icon">📭</div>
            <p>Không tìm thấy người dùng nào</p>
          </div>
        ) : (
          <div className="rd-table-wrap">
            <table className="rd-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => (
                  <ReaderRow
                    key={r._id}
                    reader={r}
                    index={idx + 1}
                    onDetail={() => this.apiGetReaderDetail(r)}
                    onToggleBan={() => this.apiToggleBan(r)}
                    onDelete={() => this.apiDeleteReader(r)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── DETAIL PANEL ── */}
        {selectedReader && (
          <DetailPanel
            reader={selectedReader}
            comments={detailComments}
            loading={detailLoading}
            onClose={() => this.setState({ selectedReader: null })}
            onToggleBan={() => this.apiToggleBan(selectedReader)}
            onDeleteComment={(id) => this.apiDeleteComment(id)}
            onDelete={() => this.apiDeleteReader(selectedReader)}
          />
        )}
      </div>
    );
  }
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className={`rd-stat-card rd-stat-${color}`}>
      <span className="rd-stat-icon">{icon}</span>
      <div>
        <div className="rd-stat-value">{value}</div>
        <div className="rd-stat-label">{label}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────
function ReaderRow({ reader, index, onDetail, onToggleBan, onDelete }) {
  const name = reader.name || reader.username || 'Ẩn danh';
  const initial = name[0]?.toUpperCase() || '?';
  const isBanned = reader.status === 'banned';
  const isAdmin = reader.role === 'admin';

  return (
    <tr className={isBanned ? 'rd-row-banned' : ''}>
      <td className="rd-td-index">{index}</td>
      <td>
        <div className="rd-user-cell">
          <div className={`rd-avatar rd-avatar-${isAdmin ? 'admin' : 'user'}`}>{initial}</div>
          <div>
            <div className="rd-name">{name}</div>
            {reader.username && <div className="rd-username-small">@{reader.username}</div>}
          </div>
        </div>
      </td>
      <td className="rd-td-email">{reader.email || '—'}</td>
      <td>
        <span className={`rd-badge rd-badge-role-${reader.role || 'user'}`}>
          {isAdmin ? '👑 Admin' : '👤 User'}
        </span>
      </td>
      <td>
        <span className={`rd-badge rd-badge-status-${isBanned ? 'banned' : 'active'}`}>
          {isBanned ? '🔒 Khóa' : '✅ Active'}
        </span>
      </td>
      <td className="rd-td-date">{formatDateShort(reader.createdAt)}</td>
      <td>
        <div className="rd-actions">
          <button className="rd-btn rd-btn-detail" onClick={onDetail} title="Xem chi tiết">🔍</button>
          <button
            className={`rd-btn ${isBanned ? 'rd-btn-unban' : 'rd-btn-ban'}`}
            onClick={onToggleBan}
            title={isBanned ? 'Mở khóa' : 'Khóa tài khoản'}
          >
            {isBanned ? '🔓' : '🔒'}
          </button>
          <button className="rd-btn rd-btn-delete" onClick={onDelete} title="Xóa tài khoản">🗑️</button>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────
// DETAIL PANEL (slide-in overlay)
// ─────────────────────────────────────────────
function DetailPanel({ reader, comments, loading, onClose, onToggleBan, onDeleteComment, onDelete }) {
  const name = reader.name || reader.username || 'Ẩn danh';
  const initial = name[0]?.toUpperCase() || '?';
  const isBanned = reader.status === 'banned';
  const isAdmin = reader.role === 'admin';

  return (
    <div className="rd-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rd-detail-panel">

        {/* Header */}
        <div className="rd-detail-header">
          <h3 className="rd-detail-title">Chi tiết người dùng</h3>
          <button className="rd-detail-close" onClick={onClose}>✕</button>
        </div>

        {/* Profile */}
        <div className="rd-detail-profile">
          <div className={`rd-detail-avatar rd-avatar-${isAdmin ? 'admin' : 'user'}`}>{initial}</div>
          <div className="rd-detail-info">
            <div className="rd-detail-name">{name}</div>
            {reader.username && <div className="rd-detail-un">@{reader.username}</div>}
            <div className="rd-detail-email">✉️ {reader.email || '—'}</div>
            <div className="rd-detail-badges">
              <span className={`rd-badge rd-badge-role-${reader.role || 'user'}`}>
                {isAdmin ? '👑 Admin' : '👤 User'}
              </span>
              <span className={`rd-badge rd-badge-status-${isBanned ? 'banned' : 'active'}`}>
                {isBanned ? '🔒 Đã khóa' : '✅ Hoạt động'}
              </span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="rd-detail-meta">
          <div className="rd-meta-item">
            <span className="rd-meta-label">Ngày tạo</span>
            <span className="rd-meta-value">{formatDate(reader.createdAt)}</span>
          </div>
          <div className="rd-meta-item">
            <span className="rd-meta-label">Đăng nhập cuối</span>
            <span className="rd-meta-value">{formatDate(reader.lastLogin)}</span>
          </div>
          <div className="rd-meta-item">
            <span className="rd-meta-label">Số bình luận</span>
            <span className="rd-meta-value">{loading ? '...' : comments.length}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="rd-detail-actions">
          <button
            className={`rd-detail-btn ${isBanned ? 'rd-detail-btn-unban' : 'rd-detail-btn-ban'}`}
            onClick={onToggleBan}
          >
            {isBanned ? '🔓 Mở khóa tài khoản' : '🔒 Khóa tài khoản'}
          </button>
          <button className="rd-detail-btn rd-detail-btn-delete" onClick={onDelete}>
            🗑️ Xóa tài khoản
          </button>
        </div>

        {/* Comments */}
        <div className="rd-detail-comments">
          <h4 className="rd-detail-comments-title">
            💬 Bình luận đã viết ({loading ? '...' : comments.length})
          </h4>

          {loading ? (
            <div className="rd-loading-small">
              <div className="rd-spinner-small" /> Đang tải...
            </div>
          ) : comments.length === 0 ? (
            <div className="rd-no-comments">Chưa có bình luận nào</div>
          ) : (
            <div className="rd-comment-list">
              {comments.map((c) => (
                <div key={c._id} className="rd-comment-item">
                  <div className="rd-comment-top">
                    <span className="rd-comment-date">{formatDate(c.createdAt)}</span>
                    <button
                      className="rd-comment-del"
                      onClick={() => onDeleteComment(c._id)}
                      title="Xóa bình luận"
                    >🗑️</button>
                  </div>
                  <p className="rd-comment-content">{c.content}</p>
                  {c.post_id && (
                    <span className="rd-comment-postid">Bài: {c.post?.title || c.post_id}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ReaderComponent;