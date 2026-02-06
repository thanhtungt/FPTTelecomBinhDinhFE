import { Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import DashboardShell from './components/layout/DashboardShell';
import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminRegistrationsPage from './pages/dashboard/AdminRegistrationsPage';
import AdminPostsPage from './pages/dashboard/AdminPostsPage';
import MyRegistrationsPage from './pages/dashboard/MyRegistrationsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import './App.css';

const App = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<AppShell><HomePage /></AppShell>} />
    <Route path="/packages" element={<AppShell><PackagesPage /></AppShell>} />
    <Route path="/posts" element={<AppShell><PostsPage /></AppShell>} />
    <Route path="/posts/:slug" element={<AppShell><PostDetailPage /></AppShell>} />
    <Route path="/login" element={<AppShell><LoginPage /></AppShell>} />
    <Route path="/register" element={<AppShell><RegisterPage /></AppShell>} />
    
    {/* User route - using AppShell (no sidebar) */}
    <Route
      path="/dashboard/my-registrations"
      element={
        <AppShell>
          <ProtectedRoute>
            <MyRegistrationsPage />
          </ProtectedRoute>
        </AppShell>
      }
    />
    
    {/* Admin/Staff dashboard routes - using DashboardShell (with sidebar) */}
    <Route
      path="/dashboard/registrations"
      element={
        <DashboardShell>
          <ProtectedRoute roles={['Admin', 'Staff']}>
            <AdminRegistrationsPage />
          </ProtectedRoute>
        </DashboardShell>
      }
    />
    <Route
      path="/dashboard/posts"
      element={
        <DashboardShell>
          <ProtectedRoute roles={['Admin']}>
            <AdminPostsPage />
          </ProtectedRoute>
        </DashboardShell>
      }
    />
    
    <Route path="*" element={<AppShell><NotFoundPage /></AppShell>} />
  </Routes>
);

export default App;
