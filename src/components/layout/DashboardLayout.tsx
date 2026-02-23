import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const menuItems = useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'Admin') {
      return [
        { label: 'Đăng ký', path: '/dashboard/registrations'},
        { label: 'Bài viết', path: '/dashboard/posts'},
        { label: 'Danh mục', path: '/dashboard/categories'},
        { label: 'Gói cước', path: '/dashboard/packages'},
        { label: 'Tin tuyển dụng', path: '/dashboard/job-postings'},
        { label: 'Hồ sơ ứng tuyển', path: '/dashboard/job-applications'},
        { label: 'Chat hỗ trợ', path: '/dashboard/chat'},
        { label: 'Người dùng', path: '/dashboard/users'}
      ];
    }
    
    if (user.role === 'Staff') {
      return [
        { label: 'Đơn đăng ký', path: '/dashboard/registrations'},
        { label: 'Tin tuyển dụng', path: '/dashboard/job-postings'},
        { label: 'Hồ sơ ứng tuyển', path: '/dashboard/job-applications'},
        { label: 'Chat hỗ trợ', path: '/dashboard/chat'}
      ];
    }
    
    return [
      { label: 'Đơn đăng ký', path: '/dashboard/my-registrations'}
    ];
  }, [user]);

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
