import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/AuthContext';
import PostDetail from './PostDetailComponent';
import './style/Post.css';

class Post extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null,
      searchTerm: '',
      filterCategory: '',
      categories: [],
      viewMode: 'table', // 'table' | 'grid'
    };
  }

  componentDidMount() {
    this.apiGetPosts(1);
    this.apiGetCategories();
  }

  updatePosts = (posts, noPages, curPage) => {
    this.setState({ posts, noPages, curPage, itemSelected: null });
  };

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  lnkPageClick(page) {
    this.apiGetPosts(page);
  }

  handleSearch = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleToggleHidden = (e, item) => {
    e.stopPropagation();
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.patch(`/api/admin/posts/${item._id}/toggle-hidden`, {}, config).then(() => {
      this.apiGetPosts(this.state.curPage);
    });
  };

  handleTogglePinned = (e, item) => {
    e.stopPropagation();
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.patch(`/api/admin/posts/${item._id}/toggle-pinned`, {}, config).then(() => {
      this.apiGetPosts(this.state.curPage);
    });
  };

  apiGetPosts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/posts?page=' + page, config).then((res) => {
      const result = res.data;
      this.setState({ posts: result.posts, noPages: result.noPages, curPage: result.curPage });
    }).catch(err => console.error('Lỗi lấy bài viết:', err));
  }

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      this.setState({ categories: res.data });
    });
  }

  render() {
    const { posts, noPages, curPage, itemSelected, searchTerm, filterCategory, categories, viewMode } = this.state;

    // Filter client-side
    const filtered = posts.filter((p) => {
      const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = filterCategory ? p.category?._id === filterCategory || p.category === filterCategory : true;
      return matchSearch && matchCat;
    });

    return (
      <div className="post-wrap">

        {/* ══ LEFT: Danh sách bài viết ══ */}
        <div className="post-panel post-panel--left">

          {/* Header */}
          <div className="post-panel-header">
            <div className="post-header-left">
              <span className="post-header-icon">📰</span>
              <div>
                <h2 className="post-panel-title">Quản Lý Bài Viết</h2>
                <p className="post-panel-sub">{posts.length} bài · trang {curPage}/{noPages}</p>
              </div>
            </div>
            <div className="post-header-right">
              <button
                className={`post-view-btn${viewMode === 'table' ? ' active' : ''}`}
                onClick={() => this.setState({ viewMode: 'table' })}
                title="Dạng bảng"
              >☰</button>
              <button
                className={`post-view-btn${viewMode === 'grid' ? ' active' : ''}`}
                onClick={() => this.setState({ viewMode: 'grid' })}
                title="Dạng lưới"
              >⊞</button>
            </div>
          </div>

          {/* Toolbar: Search + Filter */}
          <div className="post-toolbar">
            <div className="post-search-wrap">
              <span className="post-search-ico">🔍</span>
              <input
                className="post-search"
                type="text"
                placeholder="Tìm kiếm tiêu đề..."
                value={searchTerm}
                onChange={this.handleSearch}
              />
              {searchTerm && (
                <button className="post-search-clear" onClick={() => this.setState({ searchTerm: '' })}>✕</button>
              )}
            </div>
            <select
              className="post-filter-cat"
              value={filterCategory}
              onChange={(e) => this.setState({ filterCategory: e.target.value })}
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="post-list-wrap">
            {filtered.length === 0 ? (
              <div className="post-empty">
                <div className="post-empty-icon">📭</div>
                <p className="post-empty-text">Không có bài viết nào</p>
                <p className="post-empty-sub">Thử thay đổi bộ lọc hoặc thêm bài mới</p>
              </div>
            ) : viewMode === 'table' ? (
              <TableView
                posts={filtered}
                itemSelected={itemSelected}
                onRowClick={(item) => this.trItemClick(item)}
                onToggleHidden={this.handleToggleHidden}
                onTogglePinned={this.handleTogglePinned}
              />
            ) : (
              <GridView
                posts={filtered}
                itemSelected={itemSelected}
                onCardClick={(item) => this.trItemClick(item)}
                onToggleHidden={this.handleToggleHidden}
                onTogglePinned={this.handleTogglePinned}
              />
            )}
          </div>

          {/* Pagination */}
          {noPages > 1 && (
            <div className="post-pagination">
              <button
                className="post-page-btn"
                disabled={curPage === 1}
                onClick={() => this.lnkPageClick(curPage - 1)}
              >‹</button>
              {Array.from({ length: noPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`post-page-btn${p === curPage ? ' post-page-btn--active' : ''}`}
                  onClick={() => this.lnkPageClick(p)}
                >{p}</button>
              ))}
              <button
                className="post-page-btn"
                disabled={curPage === noPages}
                onClick={() => this.lnkPageClick(curPage + 1)}
              >›</button>
            </div>
          )}
        </div>

        {/* ══ RIGHT: Form chi tiết ══ */}
        <div className="post-panel post-panel--right">
          <div className="post-panel-header">
            <div className="post-header-left">
              <span className="post-header-icon">{itemSelected ? '✏️' : '➕'}</span>
              <div>
                <h2 className="post-panel-title">{itemSelected ? 'Chỉnh Sửa Bài Viết' : 'Thêm Bài Mới'}</h2>
                <p className="post-panel-sub">
                  {itemSelected ? `Đang sửa: ${itemSelected.title?.substring(0, 30)}...` : 'Điền thông tin bài viết'}
                </p>
              </div>
            </div>
            {itemSelected && (
              <button className="post-deselect-btn" onClick={() => this.setState({ itemSelected: null })}>
                ✕ Bỏ chọn
              </button>
            )}
          </div>
          <div className="post-detail-body">
            <PostDetail
              item={itemSelected}
              curPage={curPage}
              updatePosts={this.updatePosts}
            />
          </div>
        </div>

      </div>
    );
  }
}

