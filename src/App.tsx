import { Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
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
  <AppShell>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/packages" element={<PackagesPage />} />
      <Route path="/posts" element={<PostsPage />} />
      <Route path="/posts/:slug" element={<PostDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard/registrations"
        element={
          <ProtectedRoute roles={['Admin', 'Staff']}>
            <AdminRegistrationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/posts"
        element={
          <ProtectedRoute roles={['Admin']}>
            <AdminPostsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-registrations"
        element={
          <ProtectedRoute>
            <MyRegistrationsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </AppShell>
);

export default App;
