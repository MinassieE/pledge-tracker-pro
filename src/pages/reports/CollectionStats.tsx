import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  DollarSign,
  TrendingUp,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { reportsApi } from '@/api/reports';
import { pledgesApi } from '@/api/pledges';
import { Pledge } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useProject } from '@/context/ProjectContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const { selectedProjectId } = useProject();
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  // Fetch collection stats from backend
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['collectionStats', selectedProjectId],
    queryFn: reportsApi.getCollectionStats,
    enabled: !!selectedProjectId,
  });

  // Fetch all pledges for additional calculations
  const { data: pledges = [] } = useQuery({
    queryKey: ['allPledges', selectedProjectId],
    queryFn: pledgesApi.getAll,
    enabled: !!selectedProjectId,
  });

  // Filter pledges based on time filter
  const getFilteredPledges = () => {
    if (timeFilter === 'all') return pledges;

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timeFilter) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'custom':
        if (!customStartDate || !customEndDate) return pledges;
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        return pledges;
    }

    return pledges.filter((pledge: Pledge) => {
      // Filter by payment dates within the time range
      const hasPaymentInRange = pledge.payment_history?.some((payment: any) => {
        const paymentDate = new Date(payment.date || payment.paidAt);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
      return hasPaymentInRange;
    });
  };

  const filteredPledges = getFilteredPledges();

  // Calculate stats from filtered pledges
  const calculateStats = () => {
    let totalCollectedETB = 0;
    let totalCollectedUSD = 0;
    let totalPledgedETB = 0;
    let totalPledgedUSD = 0;

    filteredPledges.forEach((pledge: Pledge) => {
      const currency = pledge.currency || 'ETB';
      const amountPaid = pledge.amount_paid || 0;
      const promisedAmount = pledge.promised_amount || 0;

      if (currency === 'ETB') {
        totalCollectedETB += amountPaid;
        totalPledgedETB += promisedAmount;
      } else if (currency === 'USD') {
        totalCollectedUSD += amountPaid;
        totalPledgedUSD += promisedAmount;
      }
    });

    return {
      totalPledges: filteredPledges.length,
      totalCollectedETB,
      totalCollectedUSD,
      remainingBalanceETB: totalPledgedETB - totalCollectedETB,
      remainingBalanceUSD: totalPledgedUSD - totalCollectedUSD,
      paidCount: filteredPledges.filter((p: Pledge) => p.status === 'paid').length,
      pendingCount: filteredPledges.filter((p: Pledge) => p.status === 'notPaid').length,
      partialCount: filteredPledges.filter((p: Pledge) => p.status === 'partial').length,
      overdueCount: filteredPledges.filter((p: Pledge) => p.overdue).length,
    };
  };

  const calculatedStats = calculateStats();

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

      {/* Time Filter Section */}
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Time Filter</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <Label htmlFor="timeFilter">Filter By</Label>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger id="timeFilter">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {timeFilter === 'custom' && (
            <>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {timeFilter !== 'all' && (
          <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Showing:</strong> Collections from{' '}
              {timeFilter === 'custom' && customStartDate && customEndDate
                ? `${new Date(customStartDate).toLocaleDateString()} to ${new Date(customEndDate).toLocaleDateString()}`
                : timeFilter === 'today'
                ? 'today'
                : timeFilter === 'week'
                ? 'the last 7 days'
                : timeFilter === 'month'
                ? 'the last month'
                : timeFilter === 'quarter'
                ? 'the last quarter'
                : 'the last year'}
            </p>
          </div>
        )}
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
