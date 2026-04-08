require('../utils/MongooseUtil'); // Đảm bảo đã kết nối DB
const Models = require('./Models'); // Lấy Model Admin đã định nghĩa

const AdminDAO = {
  // Hàm kiểm tra đăng nhập cho quản trị viên tin tức
  async selectByUsernameAndPassword(username, password) {
    // query tìm kiếm admin có username và password khớp với dữ liệu truyền vào
    const query = { 
      username: username, 
      password: password,
    };
    
    // Sử dụng Mongoose để tìm 1 bản ghi duy nhất
    const admin = await Models.Admin.findOne(query);
    
    return admin; 
    // Trả về đối tượng admin nếu đúng, hoặc null nếu sai thông tin
  }
};

module.exports = AdminDAO;