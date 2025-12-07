import React from 'react';
import { cn } from '@/lib/utils';
import { PledgeStatus } from '@/types';

interface StatusBadgeProps {
  status: PledgeStatus;
  className?: string;
}

const statusConfig: Record<PledgeStatus, { label: string; className: string }> = {
  paid: {
    label: 'Paid',
    className: 'bg-success/10 text-success border-success/20',
  },
  pending: {
    label: 'Pending',
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  partial: {
    label: 'Partial',
    className: 'bg-info/10 text-info border-info/20',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
