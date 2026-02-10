import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="page not-found">
    <h1>404</h1>
    <p>Chúng tôi không tìm thấy trang bạn đang tìm kiếm.</p>
    <Link to="/" className="primary-btn">
      Quay lại trang chủ
    </Link>
  </div>
);

export default NotFoundPage;
