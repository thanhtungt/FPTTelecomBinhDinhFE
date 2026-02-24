// FILE: src/components/common/ForceLogoutBanner.tsx
// Component này hiển thị banner yêu cầu user logout khi detect token cũ

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_STORAGE_KEY } from '../../api/client';

export const ForceLogoutBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const authData = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!authData) return;

      try {
        const parsed = JSON.parse(authData);
        const token = parsed.token;

        if (!token) {
          setShowBanner(true);
          return;
        }

        // Decode token
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Check nếu token thiếu issuer/audience
        // (Token cũ có thể không có các field này)
        const hasIssuer = !!payload.iss;
        const hasAudience = !!payload.aud;

        // Check expiry
        const isExpired = payload.exp && payload.exp * 1000 < Date.now();

        if (!hasIssuer || !hasAudience || isExpired) {
          setShowBanner(true);
        }
      } catch (err) {
        setShowBanner(true);
      }
    };

    checkToken();
  }, []);

  const handleForceLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setShowBanner(false);
    navigate('/login');
    window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#ef4444',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>🔄</span>
        <div>
          <strong>Hệ thống đã cập nhật!</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
            Vui lòng đăng nhập lại để sử dụng các tính năng mới.
          </p>
        </div>
      </div>
      <button
        onClick={handleForceLogout}
        style={{
          backgroundColor: 'white',
          color: '#ef4444',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Đăng nhập lại
      </button>
    </div>
  );
};
