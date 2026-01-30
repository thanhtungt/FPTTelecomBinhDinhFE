import type { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => (
  <div className="app-shell">
    <Header />
    <main className="app-content">{children}</main>
    <Footer />
  </div>
);

export default AppShell;
