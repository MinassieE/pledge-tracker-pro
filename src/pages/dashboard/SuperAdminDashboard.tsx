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
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { reportsApi } from '@/api/reports';
import { pledgesApi } from '@/api/pledges';
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
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['collectionStats'],
    queryFn: () => reportsApi.getCollectionStats(),
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['monthlyCollection'],
    queryFn: () => reportsApi.getMonthlyCollection(),
  });

  const { data: recentPledges, isLoading: pledgesLoading } = useQuery({
    queryKey: ['recentPledges'],
    queryFn: () => pledgesApi.getAll({ limit: 5 }),
  });

  // Mock data for demo
  const mockStats = {
    totalAdmins: 8,
    totalFollowUps: 24,
    totalPledges: 156,
    totalCollectedETB: 2450000,
    totalCollectedUSD: 45000,
    pendingCount: 45,
    overdueCount: 12,
    paidCount: 89,
    partialCount: 10,
  };

  const mockMonthlyData = [
    { month: 'Jan', totalETB: 180000, totalUSD: 3200 },
    { month: 'Feb', totalETB: 220000, totalUSD: 4100 },
    { month: 'Mar', totalETB: 195000, totalUSD: 3800 },
    { month: 'Apr', totalETB: 280000, totalUSD: 5200 },
    { month: 'May', totalETB: 310000, totalUSD: 5800 },
    { month: 'Jun', totalETB: 265000, totalUSD: 4900 },
  ];

  const pledgeDistribution = [
    { name: 'Paid', value: mockStats.paidCount },
    { name: 'Pending', value: mockStats.pendingCount },
    { name: 'Partial', value: mockStats.partialCount },
    { name: 'Overdue', value: mockStats.overdueCount },
  ];

  const mockRecentPledges = [
    { _id: '1', fullName: 'Abebe Kebede', amount: 50000, currency: 'ETB', status: 'paid' as const, promisedDate: '2024-01-15' },
    { _id: '2', fullName: 'Fatuma Ahmed', amount: 1000, currency: 'USD', status: 'pending' as const, promisedDate: '2024-01-20' },
    { _id: '3', fullName: 'Dawit Haile', amount: 25000, currency: 'ETB', status: 'partial' as const, promisedDate: '2024-01-10' },
    { _id: '4', fullName: 'Sara Tesfaye', amount: 500, currency: 'USD', status: 'overdue' as const, promisedDate: '2024-01-05' },
    { _id: '5', fullName: 'Yonas Bekele', amount: 75000, currency: 'ETB', status: 'paid' as const, promisedDate: '2024-01-18' },
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
          title="Total Admins"
          value={mockStats.totalAdmins}
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Follow-Ups"
          value={mockStats.totalFollowUps}
          icon={UserCheck}
          iconColor="text-success"
        />
        <StatCard
          title="Total Pledges"
          value={mockStats.totalPledges}
          icon={FileText}
          iconColor="text-info"
        />
        <StatCard
          title="Overdue Pledges"
          value={mockStats.overdueCount}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Collection Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatCard
          title="Total Collected (ETB)"
          value={formatCurrency(mockStats.totalCollectedETB, 'ETB')}
          subtitle="Total amount collected in Birr"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
          iconColor="text-success"
        />
        <StatCard
          title="Total Collected (USD)"
          value={formatCurrency(mockStats.totalCollectedUSD, 'USD')}
          subtitle="Total amount collected in USD"
          icon={TrendingUp}
          trend={{ value: 8.3, isPositive: true }}
          iconColor="text-primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Chart */}
        <div className="lg:col-span-2 stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Collection Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="totalETB" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="ETB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pledge Distribution Chart */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Pledge Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pledgeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
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
                {mockRecentPledges.map((pledge) => (
                  <tr key={pledge._id} className="table-row-hover">
                    <td className="py-3 font-medium text-foreground">{pledge.fullName}</td>
                    <td className="py-3 text-muted-foreground">
                      {formatCurrency(pledge.amount, pledge.currency)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={pledge.status} />
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(pledge.promisedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
