import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Shield,
  FolderKanban,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['superAdmin', 'admin', 'followUp'],
  },
  {
    title: 'Manage Projects',
    href: '/projects',
    icon: FolderKanban,
    roles: ['superAdmin'],
  },
  {
    title: 'Manage Admins',
    href: '/admins',
    icon: Shield,
    roles: ['superAdmin'],
  },
  {
    title: 'Manage Follow-Ups',
    href: '/follow-ups',
    icon: UserCheck,
    roles: ['superAdmin', 'admin'],
  },
  {
    title: 'All Pledges',
    href: '/pledges',
    icon: FileText,
    roles: ['superAdmin', 'admin'],
  },
  {
    title: 'My Pledges',
    href: '/my-pledges',
    icon: FileText,
    roles: ['followUp'],
  },
  {
    title: 'Overdue Pledges',
    href: '/pledges/overdue',
    icon: AlertTriangle,
    roles: ['superAdmin', 'admin', 'followUp'],
  },
  {
    title: 'Due This Month',
    href: '/pledges/due-monthly',
    icon: Calendar,
    roles: ['superAdmin', 'admin', 'followUp'],
  },
  {
    title: 'Collection Stats',
    href: '/reports/collection',
    icon: BarChart3,
    roles: ['superAdmin', 'admin'],
  },
  {
    title: 'Monthly Reports',
    href: '/reports/monthly',
    icon: TrendingUp,
    roles: ['superAdmin', 'admin'],
  },
  {
    title: 'Performance',
    href: '/reports/performance',
    icon: Users,
    roles: ['superAdmin', 'admin'],
  },
  {
    title: 'Custom Reports',
    href: '/reports/custom',
    icon: FileText,
    roles: ['superAdmin'],
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const { role, logout, user } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) =>
    role ? item.roles.includes(role) : false
  );

  const getRoleBadge = () => {
    switch (role) {
      case 'superAdmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'followUp':
        return 'Follow-Up';
      default:
        return '';
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <FileText className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">PledgeTrack</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User info */}
      {!isCollapsed && (
        <div className="px-4 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-foreground">
                {user?.first_name?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.first_name || user?.name || 'User'}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sidebar-primary/20 text-sidebar-primary">
                {getRoleBadge()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    'sidebar-link',
                    isActive && 'sidebar-link-active',
                    isCollapsed && 'justify-center px-2'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm">{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <NavLink
          to="/change-password"
          className={cn(
            'sidebar-link w-full',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? 'Change Password' : undefined}
        >
          <KeyRound className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Change Password</span>}
        </NavLink>
        <button
          onClick={logout}
          className={cn(
            'sidebar-link w-full text-destructive hover:text-destructive hover:bg-destructive/10',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
