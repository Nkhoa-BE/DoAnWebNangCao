import axios from 'axios';
import React, { Component } from 'react';
import AuthContext from '../contexts/AuthContext';
import CategoryDetail from './CategoryDetailComponent';
import './style/Category.css';

class Category extends Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null,
      searchTerm: ''
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  updateCategories = (categories) => {
    this.setState({ categories, itemSelected: null });
  };

  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config)
      .then((res) => this.setState({ categories: res.data }))
      .catch((err) => console.error('Lỗi khi lấy danh sách:', err));
  }

  render() {
    const { categories, itemSelected, searchTerm } = this.state;
    const filtered = categories.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const dotColors = ['cyan', 'pink', 'green', 'gold'];

    return (
      <div className="cat-wrap">

        {/* ══ LEFT PANEL: Danh sách ══ */}
        <div className="cat-panel cat-panel--left">

          <div className="cat-panel-header">
            <div className="cat-header-left">
              <span className="cat-header-icon">🗂️</span>
              <div>
                <h2 className="cat-panel-title">Danh Sách Thể Loại</h2>
                <p className="cat-panel-sub">{categories.length} thể loại · {filtered.length} hiển thị</p>
              </div>
            </div>
            <span className="cat-count-badge">{categories.length}</span>
          </div>

          <div className="cat-search-wrap">
            <span className="cat-search-ico">🔍</span>
            <input
              className="cat-search"
              type="text"
              placeholder="Tìm kiếm thể loại..."
              value={searchTerm}
              onChange={(e) => this.setState({ searchTerm: e.target.value })}
            />
            {searchTerm && (
              <button className="cat-search-clear" onClick={() => this.setState({ searchTerm: '' })}>✕</button>
            )}
          </div>

          <div className="cat-table-wrap">
            {filtered.length > 0 ? (
              <table className="cat-table">
                <thead>
                  <tr>
                    <th className="cat-th" style={{ width: 48 }}>#</th>
                    <th className="cat-th">Tên thể loại</th>
                    <th className="cat-th" style={{ width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, idx) => {
                    const isActive = itemSelected?._id === item._id;
                    const color = dotColors[idx % dotColors.length];
                    return (
                      <tr
                        key={item._id}
                        className={`cat-row${isActive ? ' cat-row--active' : ''}`}
                        onClick={() => this.trItemClick(item)}
                      >
                        <td className="cat-td cat-td--num">{idx + 1}</td>
                        <td className="cat-td cat-td--name">
                          <span className={`cat-dot cat-dot--${color}`} />
                          <span className="cat-name-text">{item.name}</span>
                          {isActive && <span className="cat-editing-tag">đang sửa</span>}
                        </td>
                        <td className="cat-td cat-td--arr">
                          <span className={`cat-arrow${isActive ? ' cat-arrow--active' : ''}`}>›</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="cat-empty">
                <div className="cat-empty-icon">🎮</div>
                <p className="cat-empty-text">Không tìm thấy thể loại nào</p>
                <p className="cat-empty-sub">Thử từ khóa khác hoặc thêm mới bên phải</p>
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL: Form ══ */}
        <div className="cat-panel cat-panel--right">

          <div className="cat-panel-header">
            <div className="cat-header-left">
              <span className="cat-header-icon">{itemSelected ? '✏️' : '➕'}</span>
              <div>
                <h2 className="cat-panel-title">
                  {itemSelected ? 'Chỉnh Sửa Thể Loại' : 'Thêm Thể Loại Mới'}
                </h2>
                <p className="cat-panel-sub">
                  {itemSelected
                    ? `Đang chỉnh: ${itemSelected.name}`
                    : 'Nhập tên và nhấn Thêm Mới'}
                </p>
              </div>
            </div>
            {itemSelected && (
              <button
                className="cat-deselect-btn"
                onClick={() => this.setState({ itemSelected: null })}
              >
                ✕ Bỏ chọn
              </button>
            )}
          </div>

          <div className="cat-detail-body">
            <CategoryDetail
              item={itemSelected}
              updateCategories={this.updateCategories}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Category;