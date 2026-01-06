import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { reportsApi } from '@/api/reports';
import { pledgesApi } from '@/api/pledges';
import { followUpsApi } from '@/api/followUps';
import { Pledge } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(0, 84%, 60%)'];

const SuperAdminDashboard: React.FC = () => {
  // Fetch collection stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['collectionStats'],
    queryFn: reportsApi.getCollectionStats,
  });

  // Fetch all pledges for recent list and counts
  const { data: pledges = [], isLoading: pledgesLoading } = useQuery({
    queryKey: ['allPledges'],
    queryFn: pledgesApi.getAll,
  });

  // Fetch follow-ups for count
  const { data: followUps = [] } = useQuery({
    queryKey: ['allFollowUps'],
    queryFn: followUpsApi.getAll,
  });

  // Fetch overdue pledges
  const { data: overduePledges = [] } = useQuery({
    queryKey: ['overduePledges'],
    queryFn: pledgesApi.getOverdue,
  });

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate stats from pledges
  const calculatedStats = {
    totalPledges: pledges.length,
    totalFollowUps: followUps.length,
    overdueCount: overduePledges.length,
    paidCount: pledges.filter((p: Pledge) => p.status === 'paid').length,
    pendingCount: pledges.filter((p: Pledge) => p.status === 'pending').length,
    partialCount: pledges.filter((p: Pledge) => p.status === 'partial').length,
  };

  const pledgeDistribution = [
    { name: 'Paid', value: calculatedStats.paidCount },
    { name: 'Pending', value: calculatedStats.pendingCount },
    { name: 'Partial', value: calculatedStats.partialCount },
    { name: 'Overdue', value: calculatedStats.overdueCount },
  ];

  // Get 5 most recent pledges
  const recentPledges = pledges.slice(0, 5);

  if (statsLoading || pledgesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Admins"
          value={'-'}
          subtitle="Endpoint not available"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Follow-Ups"
          value={calculatedStats.totalFollowUps}
          icon={UserCheck}
          iconColor="text-success"
        />
        <StatCard
          title="Total Pledges"
          value={calculatedStats.totalPledges}
          icon={FileText}
          iconColor="text-info"
        />
        <StatCard
          title="Overdue Pledges"
          value={calculatedStats.overdueCount}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          title="Total Collected (ETB)"
          value={stats ? formatCurrency(stats.totalCollectedETB, 'ETB') : '-'}
          subtitle="Total amount collected in Birr"
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Total Collected (USD)"
          value={stats ? formatCurrency(stats.totalCollectedUSD, 'USD') : '-'}
          subtitle="Total amount collected in USD"
          icon={TrendingUp}
          iconColor="text-primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Remaining Balance */}
        <div className="lg:col-span-2 stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Collection Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Remaining (ETB)</p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {stats ? formatCurrency(stats.remainingBalanceETB) : '-'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Remaining (USD)</p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {stats ? formatCurrency(stats.remainingBalanceUSD, 'USD') : '-'}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-success/10">
              <p className="text-sm text-muted-foreground">Paid Pledges</p>
              <p className="text-2xl font-bold text-success mt-1">{stats?.paidCount || calculatedStats.paidCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/10">
              <p className="text-sm text-muted-foreground">Pending Pledges</p>
              <p className="text-2xl font-bold text-warning mt-1">{stats?.pendingCount || calculatedStats.pendingCount}</p>
            </div>
          </div>
        </div>

        {/* Pledge Distribution Chart */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Pledge Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pledgeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pledgeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pledgeDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Pledges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/admins">
              <Button variant="outline" className="w-full justify-between">
                Manage Admins
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/follow-ups">
              <Button variant="outline" className="w-full justify-between">
                Manage Follow-Ups
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/pledges">
              <Button variant="outline" className="w-full justify-between">
                View All Pledges
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/reports/collection">
              <Button variant="outline" className="w-full justify-between">
                View Reports
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Pledges */}
        <div className="lg:col-span-2 stat-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Recent Pledges</h3>
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
                        {pledge.promised_end_date || pledge.promised_date || pledge.promisedDate
                          ? new Date(pledge.promised_end_date || pledge.promised_date || pledge.promisedDate!).toLocaleDateString()
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
    </div>
  );
};

export default SuperAdminDashboard;
