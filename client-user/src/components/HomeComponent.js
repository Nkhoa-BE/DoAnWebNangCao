import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import './style/Home.css'
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
  });
}

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allPosts: [],
      loading: true,
      pageTitle: '',
      filterMode: false, // true khi đang lọc theo category/search
    };
  }

  componentDidMount() {
    const params = this.props.params || {};
    if (params.cid) {
      this.apiGetPostsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetPostsByKeyword(params.keyword);
    } else {
      this.apiGetAllPosts();
    }
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params || {};
    const prev = prevProps.params || {};
    if (params.cid && params.cid !== prev.cid) {
      this.apiGetPostsByCatID(params.cid);
    } else if (params.keyword && params.keyword !== prev.keyword) {
      this.apiGetPostsByKeyword(params.keyword);
    }
  }

  apiGetAllPosts() {
    this.setState({ loading: true });
    axios.get('/api/user/posts').then((res) => {
      this.setState({ allPosts: res.data, loading: false, filterMode: false });
    }).catch(() => this.setState({ loading: false }));
  }

  apiGetPostsByCatID(cid) {
    this.setState({ loading: true });
    axios.get('/api/user/posts/category/' + cid).then((res) => {
      const posts = res.data;
      const catName = posts[0]?.category?.name || 'Thể Loại';
      this.setState({ allPosts: posts, loading: false, pageTitle: catName, filterMode: true });
    }).catch(() => this.setState({ loading: false }));
  }

  apiGetPostsByKeyword(keyword) {
    this.setState({ loading: true });
    axios.get('/api/user/posts/search/' + keyword).then((res) => {
      this.setState({
        allPosts: res.data,
        loading: false,
        pageTitle: `Kết quả: "${keyword}"`,
        filterMode: true,
      });
    }).catch(() => this.setState({ loading: false }));
  }

  render() {
    const { allPosts, loading, filterMode, pageTitle } = this.state;

    if (loading) {
      return (
        <div className="hn-loading">
          <div className="hn-spinner" />
          <p>Đang tải bài viết...</p>
        </div>
      );
    }

    // Nếu đang lọc theo category/search thì hiện dạng grid đơn giản
    if (filterMode) {
      return (
        <div className="hn-wrap">
          <div className="hn-section-header">
            <span className="hn-section-bar" />
            <h2 className="hn-section-title">{pageTitle}</h2>
          </div>
          {allPosts.length === 0 ? (
            <div className="hn-empty">
              <div className="hn-empty-icon">📭</div>
              <p>Không có bài viết nào</p>
            </div>
          ) : (
            <div className="hn-grid">
              {allPosts.map((item, idx) => (
                <NewsCard key={item._id} post={item} idx={idx} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Trang chủ đầy đủ
    const heroPost = allPosts[0] || null;
    const latestPosts = allPosts.slice(1, 7);
    const trendingPosts = allPosts.slice(0, 5);

    return (
      <div className="hn-home">
        {/* ===== HERO ===== */}
        {heroPost && (
          <section className="hn-hero">
            <Link to={'/posts/' + heroPost._id} className="hn-hero-link">
              <div className="hn-hero-bg">
                {getImageSrc(heroPost.image) && (
                  <img
                    className="hn-hero-img"
                    src={getImageSrc(heroPost.image)}
                    alt={heroPost.title}
                  />
                )}
                <div className="hn-hero-overlay" />
              </div>
              <div className="hn-hero-content">
                <span className="hn-hero-badge">TIN NỔI BẬT</span>
                <h1 className="hn-hero-title">{heroPost.title}</h1>
                <p className="hn-hero-desc">
                  {heroPost.summary || heroPost.content?.substring(0, 150)}
                </p>
              </div>
            </Link>
          </section>
        )}

        {/* ===== MAIN CONTENT + SIDEBAR ===== */}
        <div className="hn-body">
          {/* Latest News */}
          <div className="hn-main">
            <div className="hn-section-header">
              <span className="hn-section-bar" />
              <h2 className="hn-section-title">TIN MỚI CẬP NHẬT</h2>
            </div>
            <div className="hn-grid">
              {latestPosts.map((item, idx) => (
                <NewsCard key={item._id} post={item} idx={idx} />
              ))}
            </div>
          </div>

          {/* Sidebar Trending */}
          <aside className="hn-sidebar">
            <div className="hn-sidebar-box">
              <div className="hn-sidebar-header">
                <span className="hn-sidebar-icon">⚡</span>
                <h3 className="hn-sidebar-title">Kết quả trực tuyến</h3>
              </div>
              <p className="hn-sidebar-sub">LCK REGULAR SEASON</p>
              <div className="hn-live-badge">LIVE</div>
            </div>

            <div className="hn-sidebar-box" style={{ marginTop: '20px' }}>
              <div className="hn-sidebar-header">
                <span className="hn-sidebar-icon">🔥</span>
                <h3 className="hn-sidebar-title">Bài viết nổi bật</h3>
              </div>
              <ul className="hn-trending-list">
                {trendingPosts.map((item, idx) => (
                  <li key={item._id} className="hn-trending-item">
                    <Link to={'/posts/' + item._id} className="hn-trending-link">
                      <span className="hn-trending-num">{String(idx + 1).padStart(2, '0')}</span>
                      <div className="hn-trending-info">
                        <p className="hn-trending-title">{item.title}</p>
                        <span className="hn-trending-cat">{item.category?.name}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    );
  }
}

// Sub-component: NewsCard
function NewsCard({ post, idx }) {
  const imgSrc = getImageSrc(post.image);
  return (
    <Link
      to={'/posts/' + post._id}
      className="hn-card"
      style={{ animationDelay: `${idx * 0.06}s` }}
    >
      <div className="hn-card-img-wrap">
        {imgSrc
          ? <img className="hn-card-img" src={imgSrc} alt={post.title} />
          : <div className="hn-card-img-ph">🎮</div>
        }
        <span className="hn-card-badge">Tin mới</span>
      </div>
      <div className="hn-card-body">
        {post.category?.name && (
          <span className="hn-card-cat">{post.category.name}</span>
        )}
        <h3 className="hn-card-title">{post.title}</h3>
        <p className="hn-card-desc">
          {(post.summary || post.content)?.substring(0, 80)}...
        </p>
        <div className="hn-card-meta">
          <span className="hn-card-date">{formatDate(post.createdAt)}</span>
          {post.author && <span className="hn-card-author">{post.author}</span>}
        </div>
      </div>
    </Link>
  );
}

export default withRouter(Home);