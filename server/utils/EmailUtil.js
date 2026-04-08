// CLI : npm install nodemailer --save
const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

// Cấu hình bộ gửi mail (Sử dụng dịch vụ Hotmail/Outlook)
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS
  }
});

const EmailUtil = {
  // Hàm gửi mail xác thực tài khoản Reader (Độc giả)
  send(email, id, token) {
    const text = 'Cảm ơn bạn đã đăng ký tài khoản tại TechGame News.\n' +
                 'Vui lòng sử dụng thông tin sau để kích hoạt tài khoản của bạn:\n' +
                 '\t .ID người dùng: ' + id + '\n' +
                 '\t .Mã xác thực (Token): ' + token;

    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: '[TechGame News] Xác nhận đăng ký tài khoản',
        text: text
      };

      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.error('Lỗi gửi Email: ', err);
          reject(err);
        } else {
          console.log('Email xác thực đã được gửi tới: ' + email);
          resolve(true);
        }
      });
    });
  }
};

module.exports = EmailUtil;