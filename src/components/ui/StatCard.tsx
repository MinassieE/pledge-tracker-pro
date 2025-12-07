import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconColor = 'text-primary',
}) => {
  return (
    <div className={cn('stat-card fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="ml-1 text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-lg bg-primary/10', iconColor.replace('text-', 'bg-').replace('primary', 'primary/10'))}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  );
};
