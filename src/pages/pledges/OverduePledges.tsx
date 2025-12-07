import React from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pledge } from '@/types';

const OverduePledges: React.FC = () => {
  // Mock data for demo
  const mockPledges: Pledge[] = [
    {
      _id: '1',
      fullName: 'Fatuma Ahmed',
      phone: '+251922345678',
      pledgeType: 'cash',
      amount: 1000,
      currency: 'USD',
      promisedDate: '2024-01-10',
      status: 'overdue',
      payments: [],
      totalPaid: 0,
      createdAt: '2024-01-02',
    },
    {
      _id: '2',
      fullName: 'Yonas Bekele',
      phone: '+251955678901',
      pledgeType: 'cash',
      amount: 30000,
      currency: 'ETB',
      promisedDate: '2024-01-05',
      status: 'overdue',
      payments: [],
      totalPaid: 10000,
      createdAt: '2024-01-01',
    },
    {
      _id: '3',
      fullName: 'Hana Girma',
      phone: '+251912345678',
      pledgeType: 'material',
      materialType: 'Office Equipment',
      promisedDate: '2024-01-08',
      status: 'overdue',
      payments: [],
      totalPaid: 0,
      createdAt: '2024-01-03',
    },
  ];

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
          <p className="font-medium text-foreground">{row.original.fullName}</p>
          <p className="text-xs text-muted-foreground">{row.original.phone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) =>
        row.original.pledgeType === 'cash'
          ? formatCurrency(row.original.amount, row.original.currency)
          : row.original.materialType || '-',
    },
    {
      accessorKey: 'promisedDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-destructive font-medium">
          {new Date(row.original.promisedDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'daysOverdue',
      header: 'Days Overdue',
      cell: ({ row }) => {
        const days = getDaysOverdue(row.original.promisedDate);
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
      cell: ({ row }) =>
        row.original.pledgeType === 'cash'
          ? formatCurrency(row.original.totalPaid, row.original.currency)
          : '-',
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
          {mockPledges.length} pledge(s) require immediate attention
        </p>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={mockPledges}
        searchPlaceholder="Search overdue pledges..."
      />
    </div>
  );
};

export default OverduePledges;
