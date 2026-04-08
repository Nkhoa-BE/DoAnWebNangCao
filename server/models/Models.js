const mongoose = require('mongoose');

// 1. Schema cho Quản trị viên
const AdminSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  fullname: String,
  role: String
}, { versionKey: false });

// 2. Schema cho Danh mục
const CategorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  slug: String
}, { versionKey: false });

// 3. Schema cho Độc giả (Readers) - CÓ THÊM TRƯỜNG LƯU BÀI
const ReaderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: String,
  email: String,
  active: { type: Number, default: 0 },
  token: String,
  // Trường lưu trữ vĩnh viễn danh sách bài viết đã lưu
  saved_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { versionKey: false });

// Sub-schema cho reader nhúng TRONG Comment
const EmbeddedReaderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  name: String,
  email: String,
  active: Number,
  token: String,
}, { versionKey: false, _id: false });

// Sub-schema cho category nhúng trong Post
const EmbeddedCategorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  slug: String
}, { versionKey: false, _id: false });

// 4. Schema cho Bài viết
const PostSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  slug: String,
  summary: String,
  content: String,
  image: String,
  createdAt: Date,
  category: EmbeddedCategorySchema,
  author: String,
  hidden: { type: Boolean, default: false },
  pinned: { type: Boolean, default: false }
}, { versionKey: false });

// 5. Schema cho Bình luận
const CommentSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  content: String,
  createdAt: Number,
  status: String,
  reader: EmbeddedReaderSchema,
  post_id: mongoose.Schema.Types.ObjectId
}, { versionKey: false });

// --- Khởi tạo Models ---
const Admin    = mongoose.model('Admin',    AdminSchema,    'admins');
const Category = mongoose.model('Category', CategorySchema, 'categories');
const Reader   = mongoose.model('Reader',   ReaderSchema,   'readers');
const Post     = mongoose.model('Post',     PostSchema,     'posts');
const Comment  = mongoose.model('Comment',  CommentSchema,  'comments');

module.exports = { Admin, Category, Reader, Post, Comment };