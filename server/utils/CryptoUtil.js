// CLI : npm install crypto --save
const CryptoUtil = {
  // Hàm mã hóa MD5: Chuyển mật khẩu từ văn bản thuần sang chuỗi ký tự lạ
  md5(input) {
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(input).digest('hex');
    return hash;
  }
};

module.exports = CryptoUtil;