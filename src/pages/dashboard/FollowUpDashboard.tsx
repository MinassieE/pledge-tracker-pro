import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';

const FollowUpDashboard: React.FC = () => {
  // Mock data for demo
  const mockStats = {
    assignedPledges: 24,
    completedPledges: 15,
    pendingPledges: 6,
    overduePledges: 3,
  };

  const mockAssignedPledges = [
    { _id: '1', fullName: 'Abebe Kebede', phone: '+251911234567', amount: 50000, currency: 'ETB', status: 'pending' as const, promisedDate: '2024-01-20' },
    { _id: '2', fullName: 'Fatuma Ahmed', phone: '+251922345678', amount: 1000, currency: 'USD', status: 'overdue' as const, promisedDate: '2024-01-10' },
    { _id: '3', fullName: 'Dawit Haile', phone: '+251933456789', amount: 25000, currency: 'ETB', status: 'partial' as const, promisedDate: '2024-01-15' },
    { _id: '4', fullName: 'Sara Tesfaye', phone: '+251944567890', amount: 30000, currency: 'ETB', status: 'pending' as const, promisedDate: '2024-01-25' },
    { _id: '5', fullName: 'Yonas Bekele', phone: '+251955678901', amount: 500, currency: 'USD', status: 'overdue' as const, promisedDate: '2024-01-05' },
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
          title="Assigned Pledges"
          value={mockStats.assignedPledges}
          icon={FileText}
          iconColor="text-primary"
        />
        <StatCard
          title="Completed"
          value={mockStats.completedPledges}
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Pending"
          value={mockStats.pendingPledges}
          icon={Clock}
          iconColor="text-warning"
        />
        <StatCard
          title="Overdue"
          value={mockStats.overduePledges}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Progress Overview */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Collection Progress</span>
            <span className="text-sm font-bold text-foreground">
              {Math.round((mockStats.completedPledges / mockStats.assignedPledges) * 100)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(mockStats.completedPledges / mockStats.assignedPledges) * 100}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-success">{mockStats.completedPledges}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{mockStats.pendingPledges}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{mockStats.overduePledges}</p>
            <p className="text-xs text-muted-foreground">Need Action</p>
          </div>
        </div>
      </div>

      {/* Assigned Pledges Table */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Assigned Pledges</h3>
          <Link to="/my-pledges">
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
                <th className="pb-3">Phone</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Due Date</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockAssignedPledges.map((pledge) => (
                <tr key={pledge._id} className="table-row-hover">
                  <td className="py-3 font-medium text-foreground">{pledge.fullName}</td>
                  <td className="py-3 text-muted-foreground">{pledge.phone}</td>
                  <td className="py-3 text-muted-foreground">
                    {formatCurrency(pledge.amount, pledge.currency)}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={pledge.status} />
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {new Date(pledge.promisedDate).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Link to={`/pledges/${pledge._id}`}>
                        <Button size="sm" variant="outline" className="h-8">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Urgent Actions */}
      {mockStats.overduePledges > 0 && (
        <div className="stat-card border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Urgent Action Required</h3>
              <p className="text-muted-foreground mt-1">
                You have {mockStats.overduePledges} overdue pledge(s) that need immediate attention.
              </p>
              <Link to="/pledges/overdue" className="inline-block mt-3">
                <Button variant="destructive" size="sm">
                  View Overdue Pledges
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpDashboard;
