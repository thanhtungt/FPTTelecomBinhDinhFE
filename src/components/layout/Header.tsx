import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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

  const roleLinks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Admin') {
      return [
        { label: 'Registrations', path: '/dashboard/registrations' },
        { label: 'Posts', path: '/dashboard/posts' }
      ];
    }
    if (user.role === 'Staff') {
      return [{ label: 'Registrations', path: '/dashboard/registrations' }];
    }
    return [{ label: 'My Orders', path: '/dashboard/my-registrations' }];
  }, [user]);

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
          <span className="brand-mark">FPT</span>
          <span className="brand-tagline">Fiber Studio</span>
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
        {roleLinks.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
            {item.label}
          </NavLink>
        ))}
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
