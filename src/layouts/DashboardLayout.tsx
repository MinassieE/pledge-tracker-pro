import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { cn } from '@/lib/utils';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/admins': 'Manage Admins',
  '/follow-ups': 'Manage Follow-Ups',
  '/pledges': 'All Pledges',
  '/pledges/create': 'Create Pledge',
  '/pledges/overdue': 'Overdue Pledges',
  '/pledges/due-monthly': 'Due This Month',
  '/my-pledges': 'My Pledges',
  '/reports/collection': 'Collection Stats',
  '/reports/monthly': 'Monthly Reports',
  '/reports/performance': 'Performance Reports',
};

export const DashboardLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const pageTitle = Object.entries(pageTitles).find(([path]) => 
    location.pathname === path || location.pathname.startsWith(path + '/')
  )?.[1] || 'Dashboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed lg:relative lg:block z-50',
        isMobileMenuOpen ? 'block' : 'hidden lg:block'
      )}>
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => {
            setIsCollapsed(!isCollapsed);
            setIsMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Topbar
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={pageTitle}
        />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
