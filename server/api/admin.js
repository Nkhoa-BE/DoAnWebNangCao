const express = require('express');
const router = express.Router();

// utils
const JwtUtil = require('../utils/JwtUtil');

// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const PostDAO = require('../models/PostDAO');
const CommentDAO = require('../models/CommentDAO');
const ReaderDAO = require('../models/ReaderDAO');

// --- AUTH ---
router.post('/login', async function (req, res) {
  const { username, password } = req.body;
  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
    if (admin) {
      const token = JwtUtil.genToken(username, password);
      res.json({ success: true, message: 'Login successful', token: token });
    } else {
      res.json({ success: false, message: 'Invalid username or password' });
    }
  } else {
    res.json({ success: false, message: 'Missing credentials' });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token is valid', token: token });
});

// --- CATEGORY ---
router.get('/categories', JwtUtil.checkToken, async function (req, res) {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

router.post('/categories', JwtUtil.checkToken, async function (req, res) {
  const name = req.body.name;
  const result = await CategoryDAO.insert({ name: name });
  res.json(result);
});

router.put('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const name = req.body.name;
  const result = await CategoryDAO.update({ _id: _id, name: name });
  res.json(result);
});

router.delete('/categories/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await CategoryDAO.delete(_id);
  res.json(result);
});

// --- POST ---
router.get("/posts", JwtUtil.checkToken, async function (req, res) {
  const noPosts = await PostDAO.selectByCount();
  const sizePage = 10;
  const noPages = Math.ceil(noPosts / sizePage);
  let curPage = req.query.page ? parseInt(req.query.page) : 1;
  const skip = (curPage - 1) * sizePage;
  const posts = await PostDAO.selectBySkipLimit(skip, sizePage);
  res.json({ posts: posts, noPages: noPages, curPage: curPage });
});

router.post('/posts', JwtUtil.checkToken, async function (req, res) {
  try {
    const { title, content, image, category: cid } = req.body;
    const category = await CategoryDAO.selectByID(cid);
    const post = {
      title,
      content,
      image,
      createdAt: new Date(),
      category
    };
    const result = await PostDAO.insert(post);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding post' });
  }
});

router.put('/posts/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const { title, content, image, category: cid } = req.body;
    const category = await CategoryDAO.selectByID(cid);
    const post = {
      _id,
      title,
      content,
      image,
      createdAt: new Date(),
      category
    };
    const result = await PostDAO.update(post);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating post' });
  }
});

router.delete('/posts/:id', JwtUtil.checkToken, async function (req, res) {
  const _id = req.params.id;
  const result = await PostDAO.delete(_id);
  res.json(result);
});

// --- STATISTICS ---
router.get('/statistics', JwtUtil.checkToken, async function (req, res) {
  try {
    const [noPosts, noUsers, noComments, latestPost] = await Promise.all([
      PostDAO.selectByCount(),
      ReaderDAO.selectByCount(),
      CommentDAO.selectByCount ? CommentDAO.selectByCount() : 0,
      PostDAO.selectBySkipLimit(0, 1),
    ]);
    res.json({
      totalPosts: noPosts,
      totalUsers: noUsers,
      totalComments: noComments,
      topPost: latestPost[0]?.title || 'N/A',   // tạm dùng bài mới nhất
      latestPost: latestPost[0]?.title || 'N/A',
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thống kê' });
  }
});

// --- ACTIVITIES ---
// Lấy 8 bình luận mới nhất làm "hoạt động gần đây"
router.get('/activities', JwtUtil.checkToken, async function (req, res) {
  try {
    const comments = await CommentDAO.selectRecent(8);
    const activities = comments.map((c) => ({
      type: 'comment',
      text: `${c.reader?.name || c.reader?.username || 'Ẩn danh'} bình luận: "${c.content?.substring(0, 50)}${c.content?.length > 50 ? '...' : ''}"`,
      time: c.createdAt,
    }));
    res.json(activities);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Toggle ẩn / hiện bài viết
router.patch('/posts/:id/toggle-hidden', JwtUtil.checkToken, async function (req, res) {
  try {
    const result = await PostDAO.toggleHidden(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi toggle hidden' });
  }
});

// Toggle ghim / bỏ ghim bài viết
router.patch('/posts/:id/toggle-pinned', JwtUtil.checkToken, async function (req, res) {
  try {
    const result = await PostDAO.togglePinned(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi toggle pinned' });
  }
});

// --- COMMENTS ---
router.get('/comments', JwtUtil.checkToken, async function (req, res) {
  try {
    const comments = await CommentDAO.selectAll();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.get('/comments/post/:postId', JwtUtil.checkToken, async function (req, res) {
  try {
    const comments = await CommentDAO.selectByPostID(req.params.postId);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

router.delete('/comments/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const result = await CommentDAO.delete(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// --- READERS ---

// [GET] /api/admin/readers/stats — thống kê tổng quan
router.get('/readers/stats', JwtUtil.checkToken, async function (req, res) {
  try {
    const [total, active, banned, newToday] = await Promise.all([
      ReaderDAO.selectByCount(),
      ReaderDAO.selectActiveCount(),
      ReaderDAO.selectBannedCount(),
      ReaderDAO.selectNewToday(),
    ]);
    res.json({ total, active, banned, newToday });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// [GET] /api/admin/readers — danh sách tất cả độc giả
router.get('/readers', JwtUtil.checkToken, async function (req, res) {
  try {
    const readers = await ReaderDAO.selectAll();
    // Map active (0/1) sang status string cho frontend
    const mapped = readers.map((r) => ({
      ...r,
      status: r.active === 1 ? 'active' : 'banned',
      role: r.role || 'user',
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// [GET] /api/admin/readers/:id/comments — bình luận của 1 độc giả
router.get('/readers/:id/comments', JwtUtil.checkToken, async function (req, res) {
  try {
    const comments = await ReaderDAO.selectCommentsByReader(req.params.id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// [PATCH] /api/admin/readers/:id/status — khóa / mở khóa
// Frontend gửi: { status: 'active' | 'banned' }
router.patch('/readers/:id/status', JwtUtil.checkToken, async function (req, res) {
  try {
    const { status } = req.body;
    if (!['active', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status không hợp lệ' });
    }
    const activeValue = status === 'active' ? 1 : 0;
    const updated = await ReaderDAO.updateActive(req.params.id, activeValue);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy độc giả' });
    }
    res.json({ success: true, message: `Đã ${status === 'active' ? 'mở khóa' : 'khóa'} tài khoản`, reader: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// [DELETE] /api/admin/readers/:id — xóa tài khoản
router.delete('/readers/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const result = await ReaderDAO.delete(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

module.exports = router;