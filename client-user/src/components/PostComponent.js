import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
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
  });
}

class Post extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      loading: true,
      pageTitle: '',
    };
  }

  componentDidMount() {
    const params = this.props.params || {};
    if (params.cid) {
      this.apiGetPostsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetPostsByKeyword(params.keyword);
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

  apiGetPostsByCatID(cid) {
    this.setState({ loading: true });
    axios.get('/api/user/posts/category/' + cid).then((res) => {
      const posts = res.data;
      const catName = posts[0]?.category?.name || 'Thể Loại';
      this.setState({ posts, loading: false, pageTitle: catName });
    }).catch(() => this.setState({ loading: false }));
  }

  apiGetPostsByKeyword(keyword) {
    this.setState({ loading: true });
    axios.get('/api/user/posts/search/' + keyword).then((res) => {
      this.setState({
        posts: res.data,
        loading: false,
        pageTitle: `Kết quả: "${keyword}"`,
      });
    }).catch(() => this.setState({ loading: false }));
  }

  render() {
    const { posts, loading, pageTitle } = this.state;

    if (loading) {
      return (
        <div className="hn-loading">
          <div className="hn-spinner" />
          <p>Đang tải bài viết...</p>
        </div>
      );
    }

    return (
      <div className="hn-wrap">
        <div className="hn-section-header">
          <span className="hn-section-bar" />
          <h2 className="hn-section-title">{pageTitle}</h2>
        </div>

        {posts.length === 0 ? (
          <div className="hn-empty">
            <div className="hn-empty-icon">📭</div>
            <p>Không có bài viết nào</p>
          </div>
        ) : (
          <div className="hn-grid">
            {posts.map((item, idx) => (
              <NewsCard key={item._id} post={item} idx={idx} />
            ))}
          </div>
        )}
      </div>
    );
  }
}

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

export default withRouter(Post);