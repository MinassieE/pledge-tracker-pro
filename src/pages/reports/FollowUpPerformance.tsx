import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Trophy, TrendingUp, CheckCircle, Target } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { FollowUpPerformance as PerformanceData } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const FollowUpPerformance: React.FC = () => {
  // Mock data
  const performanceData: PerformanceData[] = [
    { followUpId: '1', name: 'Marta Solomon', completedPledges: 24, totalCollected: 450000, overdueHandled: 5, successRate: 92 },
    { followUpId: '2', name: 'Dawit Hailu', completedPledges: 18, totalCollected: 320000, overdueHandled: 3, successRate: 85 },
    { followUpId: '3', name: 'Sara Tadesse', completedPledges: 22, totalCollected: 410000, overdueHandled: 4, successRate: 88 },
    { followUpId: '4', name: 'Yonas Berhane', completedPledges: 15, totalCollected: 280000, overdueHandled: 6, successRate: 78 },
    { followUpId: '5', name: 'Helen Gebre', completedPledges: 20, totalCollected: 380000, overdueHandled: 2, successRate: 90 },
    { followUpId: '6', name: 'Kidist Alemu', completedPledges: 12, totalCollected: 220000, overdueHandled: 4, successRate: 72 },
  ];

  const topPerformer = performanceData.reduce((prev, current) => 
    prev.successRate > current.successRate ? prev : current
  );

  const totalCompleted = performanceData.reduce((sum, p) => sum + p.completedPledges, 0);
  const totalCollected = performanceData.reduce((sum, p) => sum + p.totalCollected, 0);
  const avgSuccessRate = Math.round(
    performanceData.reduce((sum, p) => sum + p.successRate, 0) / performanceData.length
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnDef<PerformanceData>[] = [
    {
      accessorKey: 'name',
      header: 'Follow-Up User',
      cell: ({ row, table }) => {
        const rank = table.getSortedRowModel().rows.findIndex(r => r.id === row.id) + 1;
        const isTopThree = rank <= 3;
        return (
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              rank === 1 ? 'bg-warning/20 text-warning' :
              rank === 2 ? 'bg-muted text-muted-foreground' :
              rank === 3 ? 'bg-warning/10 text-warning' :
              'bg-primary/10 text-primary'
            }`}>
              {rank}
            </div>
            <div>
              <p className="font-medium text-foreground">{row.original.name}</p>
              {isTopThree && (
                <span className="text-xs text-muted-foreground">
                  {rank === 1 ? '🥇 Top Performer' : rank === 2 ? '🥈 Runner Up' : '🥉 Third Place'}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'completedPledges',
      header: 'Completed',
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.completedPledges}</span>
      ),
    },
    {
      accessorKey: 'totalCollected',
      header: 'Total Collected',
      cell: ({ row }) => (
        <span className="text-success font-medium">
          {formatCurrency(row.original.totalCollected)}
        </span>
      ),
    },
    {
      accessorKey: 'overdueHandled',
      header: 'Overdue Handled',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.overdueHandled}</span>
      ),
    },
    {
      accessorKey: 'successRate',
      header: 'Success Rate',
      cell: ({ row }) => {
        const rate = row.original.successRate;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  rate >= 85 ? 'bg-success' : rate >= 70 ? 'bg-warning' : 'bg-destructive'
                }`}
                style={{ width: `${rate}%` }}
              />
            </div>
            <span className={`font-medium ${
              rate >= 85 ? 'text-success' : rate >= 70 ? 'text-warning' : 'text-destructive'
            }`}>
              {rate}%
            </span>
          </div>
        );
      },
    },
  ];

  const chartData = performanceData
    .sort((a, b) => b.totalCollected - a.totalCollected)
    .slice(0, 6);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Follow-Up Performance</h2>
        <p className="text-muted-foreground">Track and compare follow-up user performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Top Performer"
          value={topPerformer.name}
          subtitle={`${topPerformer.successRate}% success rate`}
          icon={Trophy}
          iconColor="text-warning"
        />
        <StatCard
          title="Total Completed"
          value={totalCompleted}
          subtitle="Pledges completed this period"
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalCollected)}
          icon={TrendingUp}
          iconColor="text-primary"
        />
        <StatCard
          title="Avg Success Rate"
          value={`${avgSuccessRate}%`}
          icon={Target}
          iconColor="text-info"
        />
      </div>

      {/* Chart */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Collection by Follow-Up User</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar
              dataKey="totalCollected"
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              name="Total Collected"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Table */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Performance Rankings</h3>
        <DataTable
          columns={columns}
          data={performanceData.sort((a, b) => b.successRate - a.successRate)}
          searchPlaceholder="Search follow-up users..."
        />
      </div>
    </div>
  );
};

export default FollowUpPerformance;
