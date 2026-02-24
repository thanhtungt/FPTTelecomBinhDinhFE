// FILE: src/utils/forceTokenRefresh.ts
// Paste vào DevTools Console hoặc thêm vào code để force tất cả users logout

export const forceLogoutAllUsers = () => {
  // Clear localStorage
  localStorage.removeItem('fpttelecom-auth');
  
  // Show alert
  alert('🔄 Hệ thống đã cập nhật. Vui lòng đăng nhập lại!');
  
  // Redirect to login
  window.location.href = '/login';
};

// Chạy tự động khi detect token không hợp lệ
export const checkAndRefreshToken = () => {
  const authData = localStorage.getItem('fpttelecom-auth');
  
  if (!authData) return;
  
  try {
    const parsed = JSON.parse(authData);
    const token = parsed.token;
    
    if (!token) {
      forceLogoutAllUsers();
      return;
    }
    
    // Decode token để check issuer/audience
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check nếu token không có issuer hoặc audience đúng
    if (!payload.iss || !payload.aud) {
      console.warn('⚠️ Token thiếu issuer/audience - force logout');
      forceLogoutAllUsers();
      return;
    }
    
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      console.warn('⚠️ Token đã hết hạn - force logout');
      forceLogoutAllUsers();
      return;
    }
    
    console.log('✅ Token hợp lệ:', {
      userId: payload.nameid || payload.sub,
      role: payload.role,
      expires: new Date(payload.exp * 1000).toLocaleString()
    });
    
  } catch (err) {
    console.error('❌ Token không hợp lệ - force logout', err);
    forceLogoutAllUsers();
  }
};

// Để chạy trong Console:
// Copy toàn bộ file này, paste vào Console, sau đó chạy:
// checkAndRefreshToken()
// hoặc
// forceLogoutAllUsers()
