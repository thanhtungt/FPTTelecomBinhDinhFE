import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BannerCarousel from './BannerCarousel';
import ChatbotButton from '../common/ChatbotButton';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  const hidesBanner = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-shell">
      <Header />
      {!hidesBanner && <BannerCarousel />}
      <main className="app-content">{children}</main>
      <Footer />
      <ChatbotButton />
    </div>
  );
};

export default AppShell;
