require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const UserDAO = {
  async selectByUsernameOrEmail(username, email) {
    const query = { $or: [{ username: username }, { email: email }] };
    return await Models.Reader.findOne(query); 
  },

  async insert(user) {
    user._id = new mongoose.Types.ObjectId();
    return await Models.Reader.create(user); 
  },

  async delete(_id) {
    return await Models.Reader.findByIdAndDelete(_id);
  },

  async active(_id, token, active) {
    const query = { _id: _id, token: token };
    const newvalues = { active: active };
    return await Models.Reader.findOneAndUpdate(query, newvalues, { new: true });
  },

  async selectByUsernameAndPassword(username, password) {
    const query = { username: username, password: password, active: 1 };
    return await Models.Reader.findOne(query);
  },
  
  async selectByID(_id) {
    return await Models.Reader.findById(_id);
  },

  async update(user) {
    const newvalues = {
      username: user.username,
      password: user.password,
      name: user.name,
      email: user.email,
    };
    return await Models.Reader.findByIdAndUpdate(user._id, newvalues, { new: true });
  },

  // HÀM MỚI: Xử lý Lưu/Bỏ lưu bài viết (Toggle)
  async toggleSavePost(userId, postId) {
    const user = await Models.Reader.findById(userId);
    if (!user) return null;

    const isSaved = user.saved_posts && user.saved_posts.includes(postId);
    const action = isSaved ? { $pull: { saved_posts: postId } } : { $addToSet: { saved_posts: postId } };

    return await Models.Reader.findByIdAndUpdate(userId, action, { new: true }).populate('saved_posts');
  },

  // HÀM MỚI: Lấy danh sách bài đã lưu kèm chi tiết Post
  async getSavedPosts(userId) {
    const user = await Models.Reader.findById(userId).populate({
      path: 'saved_posts',
      model: 'Post'
    });
    return user ? user.saved_posts : [];
  }
};

module.exports = UserDAO;