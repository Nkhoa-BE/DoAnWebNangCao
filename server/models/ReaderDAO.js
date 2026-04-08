require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const ReaderDAO = {

  // Lấy tất cả độc giả (ẩn password, token)
  async selectAll() {
    return await Models.Reader.find({}, { password: 0, token: 0 })
      .sort({ _id: -1 })
      .lean()   // trả về plain object, _id được expose đúng
      .exec();
  },

  // Lấy theo ID
  async selectByID(id) {
    return await Models.Reader.findById(id, { password: 0, token: 0 })
      .lean()
      .exec();
  },

  // Đếm tổng
  async selectByCount() {
    return await Models.Reader.countDocuments().exec();
  },

  // Đếm đang hoạt động (active: 1)
  async selectActiveCount() {
    return await Models.Reader.countDocuments({ active: 1 }).exec();
  },

  // Đếm bị khóa (active: 0)
  async selectBannedCount() {
    return await Models.Reader.countDocuments({ active: 0 }).exec();
  },

  // Đếm user mới hôm nay (nếu schema có createdAt, không thì trả 0)
  async selectNewToday() {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return await Models.Reader.countDocuments({
        createdAt: { $gte: start, $lte: end }
      }).exec();
    } catch {
      return 0;
    }
  },

  // Cập nhật trạng thái active (1 = hoạt động, 0 = bị khóa)
  async updateActive(id, activeValue) {
    return await Models.Reader.findByIdAndUpdate(
      id,
      { $set: { active: activeValue } },
      { new: true, projection: { password: 0, token: 0 } }
    )
      .lean()
      .exec();
  },

  // Xóa độc giả
  async delete(id) {
    const result = await Models.Reader.findByIdAndDelete(id).exec();
    return { success: !!result, message: result ? 'Đã xóa thành công' : 'Không tìm thấy' };
  },

  // Lấy bình luận của 1 reader (Comment lưu reader embedded)
  async selectCommentsByReader(readerId) {
    return await Models.Comment.find(
      { 'reader._id': new mongoose.Types.ObjectId(readerId) }
    )
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  },

};

module.exports = ReaderDAO;