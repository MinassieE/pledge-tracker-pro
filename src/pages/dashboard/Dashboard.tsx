import React from 'react';
import { useAuth } from '@/context/AuthContext';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import FollowUpDashboard from './FollowUpDashboard';

const Dashboard: React.FC = () => {
  const { role } = useAuth();

  switch (role) {
    case 'superAdmin':
      return <SuperAdminDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'followUp':
      return <FollowUpDashboard />;
    default:
      return <div>Loading...</div>;
  }
};

export default Dashboard;
