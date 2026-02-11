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
        { label: 'Posts', path: '/dashboard/posts'},
        { label: 'Categories', path: '/dashboard/categories'},
        { label: 'Packages', path: '/dashboard/packages'},
        { label: 'Job Postings', path: '/dashboard/job-postings'},
        { label: 'Job Applications', path: '/dashboard/job-applications'}
      ];
    }
    
    if (user.role === 'Staff') {
      return [
        { label: 'Đơn đăng ký', path: '/dashboard/registrations'},
        { label: 'Tin tuyển dụng', path: '/dashboard/job-postings'},
        { label: 'Hồ sơ ứng tuyển', path: '/dashboard/job-applications'}
      ];
    }
    
    return [
      { label: 'Đơn đăng ký', path: '/dashboard/my-registrations'}
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
