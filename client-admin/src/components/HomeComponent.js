import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/AuthContext';
import './style/Home.css';

// createdAt trong Comment là timestamp milliseconds (Number)
function timeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Vừa xong';
  if (mins < 60)  return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = { statistics: null, activities: [] };
  }

  componentDidMount() {
    this.apiGetStatistics();
    this.apiGetActivities();
  }

  apiGetStatistics() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/statistics', config).then((res) => {
      this.setState({ statistics: res.data });
    });
  }

  apiGetActivities() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/activities', config).then((res) => {
      this.setState({ activities: res.data });
    }).catch(() => {});
  }

  render() {
    const { statistics, activities } = this.state;

    if (!statistics) {
      return (
        <div className="dash-loading">
          <div className="loading-ring" />
          <div className="loading-text">Đang tải dữ liệu hệ thống...</div>
        </div>
      );
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
      <div className="esports-dashboard">
        {/* Header */}
        <div className="dash-header">
          <div className="dash-logo">⚡</div>
          <div className="dash-title-block">
            <h1>Admin Panel</h1>
            <span>Trung Tâm Esports · {dateStr} · {timeStr}</span>
          </div>
          <div className="dash-status">
            <span className="status-dot" />
            Hệ thống hoạt động
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-card-bg">📰</div>
            <div className="stat-label">Tổng bài viết</div>
            <div className="stat-value">{statistics.totalPosts?.toLocaleString() ?? '—'}</div>
            <div className="stat-footer">
              <span className="stat-badge up">↑ Đang hoạt động</span>
            </div>
          </div>

          <div className="stat-card pink">
            <div className="stat-card-bg">👥</div>
            <div className="stat-label">Người dùng</div>
            <div className="stat-value">{statistics.totalUsers?.toLocaleString() ?? '—'}</div>
            <div className="stat-footer">
              <span className="stat-badge hot">🔥 Tăng trưởng</span>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-card-bg">💬</div>
            <div className="stat-label">Bình luận</div>
            <div className="stat-value">{statistics.totalComments?.toLocaleString() ?? '—'}</div>
            <div className="stat-footer">
              <span className="stat-badge warn">⚠ Cần kiểm duyệt</span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="info-row">
          <div className="info-card">
            <div className="info-card-header">
              <div className="info-icon fire">🔥</div>
              <div className="info-card-title">Bài hot nhất hôm nay</div>
            </div>
            <div className="info-card-content">
              {statistics.topPost ?? 'Chưa có dữ liệu'}
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">
              <div className="info-icon clock">🕒</div>
              <div className="info-card-title">Bài đăng mới nhất</div>
            </div>
            <div className="info-card-content">
              {statistics.latestPost ?? 'Chưa có dữ liệu'}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="activity-section">
          <div className="section-header">
            <div className="section-title">Hoạt động gần đây</div>
          </div>

          <div className="activity-list">
            {activities.length === 0 ? (
              <div style={{ color: '#475569', padding: '16px 0', fontSize: 14 }}>
                Chưa có hoạt động nào
              </div>
            ) : (
              activities.map((item, i) => (
                <div className="activity-item" key={i}>
                  <span className="activity-dot cyan" />
                  <span className="activity-text">
                    💬 {item.text}
                  </span>
                  <span className="activity-time">{timeAgo(item.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Home;