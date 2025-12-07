import React from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
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
  Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(0, 84%, 60%)'];

const CollectionStats: React.FC = () => {
  // Mock data
  const stats = {
    totalPledges: 156,
    totalCollectedETB: 2450000,
    totalCollectedUSD: 45000,
    remainingBalanceETB: 850000,
    remainingBalanceUSD: 15000,
    paidCount: 89,
    pendingCount: 45,
    partialCount: 10,
    overdueCount: 12,
  };

  const pledgeStatusData = [
    { name: 'Paid', value: stats.paidCount, color: COLORS[0] },
    { name: 'Pending', value: stats.pendingCount, color: COLORS[1] },
    { name: 'Partial', value: stats.partialCount, color: COLORS[2] },
    { name: 'Overdue', value: stats.overdueCount, color: COLORS[3] },
  ];

  const collectionByTypeData = [
    { name: 'Cash (ETB)', amount: 2450000 },
    { name: 'Cash (USD)', amount: 45000 * 56 }, // Converted to ETB for comparison
  ];

  const monthlyTrendData = [
    { month: 'Jul', collected: 180000, pledged: 250000 },
    { month: 'Aug', collected: 220000, pledged: 280000 },
    { month: 'Sep', collected: 195000, pledged: 240000 },
    { month: 'Oct', collected: 280000, pledged: 320000 },
    { month: 'Nov', collected: 310000, pledged: 350000 },
    { month: 'Dec', collected: 265000, pledged: 300000 },
  ];

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const collectionRate = Math.round((stats.paidCount / stats.totalPledges) * 100);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Collection Statistics</h2>
        <p className="text-muted-foreground">Overview of pledge collection performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected (ETB)"
          value={formatCurrency(stats.totalCollectedETB)}
          icon={DollarSign}
          iconColor="text-success"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Total Collected (USD)"
          value={formatCurrency(stats.totalCollectedUSD, 'USD')}
          icon={TrendingUp}
          iconColor="text-primary"
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard
          title="Total Pledges"
          value={stats.totalPledges}
          icon={FileText}
          iconColor="text-info"
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          subtitle={`${stats.paidCount} of ${stats.totalPledges} fully paid`}
          icon={CheckCircle}
          iconColor="text-success"
        />
      </div>

      {/* Remaining Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Balance (ETB)</p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {formatCurrency(stats.remainingBalanceETB)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <Clock className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Remaining Balance (USD)</p>
              <p className="text-2xl font-bold text-destructive mt-1">
                {formatCurrency(stats.remainingBalanceUSD, 'USD')}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Collection Trend */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Collection vs Pledged Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="pledged" fill="hsl(var(--muted))" name="Pledged" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" fill="hsl(var(--primary))" name="Collected" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pledge Status Distribution */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Pledge Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pledgeStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pledgeStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
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
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pledgeStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
          <p className="text-3xl font-bold text-success">{stats.paidCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Fully Paid</p>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center">
          <p className="text-3xl font-bold text-warning">{stats.pendingCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Pending</p>
        </div>
        <div className="p-4 rounded-lg bg-info/10 border border-info/20 text-center">
          <p className="text-3xl font-bold text-info">{stats.partialCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Partial Payment</p>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <p className="text-3xl font-bold text-destructive">{stats.overdueCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Overdue</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionStats;
