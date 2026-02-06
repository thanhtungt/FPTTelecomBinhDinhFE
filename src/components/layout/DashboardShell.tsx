import type { ReactNode } from 'react';
import Header from './Header';
import DashboardLayout from './DashboardLayout';

interface DashboardShellProps {
  children: ReactNode;
}

const DashboardShell = ({ children }: DashboardShellProps) => (
  <div className="app-shell dashboard-shell">
    <Header />
    <DashboardLayout>{children}</DashboardLayout>
  </div>
);

export default DashboardShell;
