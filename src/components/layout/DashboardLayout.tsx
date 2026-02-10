import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'Admin') {
      return [
        { label: 'Registrations', path: '/dashboard/registrations'},
        { label: 'Posts', path: '/dashboard/posts'}
      ];
    }
    
    if (user.role === 'Staff') {
      return [
        { label: 'Đơn đăng ký', path: '/dashboard/registrations', icon: '📋' }
      ];
    }
    
    return [
      { label: 'Đơn đăng ký', path: '/dashboard/my-registrations', icon: '🛒' }
    ];
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__header">
          <div className="dashboard-user">
            <span className="dashboard-user__name">{user?.name}</span>
            <small className="dashboard-user__role">{user?.role}</small>
          </div>
        </div>
        
        <nav className="dashboard-sidebar__nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `dashboard-nav-item ${isActive ? 'active' : ''}`
              }
            >
              {/* <span className="dashboard-nav-item__icon">{item.icon}</span> */}
              <span className="dashboard-nav-item__label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* <div className="dashboard-sidebar__footer">
          <button className="dashboard-logout-btn" onClick={handleLogout}>
            <span className="dashboard-nav-item__icon">🚪</span>
            <span className="dashboard-nav-item__label">Đăng xuất</span>
          </button>
        </div> */}
      </aside>

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
