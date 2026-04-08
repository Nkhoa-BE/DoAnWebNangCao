const express = require('express');
const router = express.Router();

// --- UTILS ---
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');

// --- DAOS ---
const CategoryDAO = require('../models/CategoryDAO');
const PostDAO = require('../models/PostDAO');
const UserDAO = require('../models/UserDAO');
const CommentDAO = require('../models/CommentDAO');

// --- CATEGORY ---
router.get('/categories', async (req, res) => {
  const categories = await CategoryDAO.selectAll();
  res.json(categories);
});

// --- POSTS ---
router.get('/posts', async (req, res) => {
  const posts = await PostDAO.selectAll();
  res.json(posts);
});

router.get('/posts/new', async (req, res) => {
  const posts = await PostDAO.selectTopNew(3);
  res.json(posts);
});

router.get('/posts/hot', async (req, res) => {
  const posts = await PostDAO.selectTopHot(3);
  res.json(posts);
});

router.get('/posts/category/:cid', async (req, res) => {
  const posts = await PostDAO.selectByCatID(req.params.cid); 
  res.json(posts);
});

router.get('/posts/search/:keyword', async (req, res) => {
  const posts = await PostDAO.selectByKeyword(req.params.keyword);
  res.json(posts);
});

router.get('/posts/:id', async (req, res) => {
  const post = await PostDAO.selectByID(req.params.id);
  res.json(post);
});

// --- USER SIGNUP ---
router.post('/signup', async (req, res) => {
  const { username, password, name, email } = req.body;
  const dbUser = await UserDAO.selectByUsernameOrEmail(username, email);

  if (dbUser) {
    res.json({ success: false, message: 'Tên đăng nhập hoặc Email đã tồn tại!' });
  } else {
    const token = CryptoUtil.md5(new Date().getTime().toString());
    const newUser = { username, password, name, email, active: 0, token };
    const result = await UserDAO.insert(newUser);

    if (result) {
      const send = await EmailUtil.send(email, result._id, token);
      if (send) {
        res.json({ success: true, message: 'Đăng ký thành công! Hãy kiểm tra Email.' });
      } else {
        await UserDAO.delete(result._id); 
        res.json({ success: false, message: 'Gửi mail thất bại!' });
      }
    } else {
      res.json({ success: false, message: 'Lỗi lưu thông tin!' });
    }
  }
});

// --- USER ACTIVE ---
router.post('/active', async (req, res) => {
  const result = await UserDAO.active(req.body.id, req.body.token, 1);
  res.json(result ? { success: true, message: 'Kích hoạt thành công!' } : { success: false });
});

// --- USER LOGIN ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await UserDAO.selectByUsernameAndPassword(username, password);

  if (user && user.active === 1) {
    // Truyền _id vào Token
    const token = JwtUtil.genToken(user._id, user.username, user.password);
    res.json({ success: true, message: "Đăng nhập thành công!", token, user });
  } else {
    res.json({ success: false, message: "Sai tài khoản hoặc chưa kích hoạt!" });
  }
});

// --- CHECK TOKEN ---
router.get('/token', JwtUtil.checkToken, (req, res) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, token });
});

// --- MY PROFILE ---
router.put('/users/:id', JwtUtil.checkToken, async (req, res) => {
  const result = await UserDAO.update({ _id: req.params.id, ...req.body });
  res.json(result);
});

// --- COMMENTS ---
router.get('/comments/:postId', async (req, res) => {
  const comments = await CommentDAO.selectByPostID(req.params.postId);
  res.json(comments || []);
});

router.post('/comments', JwtUtil.checkToken, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const reader = await UserDAO.selectByUsernameOrEmail(req.decoded.username, '');

    if (reader && content?.trim()) {
      const newComment = {
        content: content.trim(),
        createdAt: new Date().getTime(),
        post_id: require('mongoose').Types.ObjectId.createFromHexString(postId),
        reader: {
          _id: reader._id,
          username: reader.username,
          name: reader.name,
          email: reader.email,
        }
      };
      const result = await CommentDAO.insert(newComment);
      res.json({ success: true, comment: result });
    } else {
      res.json({ success: false, message: "Dữ liệu không hợp lệ!" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// --- SAVED POSTS (CHỨC NĂNG MỚI) ---

router.put('/save-post', JwtUtil.checkToken, async (req, res) => {
  const result = await UserDAO.toggleSavePost(req.decoded.id, req.body.postId);
  res.json(result ? { success: true, message: "Cập nhật thành công!" } : { success: false });
});

router.get('/my-saved', JwtUtil.checkToken, async (req, res) => {
  const list = await UserDAO.getSavedPosts(req.decoded.id);
  res.json(list);
});

module.exports = router;