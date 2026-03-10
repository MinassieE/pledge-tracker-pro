import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { pledgesApi } from '@/api/pledges';
import { followUpsApi } from '@/api/followUps';
import { Pledge } from '@/types';

const AdminDashboard: React.FC = () => {
  // Fetch all pledges
  const { data: pledges = [], isLoading: pledgesLoading } = useQuery({
    queryKey: ['allPledges'],
    queryFn: pledgesApi.getAll,
  });

  // Fetch follow-ups
  const { data: followUps = [] } = useQuery({
    queryKey: ['allFollowUps'],
    queryFn: followUpsApi.getAll,
  });

  // Fetch overdue pledges
  const { data: overduePledges = [] } = useQuery({
    queryKey: ['overduePledges'],
    queryFn: pledgesApi.getOverdue,
  });

  // Fetch due monthly pledges
  const { data: dueMonthlyPledges = [] } = useQuery({
    queryKey: ['dueMonthlyPledges'],
    queryFn: pledgesApi.getDueMonthly,
  });

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate total collected by currency
  const totalCollectedETB = pledges
    .filter((p: Pledge) => p.currency === 'ETB' || !p.currency)
    .reduce((sum: number, pledge: Pledge) => {
      const paid = pledge.amount_paid || pledge.total_paid || pledge.totalPaid || 0;
      return sum + paid;
    }, 0);

  const totalCollectedUSD = pledges
    .filter((p: Pledge) => p.currency === 'USD')
    .reduce((sum: number, pledge: Pledge) => {
      const paid = pledge.amount_paid || pledge.total_paid || pledge.totalPaid || 0;
      return sum + paid;
    }, 0);

  const stats = {
    assignedFollowUps: followUps.length,
    totalPledges: pledges.length,
    totalCollectedETB,
    totalCollectedUSD,
    pendingCount: pledges.filter((p: Pledge) => p.status === 'pending').length,
    overdueCount: overduePledges.length,
    dueThisMonth: dueMonthlyPledges.length,
  };

  // Get 5 most recent pledges
  const recentPledges = pledges.slice(0, 4);

  if (pledgesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Assigned Follow-Ups"
          value={stats.assignedFollowUps}
          icon={UserCheck}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Pledges"
          value={stats.totalPledges}
          icon={FileText}
          iconColor="text-info"
        />
        <StatCard
          title="Collected (ETB)"
          value={formatCurrency(stats.totalCollectedETB)}
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Collected (USD)"
          value={formatCurrency(stats.totalCollectedUSD, 'USD')}
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Overdue"
          value={stats.overdueCount}
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
                  View Overdue ({stats.overdueCount})
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pledges/due-monthly">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Due This Month ({stats.dueThisMonth})
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
                  <th className="pb-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPledges.length > 0 ? (
                  recentPledges.map((pledge: Pledge) => (
                    <tr key={pledge._id} className="table-row-hover">
                      <td className="py-3 font-medium text-foreground">
                        {pledge.full_name || pledge.fullName || 'N/A'}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatCurrency(pledge.promised_amount || pledge.amount || 0, pledge.currency || 'ETB')}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={pledge.status || 'pending'} />
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {pledge.promised_end_date || pledge.promised_date
                          ? new Date(pledge.promised_end_date || pledge.promised_date!).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No pledges found
                    </td>
                  </tr>
                )}
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
                <p className="text-2xl font-bold text-foreground">{stats.pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Pledges</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.overdueCount}</p>
                <p className="text-sm text-muted-foreground">Overdue Pledges</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-info/10 border border-info/20">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-info" />
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.dueThisMonth}</p>
                <p className="text-sm text-muted-foreground">Due This Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
