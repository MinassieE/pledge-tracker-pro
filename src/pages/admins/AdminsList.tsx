import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { adminsApi } from '@/api/admins';
import { Admin } from '@/types';

const AdminsList: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ first_name: '', middle_name: '', email: '' });

  // Note: No backend endpoint exists to list all admins
  // This is a placeholder - you'll need to create the endpoint
  const admins: Admin[] = [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: { first_name: string; middle_name: string; email: string }) =>
      adminsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['allAdmins'] });
      toast({
        title: 'Admin created',
        description: response.password 
          ? `Admin created. Temporary password: ${response.password}` 
          : 'Admin created successfully.',
      });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create admin.',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!formData.first_name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({ first_name: '', middle_name: '', email: '' });
  };

  const columns: ColumnDef<Admin>[] = [
    {
      accessorKey: 'first_name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {(row.original.first_name || row.original.name || '?').charAt(0)}
            </span>
          </div>
          <span className="font-medium text-foreground">
            {row.original.first_name} {row.original.middle_name || ''}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
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
            <DropdownMenuItem disabled>
              No actions available (endpoints missing)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Admins</h2>
          <p className="text-muted-foreground">Add admin users (list endpoint not available)</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> The backend does not have an endpoint to list all admins. 
          You can create new admins, but the list will be empty until the endpoint is added.
        </p>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={admins}
        searchPlaceholder="Search admins..."
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add New Admin"
        description="Create a new admin account. A temporary password will be generated."
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              placeholder="Enter first name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              placeholder="Enter middle name"
              value={formData.middle_name}
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminsList;
