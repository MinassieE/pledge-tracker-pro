import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { pledgesApi } from '@/api/pledges';
import { Pledge } from '@/types';

const OverduePledges: React.FC = () => {
  const { data: pledges = [], isLoading, error } = useQuery({
    queryKey: ['overduePledges'],
    queryFn: pledgesApi.getOverdue,
  });

  const formatCurrency = (value: number | undefined, currency: string = 'ETB') => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const columns: ColumnDef<Pledge>[] = [
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.fullName || row.original.full_name || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.phone || row.original.phone_number || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const pledgeType = row.original.pledgeType || row.original.pledge_type;
        return pledgeType === 'cash'
          ? formatCurrency(row.original.amount, row.original.currency)
          : row.original.materialType || row.original.material_type || '-';
      },
    },
    {
      accessorKey: 'promisedDate',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.original.promisedDate || row.original.promised_date;
        return (
          <span className="text-destructive font-medium">
            {date ? new Date(date).toLocaleDateString() : 'N/A'}
          </span>
        );
      },
    },
    {
      id: 'daysOverdue',
      header: 'Days Overdue',
      cell: ({ row }) => {
        const date = row.original.promisedDate || row.original.promised_date;
        if (!date) return '-';
        const days = getDaysOverdue(date);
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            {days} days
          </span>
        );
      },
    },
    {
      accessorKey: 'totalPaid',
      header: 'Paid',
      cell: ({ row }) => {
        const pledgeType = row.original.pledgeType || row.original.pledge_type;
        return pledgeType === 'cash'
          ? formatCurrency(row.original.totalPaid || row.original.total_paid, row.original.currency)
          : '-';
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Phone className="h-4 w-4" />
          </Button>
          <Link to={`/pledges/${row.original._id}`}>
            <Button size="sm" variant="outline" className="h-8">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load overdue pledges. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Alert Banner */}
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">Overdue Pledges Require Attention</h3>
          <p className="text-muted-foreground mt-1">
            These pledges have passed their promised date and need immediate follow-up.
            Contact the pledgers to arrange payment or update the status.
          </p>
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overdue Pledges</h2>
        <p className="text-muted-foreground">
          {pledges.length} pledge(s) require immediate attention
        </p>
      </div>

      {/* Table */}
      {pledges.length > 0 ? (
        <DataTable
          columns={columns}
          data={pledges}
          searchPlaceholder="Search overdue pledges..."
        />
      ) : (
        <div className="stat-card text-center py-12">
          <p className="text-muted-foreground">No overdue pledges found.</p>
        </div>
      )}
    </div>
  );
};

export default OverduePledges;