/* ── Table View ── */
function TableView({ posts, itemSelected, onRowClick, onToggleHidden, onTogglePinned }) {
  return (
    <table className="post-table">
      <thead>
        <tr>
          <th className="post-th" style={{ width: 56 }}>Ảnh</th>
          <th className="post-th">Tiêu đề</th>
          <th className="post-th" style={{ width: 100 }}>Thể loại</th>
          <th className="post-th" style={{ width: 90 }}>Ngày đăng</th>
          <th className="post-th" style={{ width: 80 }}>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((item) => {
          const isActive = itemSelected?._id === item._id;
          const imgSrc = item.image
            ? (item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`)
            : null;
          return (
            <tr
              key={item._id}
              className={`post-row${isActive ? ' post-row--active' : ''}${item.hidden ? ' post-row--hidden' : ''}`}
              onClick={() => onRowClick(item)}
            >
              <td className="post-td">
                <div className="post-thumb-wrap">
                  {imgSrc
                    ? <img className="post-thumb" src={imgSrc} alt="" />
                    : <div className="post-thumb-placeholder">🖼</div>
                  }
                  {item.pinned && <span className="post-pin-badge">📌</span>}
                </div>
              </td>
              <td className="post-td post-td--title">
                <span className="post-title-text">{item.title}</span>
                <span className="post-content-preview">{item.content?.substring(0, 60)}...</span>
              </td>
              <td className="post-td">
                <span className="post-cat-tag">{item.category?.name || '—'}</span>
              </td>
              <td className="post-td post-td--date">
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="post-td">
                <div className="post-action-icons">
                  <button
                    className={`post-icon-btn${item.pinned ? ' post-icon-btn--pinned' : ''}`}
                    onClick={(e) => onTogglePinned(e, item)}
                    title={item.pinned ? 'Bỏ ghim' : 'Ghim bài'}
                  >📌</button>
                  <button
                    className={`post-icon-btn${item.hidden ? ' post-icon-btn--hidden' : ''}`}
                    onClick={(e) => onToggleHidden(e, item)}
                    title={item.hidden ? 'Hiện bài' : 'Ẩn bài'}
                  >{item.hidden ? '🙈' : '👁'}</button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ── Grid View ── */
function GridView({ posts, itemSelected, onCardClick, onToggleHidden, onTogglePinned }) {
  return (
    <div className="post-grid">
      {posts.map((item) => {
        const isActive = itemSelected?._id === item._id;
        const imgSrc = item.image
          ? (item.image.startsWith('data:') ? item.image : `data:image/jpeg;base64,${item.image}`)
          : null;
        return (
          <div
            key={item._id}
            className={`post-card${isActive ? ' post-card--active' : ''}${item.hidden ? ' post-card--hidden' : ''}`}
            onClick={() => onCardClick(item)}
          >
            <div className="post-card-img-wrap">
              {imgSrc
                ? <img className="post-card-img" src={imgSrc} alt="" />
                : <div className="post-card-img-placeholder">🖼️</div>
              }
              <div className="post-card-badges">
                {item.pinned && <span className="post-badge post-badge--pin">📌 Ghim</span>}
                {item.hidden && <span className="post-badge post-badge--hidden">🙈 Ẩn</span>}
              </div>
            </div>
            <div className="post-card-body">
              <span className="post-card-cat">{item.category?.name || '—'}</span>
              <p className="post-card-title">{item.title}</p>
              <p className="post-card-date">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
              <div className="post-card-actions">
                <button
                  className={`post-icon-btn${item.pinned ? ' post-icon-btn--pinned' : ''}`}
                  onClick={(e) => onTogglePinned(e, item)}
                  title={item.pinned ? 'Bỏ ghim' : 'Ghim'}
                >📌</button>
                <button
                  className={`post-icon-btn${item.hidden ? ' post-icon-btn--hidden' : ''}`}
                  onClick={(e) => onToggleHidden(e, item)}
                  title={item.hidden ? 'Hiện' : 'Ẩn'}
                >{item.hidden ? '🙈' : '👁'}</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Post;