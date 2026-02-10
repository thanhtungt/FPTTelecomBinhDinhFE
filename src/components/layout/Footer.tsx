import fptLogo from '../../assets/fpt-telecom-logo.png';

const Footer = () => (
  <footer className="app-footer">
    <div className="footer-container">
      {/* Left: Company Info */}
      <div className="footer-section footer-section--company">
        <div className="footer-logo">
          <img src={fptLogo} alt="FPT Telecom" />
        </div>
        <h3>Công ty Cổ phần Viễn thông FPT</h3>
        <p className="footer-description">
          FPTConnect.vn - Website chính thức thuộc Công Ty Cổ Phần Viễn Thông FPT
        </p>
        <div className="footer-contact">
          <p className="footer-contact-item"> 
            <i className="fa-solid fa-location-dot fa-fw"></i>
            Tầng 9, Block A, tòa nhà FPT Cầu Giấy, số 10 Phạm Văn Bạch, quận Cầu Giấy, TP. Hà Nội
          </p>
          <p className="footer-contact-item">
            <i className="fa-solid fa-envelope fa-fw"></i>
            hotrokhachchang@fpt.com
          </p>
          <p className="footer-contact-item">
            <i className="fa-solid fa-phone fa-fw"></i>
            024 7300 2222
          </p>
        </div>
        <p className="footer-representative">
          Người đại diện: Ông Hoàng Việt Anh
        </p>
      </div>

      {/* Middle: About FPT Telecom */}
      <div className="footer-section">
        <h4>Về FPT Telecom</h4>
        <ul className="footer-links">
          <li><a href="/lap-mang-internet">Lắp mạng Internet</a></li>
          <li><a href="/lap-dat-camera">Lắp đặt Camera</a></li>
          <li><a href="/truyen-hinh">Truyền hình FPT</a></li>
          <li><a href="/tin-tuc">Tin tức</a></li>
        </ul>
      </div>

      {/* Right: Installation Areas */}
      <div className="footer-section">
        <h4>Khu vực lắp đặt</h4>
        <ul className="footer-links">
          <li><a href="/lap-dat-ho-chi-minh">Lắp đặt tại Hồ Chí Minh</a></li>
          <li><a href="/lap-dat-ha-noi">Lắp đặt tại Hà Nội</a></li>
          <li><a href="/lap-dat-hai-phong">Lắp đặt tại Hải Phòng</a></li>
          <li><a href="/lap-dat-can-tho">Lắp đặt tại Cần Thơ</a></li>
          <li><a href="/lap-dat-da-nang">Lắp đặt tại Đà Nẵng</a></li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} FPT Telecom. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
