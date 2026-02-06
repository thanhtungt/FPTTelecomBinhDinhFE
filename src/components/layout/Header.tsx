import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import fptTelecomLogo from '../../assets/fpt-telecom-logo.png';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Packages', path: '/packages' },
  { label: 'Stories', path: '/posts' }
];

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/dashboard/registrations';
    if (user.role === 'Admin' || user.role === 'Staff') {
      return '/dashboard/registrations';
    }
    return null; // User không có dashboard
  };

  const showDashboardLink = user && (user.role === 'Admin' || user.role === 'Staff');

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const navClassName = `app-header__nav ${menuOpen ? 'is-open' : 'mobile-hidden'}`;
  const actionsClassName = `app-header__actions ${menuOpen ? 'is-open' : 'mobile-hidden'}`;

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <Link to="/">
          <img src={fptTelecomLogo} alt="FPT Telecom" className="brand-logo" />
        </Link>
      </div>
      <button
        type="button"
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={toggleMenu}
      >
        {menuOpen ? 'Close' : 'Menu'}
      </button>
      <nav id="primary-navigation" className={navClassName}>
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
            {item.label}
          </NavLink>
        ))}
        {showDashboardLink && (
          <NavLink 
            to={getDashboardPath()!} 
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Dashboard
          </NavLink>
        )}
        {user && user.role !== 'Admin' && user.role !== 'Staff' && (
          <NavLink 
            to="/dashboard/my-registrations" 
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            My Orders
          </NavLink>
        )}
      </nav>
      <div className={actionsClassName}>
        {!isAuthenticated ? (
          <>
            <button className="ghost-btn" onClick={() => navigate('/login')}>
              Login
            </button>
            <button className="primary-btn" onClick={() => navigate('/register')}>
              Register
            </button>
          </>
        ) : (
          <>
            <div className="user-chip">
              <span>{user?.name}</span>
              <small>{user?.role}</small>
            </div>
            <button className="ghost-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
