import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

class Menu extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: '',
      activeCategory: null,
      showSearch: false,
    };
  }

  render() {
    const { categories, txtKeyword } = this.state;
    const { token, user, mysaved } = this.context;

    const cates = categories.map((item) => (
      <li key={item._id} className="esports-nav-item">
        <Link to={'/posts/category/' + item._id} className="esports-nav-link">
          {item.name.toUpperCase()}
        </Link>
      </li>
    ));

    return (
      <header className="esports-header">
        <div className="esports-header-inner">
          {/* Logo */}
          <Link to="/home" className="esports-logo">
            <span className="esports-logo-icon">E</span>
            <span className="esports-logo-text">
              TRUNG TÂM <span className="esports-logo-accent">ESPORTS</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="esports-nav">
            <ul className="esports-nav-list">
              <li className="esports-nav-item">
                <Link to="/home" className="esports-nav-link">TRANG CHỦ</Link>
              </li>
              {cates}
            </ul>
          </nav>

          {/* Right actions */}
          <div className="esports-header-actions">
            {/* Nút tìm kiếm */}
            <button
              className="esports-search-btn"
              onClick={() => this.toggleSearch()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {token ? (
              <>
                {/* Tin đã lưu (từ InformComponent) */}
                <Link to="/mysaved" className="esports-user-btn" title="Tin đã lưu">
                  🔖 {mysaved?.length || 0}
                </Link>

                {/* Hồ sơ */}
                <Link to="/myprofile" className="esports-user-btn">
                  @{user?.username || 'user'}
                </Link>

                {/* Đăng xuất */}
                <button
                  className="esports-logout-btn"
                  onClick={() => this.btnLogoutClick()}
                >
                  THOÁT
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="esports-user-btn">ĐĂNG NHẬP</Link>
                <Link to="/signup" className="esports-user-btn">ĐĂNG KÝ</Link>
              </>
            )}
          </div>
        </div>

        {/* Search bar dropdown */}
        {this.state.showSearch && (
          <div className="esports-search-bar">
            <form onSubmit={(e) => this.btnSearchClick(e)} className="esports-search-form">
              <input
                type="search"
                placeholder="Tìm kiếm tin tức T1, MSI, VCS..."
                className="esports-search-input"
                value={txtKeyword}
                onChange={(e) => this.setState({ txtKeyword: e.target.value })}
                autoFocus
              />
              <button type="submit" className="esports-search-submit">TÌM</button>
            </form>
          </div>
        )}
      </header>
    );
  }

  toggleSearch() {
    this.setState((prev) => ({ showSearch: !prev.showSearch }));
  }

  btnSearchClick(e) {
    e.preventDefault();
    const keyword = this.state.txtKeyword.trim();
    if (keyword) {
      this.props.navigate('/posts/search/' + keyword);
      this.setState({ txtKeyword: '', showSearch: false });
    }
  }

  btnLogoutClick() {
    this.context.setToken('');
    this.context.setUser(null);
    this.context.setMysaved([]);
    this.props.navigate('/home');
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  apiGetCategories() {
    axios.get('/api/user/categories').then((res) => {
      this.setState({ categories: res.data });
    });
  }
}

export default withRouter(Menu);