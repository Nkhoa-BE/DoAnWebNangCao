require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const PostDAO = {

  // Đếm tổng số bài
  async selectByCount(query = {}) {
    return await Models.Post.countDocuments(query).exec();
  },

  // Lấy bài viết theo trang (admin)
  async selectBySkipLimit(skip, limit, query = {}) {
    return await Models.Post.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ pinned: -1, createdAt: -1 })
      .exec();
    // KHÔNG dùng .populate() vì category là embedded object
  },

  // Lấy chi tiết theo ID
  async selectByID(_id) {
    return await Models.Post.findById(_id).exec();
  },

  // Thêm bài viết mới
  // Lưu ý: post.category phải là object { _id, name } lấy từ CategoryDAO.selectByID()
  async insert(post) {
    post._id = new mongoose.Types.ObjectId();
    post.createdAt = new Date();  // Date thay vì Date.now() (Number)
    post.hidden = false;
    post.pinned = false;
    return await Models.Post.create(post);
  },

  // Cập nhật bài viết
  async update(post) {
    const newValues = {
      title: post.title,
      content: post.content,
      image: post.image,
      category: post.category,  // object { _id, name }
      createdAt: new Date()
    };
    return await Models.Post.findByIdAndUpdate(post._id, newValues, { new: true });
  },

  // Toggle ẩn / hiện
  async toggleHidden(_id) {
    const post = await Models.Post.findById(_id);
    if (!post) return null;
    return await Models.Post.findByIdAndUpdate(
      _id,
      { hidden: !post.hidden },
      { new: true }
    );
  },

  // Toggle ghim / bỏ ghim
  async togglePinned(_id) {
    const post = await Models.Post.findById(_id);
    if (!post) return null;
    return await Models.Post.findByIdAndUpdate(
      _id,
      { pinned: !post.pinned },
      { new: true }
    );
  },

  // Xóa bài viết
  async delete(_id) {
    return await Models.Post.findByIdAndDelete(_id).exec();
  },

  // ── USER APIs ──────────────────────────────────

  // Lấy N bài mới nhất (dùng $ne: true để match cả doc không có field hidden)
  async selectTopNew(top) {
    return await Models.Post.find({ hidden: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(top)
      .exec();
  },

  // Lấy N bài hot (bài ghim, nếu thiếu thì bù bài mới)
  async selectTopHot(top) {
    const pinned = await Models.Post.find({ hidden: { $ne: true }, pinned: true })
      .sort({ createdAt: -1 })
      .limit(top)
      .exec();

    if (pinned.length >= top) return pinned;

    const pinnedIds = pinned.map(p => p._id);
    const more = await Models.Post.find({
      hidden: { $ne: true },
      _id: { $nin: pinnedIds }
    })
      .sort({ createdAt: -1 })
      .limit(top - pinned.length)
      .exec();

    return [...pinned, ...more];
  },

  // Lấy bài viết theo chuyên mục
  // category trong DB là embedded object { _id, name }
  // → phải query bằng 'category._id' với ObjectId
  async selectByCatID(cid) {
    return await Models.Post.find({
      'category._id': new mongoose.Types.ObjectId(cid),
      hidden: { $ne: true }
    })
      .sort({ pinned: -1, createdAt: -1 })
      .exec();
  },
  // Lấy tất cả bài viết (trang chủ)
  async selectAll() {
    return await Models.Post.find({ hidden: { $ne: true } })
      .sort({ pinned: -1, createdAt: -1 })
      .exec();
  },
  // Tìm kiếm theo từ khóa trong title
  async selectByKeyword(keyword) {
    return await Models.Post.find({
      hidden: { $ne: true },
      title: { $regex: keyword, $options: 'i' }
    })
      .sort({ createdAt: -1 })
      .exec();
  },
};

module.exports = PostDAO;