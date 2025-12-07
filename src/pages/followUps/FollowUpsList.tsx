import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { FollowUpUser } from '@/types';

const FollowUpsList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpUser | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', assignedAdmin: '' });

  // Mock data
  const mockAdmins = [
    { _id: '1', name: 'Solomon Hailu' },
    { _id: '2', name: 'Tigist Mengistu' },
    { _id: '3', name: 'Bereket Tadesse' },
  ];

  const mockFollowUps: (FollowUpUser & { adminName?: string })[] = [
    { _id: '1', name: 'Marta Solomon', email: 'marta@example.com', phone: '+251911234567', role: 'followUp' as const, assignedAdmin: '1', createdAt: '2024-01-01' },
    { _id: '2', name: 'Dawit Hailu', email: 'dawit@example.com', phone: '+251922345678', role: 'followUp' as const, assignedAdmin: '1', createdAt: '2024-01-02' },
    { _id: '3', name: 'Sara Tadesse', email: 'sara@example.com', phone: '+251933456789', role: 'followUp' as const, assignedAdmin: '2', createdAt: '2024-01-03' },
    { _id: '4', name: 'Yonas Berhane', email: 'yonas@example.com', phone: '+251944567890', role: 'followUp' as const, assignedAdmin: '2', createdAt: '2024-01-04' },
    { _id: '5', name: 'Helen Gebre', email: 'helen@example.com', phone: '+251955678901', role: 'followUp' as const, assignedAdmin: '3', createdAt: '2024-01-05' },
  ].map(f => ({
    ...f,
    adminName: mockAdmins.find(a => a._id === f.assignedAdmin)?.name,
  }));

  const handleCreate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Follow-up user created',
      description: `${formData.name} has been added as a follow-up user.`,
    });
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Follow-up user updated',
      description: `${formData.name}'s information has been updated.`,
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDelete = (user: FollowUpUser) => {
    toast({
      title: 'Follow-up user deleted',
      description: `${user.name} has been removed.`,
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '', assignedAdmin: '' });
    setSelectedFollowUp(null);
  };

  const openEditModal = (user: FollowUpUser) => {
    setSelectedFollowUp(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      assignedAdmin: user.assignedAdmin || '',
    });
    setIsEditModalOpen(true);
  };

  const columns: ColumnDef<FollowUpUser & { adminName?: string }>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-success/10 flex items-center justify-center">
            <span className="text-sm font-medium text-success">
              {row.original.name.charAt(0)}
            </span>
          </div>
          <span className="font-medium text-foreground">{row.original.name}</span>
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
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.phone || '-'}</span>
      ),
    },
    {
      accessorKey: 'adminName',
      header: 'Assigned Admin',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.adminName || '-'}</span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
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
            <DropdownMenuItem onClick={() => openEditModal(row.original)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleDelete(row.original)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const FormFields = ({ isCreate = false }: { isCreate?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          placeholder="+251..."
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Assigned Admin</Label>
        <Select
          value={formData.assignedAdmin}
          onValueChange={(value) => setFormData({ ...formData, assignedAdmin: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an admin" />
          </SelectTrigger>
          <SelectContent>
            {mockAdmins.map((admin) => (
              <SelectItem key={admin._id} value={admin._id}>
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {isCreate && (
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Follow-Ups</h2>
          <p className="text-muted-foreground">Add, edit, or remove follow-up users</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Follow-Up
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={mockFollowUps}
        searchPlaceholder="Search follow-up users..."
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Add New Follow-Up User"
        description="Create a new follow-up user account."
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create User</Button>
          </div>
        }
      >
        <FormFields isCreate />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        title="Edit Follow-Up User"
        description="Update follow-up user information."
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </div>
        }
      >
        <FormFields />
      </Modal>
    </div>
  );
};

export default FollowUpsList;
