import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { reportsApi } from '@/api/reports';
import { pledgesApi } from '@/api/pledges';
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
  Legend,
} from 'recharts';

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(199, 89%, 48%)', 'hsl(0, 84%, 60%)'];

const CollectionStats: React.FC = () => {
  // Fetch collection stats from backend
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['collectionStats'],
    queryFn: reportsApi.getCollectionStats,
  });

  // Fetch all pledges for additional calculations
  const { data: pledges = [] } = useQuery({
    queryKey: ['allPledges'],
    queryFn: pledgesApi.getAll,
  });

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load collection statistics. Please try again.</p>
      </div>
    );
  }

  // Calculate from real data or use API response
  const calculatedStats = {
    totalPledges: stats?.totalPledges || pledges.length,
    totalCollectedETB: stats?.totalCollectedETB || 0,
    totalCollectedUSD: stats?.totalCollectedUSD || 0,
    remainingBalanceETB: stats?.remainingBalanceETB || 0,
    remainingBalanceUSD: stats?.remainingBalanceUSD || 0,
    paidCount: stats?.paidCount || pledges.filter((p: Pledge) => p.status === 'paid').length,
    pendingCount: stats?.pendingCount || pledges.filter((p: Pledge) => p.status === 'pending').length,
    partialCount: stats?.partialCount || pledges.filter((p: Pledge) => p.status === 'partial').length,
    overdueCount: stats?.overdueCount || pledges.filter((p: Pledge) => p.status === 'overdue').length,
  };

  const pledgeStatusData = [
    { name: 'Paid', value: calculatedStats.paidCount, color: COLORS[0] },
    { name: 'Pending', value: calculatedStats.pendingCount, color: COLORS[1] },
    { name: 'Partial', value: calculatedStats.partialCount, color: COLORS[2] },
    { name: 'Overdue', value: calculatedStats.overdueCount, color: COLORS[3] },
  ];

  const collectionRate = calculatedStats.totalPledges > 0 
    ? Math.round((calculatedStats.paidCount / calculatedStats.totalPledges) * 100)
    : 0;

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
          value={formatCurrency(calculatedStats.totalCollectedETB)}
          icon={DollarSign}
          iconColor="text-success"
        />
        <StatCard
          title="Total Collected (USD)"
          value={formatCurrency(calculatedStats.totalCollectedUSD, 'USD')}
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <StatCard
          title="Total Pledges"
          value={calculatedStats.totalPledges}
          icon={FileText}
          iconColor="text-info"
        />
        <StatCard
          title="Collection Rate"
          value={`${collectionRate}%`}
          subtitle={`${calculatedStats.paidCount} of ${calculatedStats.totalPledges} fully paid`}
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
                {formatCurrency(calculatedStats.remainingBalanceETB)}
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
                {formatCurrency(calculatedStats.remainingBalanceUSD, 'USD')}
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

        {/* Collection Summary */}
        <div className="stat-card">
          <h3 className="text-lg font-semibold text-foreground mb-4">Collection Summary</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ETB Collected</span>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(calculatedStats.totalCollectedETB)}
                </span>
              </div>
              <div className="mt-2 h-2 bg-success/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-success rounded-full"
                  style={{ 
                    width: `${calculatedStats.remainingBalanceETB + calculatedStats.totalCollectedETB > 0 
                      ? (calculatedStats.totalCollectedETB / (calculatedStats.remainingBalanceETB + calculatedStats.totalCollectedETB)) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(calculatedStats.remainingBalanceETB)} remaining
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">USD Collected</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(calculatedStats.totalCollectedUSD, 'USD')}
                </span>
              </div>
              <div className="mt-2 h-2 bg-primary/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ 
                    width: `${calculatedStats.remainingBalanceUSD + calculatedStats.totalCollectedUSD > 0 
                      ? (calculatedStats.totalCollectedUSD / (calculatedStats.remainingBalanceUSD + calculatedStats.totalCollectedUSD)) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(calculatedStats.remainingBalanceUSD, 'USD')} remaining
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-success/10 border border-success/20 text-center">
          <p className="text-3xl font-bold text-success">{calculatedStats.paidCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Fully Paid</p>
        </div>
        <div className="p-4 rounded-lg bg-warning/10 border border-warning/20 text-center">
          <p className="text-3xl font-bold text-warning">{calculatedStats.pendingCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Pending</p>
        </div>
        <div className="p-4 rounded-lg bg-info/10 border border-info/20 text-center">
          <p className="text-3xl font-bold text-info">{calculatedStats.partialCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Partial Payment</p>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
          <p className="text-3xl font-bold text-destructive">{calculatedStats.overdueCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Overdue</p>
        </div>
      </div>
    </div>
  );
};

export default CollectionStats;
