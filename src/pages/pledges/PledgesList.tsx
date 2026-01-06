import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { pledgesApi } from '@/api/pledges';
import { Pledge, PledgeStatus } from '@/types';

const PledgesList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<PledgeStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'oneTime' | 'monthly' | 'material' | 'all'>('all');

  // Fetch all pledges from backend
  const { data: pledges = [], isLoading, error } = useQuery({
    queryKey: ['allPledges'],
    queryFn: pledgesApi.getAll,
  });

  const formatCurrency = (value: number | undefined, currency: string = 'ETB') => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnDef<Pledge>[] = [
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-foreground">
            {row.original.full_name || row.original.fullName || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.phone_number || row.original.phone || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'contribution_type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.contribution_type || row.original.contributionType || 'oneTime';
        return <span className="capitalize text-muted-foreground">{type}</span>;
      },
    },
    {
      accessorKey: 'promised_amount',
      header: 'Amount',
      cell: ({ row }) => {
        const type = row.original.contribution_type || row.original.contributionType;
        if (type === 'material') {
          return row.original.material_type || row.original.materialType || '-';
        }
        return formatCurrency(row.original.promised_amount || row.original.amount, row.original.currency);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status || 'pending'} />,
    },
    {
      accessorKey: 'promised_end_date',
      header: 'Due Date',
      cell: ({ row }) => {
        const date = row.original.promised_end_date || row.original.promised_date || row.original.promisedDate;
        return (
          <span className="text-muted-foreground">
            {date ? new Date(date).toLocaleDateString() : 'N/A'}
          </span>
        );
      },
    },
    {
      accessorKey: 'total_paid',
      header: 'Paid',
      cell: ({ row }) => {
        const type = row.original.contribution_type || row.original.contributionType;
        if (type === 'material') return '-';
        return formatCurrency(row.original.total_paid || row.original.totalPaid, row.original.currency);
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/pledges/${row.original._id}`} className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to={`/pledges/${row.original._id}/edit`} className="flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  // Filter pledges based on selected filters
  const filteredPledges = pledges.filter((pledge) => {
    if (statusFilter !== 'all' && pledge.status !== statusFilter) return false;
    const pledgeType = pledge.contribution_type || pledge.contributionType;
    if (typeFilter !== 'all' && pledgeType !== typeFilter) return false;
    return true;
  });

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
        <p className="text-destructive">Failed to load pledges. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Pledges</h2>
          <p className="text-muted-foreground">Manage and track all pledge records</p>
        </div>
        <Link to="/pledges/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Pledge
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as PledgeStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'oneTime' | 'monthly' | 'material' | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="oneTime">One Time</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="material">Material</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPledges}
        searchPlaceholder="Search pledges..."
      />
    </div>
  );
};

export default PledgesList;
