import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  FileText,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Plus,
  Clock,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';

const AdminDashboard: React.FC = () => {
  // Mock data for demo
  const mockStats = {
    assignedFollowUps: 12,
    totalPledges: 89,
    totalCollectedETB: 1250000,
    pendingCount: 28,
    overdueCount: 7,
  };

  const mockRecentPledges = [
    { _id: '1', fullName: 'Abebe Kebede', amount: 50000, currency: 'ETB', status: 'paid' as const, followUp: 'Marta S.' },
    { _id: '2', fullName: 'Fatuma Ahmed', amount: 1000, currency: 'USD', status: 'pending' as const, followUp: 'Dawit H.' },
    { _id: '3', fullName: 'Dawit Haile', amount: 25000, currency: 'ETB', status: 'partial' as const, followUp: 'Sara T.' },
    { _id: '4', fullName: 'Sara Tesfaye', amount: 500, currency: 'USD', status: 'overdue' as const, followUp: 'Yonas B.' },
  ];

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Follow-Ups"
          value={mockStats.assignedFollowUps}
          icon={UserCheck}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Pledges"
          value={mockStats.totalPledges}
          icon={FileText}
          iconColor="text-info"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(mockStats.totalCollectedETB)}
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Overdue"
          value={mockStats.overdueCount}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/pledges/create">
              <Button className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Create New Pledge
              </Button>
            </Link>
            <Link to="/follow-ups">
              <Button variant="outline" className="w-full justify-between">
                Manage Follow-Ups
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pledges/overdue">
              <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive">
                <span className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  View Overdue ({mockStats.overdueCount})
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pledges/due-monthly">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Due This Month
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Pledges */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Latest Pledges</h3>
            <Link to="/pledges">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Follow-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockRecentPledges.map((pledge) => (
                  <tr key={pledge._id} className="table-row-hover">
                    <td className="py-3 font-medium text-foreground">{pledge.fullName}</td>
                    <td className="py-3 text-muted-foreground">
                      {formatCurrency(pledge.amount, pledge.currency)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={pledge.status} />
                    </td>
                    <td className="py-3 text-muted-foreground">{pledge.followUp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pending Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold text-foreground">{mockStats.pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Pledges</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{mockStats.overdueCount}</p>
                <p className="text-sm text-muted-foreground">Overdue Pledges</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-info/10 border border-info/20">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-info" />
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Due This Week</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
