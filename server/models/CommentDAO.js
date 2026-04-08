require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const CommentDAO = {
  // Lấy tất cả bình luận (admin)
  async selectAll() {
    return await Models.Comment.find()
      .sort({ createdAt: -1 })
      .exec();
  },

  // Lấy bình luận theo bài viết
  async selectByPostID(postId) {
    return await Models.Comment.find({
      post_id: new mongoose.Types.ObjectId(postId),
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .exec();
  },

  // Đếm tổng bình luận (dùng cho statistics)
  async selectByCount() {
    return await Models.Comment.countDocuments().exec();
  },

  // Thêm bình luận mới
  async insert(comment) {
    comment._id = new mongoose.Types.ObjectId();
    comment.createdAt = Date.now();
    comment.status = 'approved';
    return await Models.Comment.create(comment);
  },

  // Lấy N bình luận mới nhất (dùng cho activities)
  async selectRecent(limit = 8) {
    return await Models.Comment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  // Xóa bình luận
  async delete(_id) {
    return await Models.Comment.findByIdAndDelete(_id).exec();
  },
};

module.exports = CommentDAO;