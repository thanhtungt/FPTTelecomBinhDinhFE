import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="page not-found">
    <h1>404</h1>
    <p>We could not find that page.</p>
    <Link to="/" className="primary-btn">
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;
