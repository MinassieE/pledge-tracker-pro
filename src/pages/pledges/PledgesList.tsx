import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
import { Pledge, PledgeStatus, PledgeType } from '@/types';

const PledgesList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<PledgeStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PledgeType | 'all'>('all');

  // Mock data for demo
  const mockPledges: Pledge[] = [
    {
      _id: '1',
      fullName: 'Abebe Kebede',
      phone: '+251911234567',
      address: 'Addis Ababa, Ethiopia',
      pledgeType: 'cash',
      amount: 50000,
      currency: 'ETB',
      promisedDate: '2024-01-20',
      status: 'paid',
      payments: [],
      totalPaid: 50000,
      createdAt: '2024-01-01',
    },
    {
      _id: '2',
      fullName: 'Fatuma Ahmed',
      phone: '+251922345678',
      address: 'Dire Dawa, Ethiopia',
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
      _id: '3',
      fullName: 'Dawit Haile',
      phone: '+251933456789',
      pledgeType: 'cash',
      amount: 25000,
      currency: 'ETB',
      promisedDate: '2024-01-15',
      status: 'partial',
      payments: [],
      totalPaid: 15000,
      createdAt: '2024-01-03',
    },
    {
      _id: '4',
      fullName: 'Sara Tesfaye',
      phone: '+251944567890',
      pledgeType: 'material',
      materialType: 'Construction Materials',
      promisedDate: '2024-01-25',
      status: 'pending',
      payments: [],
      totalPaid: 0,
      createdAt: '2024-01-04',
    },
    {
      _id: '5',
      fullName: 'Yonas Bekele',
      phone: '+251955678901',
      pledgeType: 'cash',
      amount: 75000,
      currency: 'ETB',
      promisedDate: '2024-01-18',
      status: 'paid',
      payments: [],
      totalPaid: 75000,
      createdAt: '2024-01-05',
    },
    {
      _id: '6',
      fullName: 'Meron Tadesse',
      phone: '+251966789012',
      pledgeType: 'cash',
      amount: 2000,
      currency: 'USD',
      promisedDate: '2024-02-01',
      status: 'pending',
      payments: [],
      totalPaid: 0,
      createdAt: '2024-01-06',
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
      accessorKey: 'pledgeType',
      header: 'Type',
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">{row.original.pledgeType}</span>
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
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'promisedDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.promisedDate).toLocaleDateString()}
        </span>
      ),
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

  const filteredPledges = mockPledges.filter((pledge) => {
    if (statusFilter !== 'all' && pledge.status !== statusFilter) return false;
    if (typeFilter !== 'all' && pledge.pledgeType !== typeFilter) return false;
    return true;
  });

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

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PledgeType | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
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
