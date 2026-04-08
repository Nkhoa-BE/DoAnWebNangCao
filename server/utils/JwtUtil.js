const jwt = require('jsonwebtoken');
const MyConstants = require('./MyConstants');

const JwtUtil = {
  // Tạo Token chứa ID, Username, Password
  genToken(id, username, password) {
    const token = jwt.sign(
      { 
        id: id, 
        username: username, 
        password: password 
      },
      MyConstants.JWT_SECRET,
      { expiresIn: MyConstants.JWT_EXPIRES }
    );
    return token;
  },

  // Middleware kiểm tra Token
  checkToken(req, res, next) {
    const token = req.headers['x-access-token'] || req.headers['authorization'];

    if (token) {
      jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.json({
            success: false,
            message: 'Mã xác thực không hợp lệ!'
          });
        } else {
          req.decoded = decoded; 
          next();
        }
      });
    } else {
      return res.json({
        success: false,
        message: 'Bạn chưa cung cấp mã xác thực!'
      });
    }
  }
};

module.exports = JwtUtil;