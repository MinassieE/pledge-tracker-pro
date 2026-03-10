import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Eye, Edit, Trash2, MoreHorizontal, Upload, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
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
import { followUpsApi } from '@/api/followUps';
import { Pledge, PledgeStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';

const PledgesList: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<PledgeStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'oneTime' | 'monthly' | 'material' | 'all'>('all');
  const [followUpFilter, setFollowUpFilter] = useState<string>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'ETB' | 'USD' | 'all'>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pledgeToDelete, setPledgeToDelete] = useState<Pledge | null>(null);
  const [selectedPledges, setSelectedPledges] = useState<string[]>([]);
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false);
  const [selectedFollowUpForBulk, setSelectedFollowUpForBulk] = useState('');
  const location = useLocation();
  const { role } = useAuth();
  const queryClient = useQueryClient();

  // Determine which API to call based on route and role
  const isMyPledges = location.pathname === '/my-pledges';
  const isDueMonthly = location.pathname === '/pledges/due-monthly';
  const isOverdue = location.pathname === '/pledges/overdue';
  const isAllPledges = location.pathname === '/pledges';

  // Fetch pledges based on the route
  const { data: pledges = [], isLoading, error } = useQuery({
    queryKey: isMyPledges ? ['myPledges'] : isDueMonthly ? ['dueMonthlyPledges'] : isOverdue ? ['overduePledges'] : ['allPledges'],
    queryFn: isMyPledges ? pledgesApi.getMyPledges : isDueMonthly ? pledgesApi.getDueMonthly : isOverdue ? pledgesApi.getOverdue : pledgesApi.getAll,
  });

  // Fetch follow-ups for filter dropdown (only for admin/superAdmin on All Pledges page)
  const { data: followUps = [] } = useQuery({
    queryKey: ['allFollowUps'],
    queryFn: followUpsApi.getAll,
    enabled: isAllPledges && (role === 'admin' || role === 'superAdmin'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => pledgesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPledges'] });
      queryClient.invalidateQueries({ queryKey: ['myPledges'] });
      queryClient.invalidateQueries({ queryKey: ['overduePledges'] });
      queryClient.invalidateQueries({ queryKey: ['dueMonthlyPledges'] });
      toast({
        title: 'Success',
        description: 'Pledge deleted successfully.',
      });
      setIsDeleteModalOpen(false);
      setPledgeToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete pledge.',
        variant: 'destructive',
      });
    },
  });

  // Bulk assignment mutation
  const bulkAssignMutation = useMutation({
    mutationFn: ({ pledgeIds, followUpId }: { pledgeIds: string[]; followUpId: string }) => 
      pledgesApi.assignMultipleToFollowUp(pledgeIds, followUpId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPledges'] });
      queryClient.invalidateQueries({ queryKey: ['myPledges'] });
      toast({
        title: 'Success',
        description: `Successfully assigned ${selectedPledges.length} pledge(s) to follow-up user.`,
      });
      setIsBulkAssignModalOpen(false);
      setSelectedFollowUpForBulk('');
      setSelectedPledges([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to assign pledges.',
        variant: 'destructive',
      });
    },
  });

  const handleDeleteClick = (pledge: Pledge) => {
    setPledgeToDelete(pledge);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (pledgeToDelete?._id) {
      deleteMutation.mutate(pledgeToDelete._id);
    }
  };

  const handleBulkAssignClick = () => {
    if (selectedPledges.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one pledge to assign.',
        variant: 'destructive',
      });
      return;
    }
    setIsBulkAssignModalOpen(true);
  };

  const handleBulkAssignConfirm = () => {
    if (!selectedFollowUpForBulk) {
      toast({
        title: 'Validation Error',
        description: 'Please select a follow-up user.',
        variant: 'destructive',
      });
      return;
    }
    bulkAssignMutation.mutate({
      pledgeIds: selectedPledges,
      followUpId: selectedFollowUpForBulk,
    });
  };

  const togglePledgeSelection = (pledgeId: string) => {
    setSelectedPledges(prev => 
      prev.includes(pledgeId) 
        ? prev.filter(id => id !== pledgeId)
        : [...prev, pledgeId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPledges.length === filteredPledges.length) {
      setSelectedPledges([]);
    } else {
      setSelectedPledges(filteredPledges.map(p => p._id));
    }
  };

  const formatCurrency = (value: number | undefined, currency: string = 'ETB') => {
    if (!value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnDef<Pledge>[] = [
    // Checkbox column (only for admin/superAdmin on All Pledges page)
    ...(isAllPledges && (role === 'admin' || role === 'superAdmin') ? [{
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedPledges.length > 0}
          onCheckedChange={toggleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: any) => (
        <Checkbox
          checked={selectedPledges.includes(row.original._id)}
          onCheckedChange={() => togglePledgeSelection(row.original._id)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }] : []),
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
        return formatCurrency(row.original.amount_paid || row.original.total_paid || row.original.totalPaid, row.original.currency);
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
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => handleDeleteClick(row.original)}
            >
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
    // Status filter
    if (statusFilter !== 'all' && pledge.status !== statusFilter) return false;
    
    // Type filter
    const pledgeType = pledge.contribution_type || pledge.contributionType;
    if (typeFilter !== 'all' && pledgeType !== typeFilter) return false;
    
    // Currency filter
    const pledgeCurrency = pledge.currency || 'ETB';
    if (currencyFilter !== 'all' && pledgeCurrency !== currencyFilter) return false;
    
    // Amount range filter (only for non-material pledges)
    if (pledgeType !== 'material') {
      const amount = pledge.promised_amount || pledge.amount || 0;
      const min = minAmount ? parseFloat(minAmount) : 0;
      
      if (minAmount && amount < min) return false;
    }
    
    // Follow-up filter (only on All Pledges page)
    if (isAllPledges && followUpFilter !== 'all') {
      if (followUpFilter === 'not-assigned') {
        // Show only pledges without assigned follow-up
        const assignedFollowUp = pledge.assigned_followup || pledge.assigned_follow_up || pledge.assignedFollowUp;
        if (assignedFollowUp) return false;
      } else {
        // Show only pledges assigned to specific follow-up
        const assignedFollowUpId = typeof pledge.assigned_followup === 'object' 
          ? pledge.assigned_followup?._id 
          : pledge.assigned_followup;
        if (assignedFollowUpId?.toString() !== followUpFilter) return false;
      }
    }
    
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
          <h2 className="text-2xl font-bold text-foreground">
            {isMyPledges ? 'My Pledges' : isDueMonthly ? 'Due This Month' : isOverdue ? 'Overdue Pledges' : 'All Pledges'}
          </h2>
          <p className="text-muted-foreground">
            {isMyPledges ? 'View and manage your assigned pledges' : isDueMonthly ? 'Pledges due this month' : isOverdue ? 'Pledges that are overdue' : 'Manage and track all pledge records'}
          </p>
          {selectedPledges.length > 0 && (
            <p className="text-sm text-primary mt-1">
              {selectedPledges.length} pledge(s) selected
            </p>
          )}
        </div>
        {role !== 'followUp' && !isDueMonthly && !isOverdue && (
          <div className="flex gap-2">
            {selectedPledges.length > 0 && (
              <Button variant="secondary" onClick={handleBulkAssignClick}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Selected ({selectedPledges.length})
              </Button>
            )}
            <Link to="/pledges/bulk-import">
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </Link>
            <Link to="/pledges/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Pledge
              </Button>
            </Link>
          </div>
        )}
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
            <SelectItem value="notPaid">Not Paid</SelectItem>
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

        <Select value={currencyFilter} onValueChange={(v) => setCurrencyFilter(v as 'ETB' | 'USD' | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            <SelectItem value="ETB">ETB</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Min amount"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="w-32"
        />

        {/* Follow-up filter - only show on All Pledges page for admin/superAdmin */}
        {isAllPledges && (role === 'admin' || role === 'superAdmin') && (
          <Select value={followUpFilter} onValueChange={setFollowUpFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by follow-up" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Follow-Ups</SelectItem>
              <SelectItem value="not-assigned">Not Assigned</SelectItem>
              {followUps.map((followUp) => (
                <SelectItem key={followUp._id || followUp.id} value={followUp._id || followUp.id || ''}>
                  {followUp.first_name} {followUp.middle_name || ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredPledges}
        searchPlaceholder="Search pledges..."
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setPledgeToDelete(null);
        }}
        title="Delete Pledge"
        description="Are you sure you want to delete this pledge? This action cannot be undone."
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteModalOpen(false);
                setPledgeToDelete(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        }
      >
        {pledgeToDelete && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-foreground">
                <strong>Name:</strong> {pledgeToDelete.full_name || pledgeToDelete.fullName}
              </p>
              <p className="text-sm text-foreground mt-1">
                <strong>Amount:</strong> {pledgeToDelete.currency || 'ETB'} {(pledgeToDelete.promised_amount || pledgeToDelete.amount || 0).toLocaleString()}
              </p>
              <p className="text-sm text-foreground mt-1">
                <strong>Status:</strong> {pledgeToDelete.status}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This will permanently delete the pledge and remove it from any assigned follow-up users.
            </p>
          </div>
        )}
      </Modal>

      {/* Bulk Assignment Modal */}
      <Modal
        isOpen={isBulkAssignModalOpen}
        onClose={() => {
          setIsBulkAssignModalOpen(false);
          setSelectedFollowUpForBulk('');
        }}
        title="Assign Pledges to Follow-Up"
        description={`Assign ${selectedPledges.length} selected pledge(s) to a follow-up user.`}
        footer={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBulkAssignModalOpen(false);
                setSelectedFollowUpForBulk('');
              }}
              disabled={bulkAssignMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssignConfirm}
              disabled={bulkAssignMutation.isPending}
            >
              {bulkAssignMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bulkFollowUpSelect">Follow-Up User</Label>
            <Select value={selectedFollowUpForBulk} onValueChange={setSelectedFollowUpForBulk}>
              <SelectTrigger>
                <SelectValue placeholder="Select a follow-up user" />
              </SelectTrigger>
              <SelectContent>
                {followUps.map((followUp) => (
                  <SelectItem key={followUp._id} value={followUp._id}>
                    {`${followUp.first_name || ''} ${followUp.middle_name || ''}`.trim() || followUp.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {followUps.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No follow-up users available. Please create one first.
              </p>
            )}
          </div>

          {/* Show already assigned pledges warning */}
          {(() => {
            const selectedPledgeObjects = pledges.filter(p => selectedPledges.includes(p._id));
            const alreadyAssigned = selectedPledgeObjects.filter(p => {
              const assignedFollowUpId = typeof p.assigned_followup === 'object' 
                ? p.assigned_followup?._id 
                : p.assigned_followup;
              return assignedFollowUpId && assignedFollowUpId !== selectedFollowUpForBulk;
            });

            if (alreadyAssigned.length > 0) {
              return (
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium text-foreground mb-2">
                    ⚠️ {alreadyAssigned.length} pledge(s) already assigned:
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {alreadyAssigned.map(pledge => {
                      const assignedFollowUp = typeof pledge.assigned_followup === 'object' 
                        ? pledge.assigned_followup 
                        : followUps.find(f => f._id === pledge.assigned_followup);
                      const followUpName = assignedFollowUp 
                        ? `${assignedFollowUp.first_name || ''} ${assignedFollowUp.middle_name || ''}`.trim() || assignedFollowUp.email
                        : 'Unknown';
                      
                      return (
                        <p key={pledge._id} className="text-xs text-muted-foreground">
                          • {pledge.full_name || pledge.fullName} → Currently assigned to: {followUpName}
                        </p>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    These pledges will be reassigned to the new follow-up user.
                  </p>
                </div>
              );
            }
            return null;
          })()}

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Selected Pledges:</strong> {selectedPledges.length}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              All selected pledges will be assigned to the chosen follow-up user.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PledgesList;
