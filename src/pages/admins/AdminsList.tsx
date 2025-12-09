import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';
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
import { Admin } from '@/types';

const AdminsList: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  // Mock data for demo
  const mockAdmins: Admin[] = [
    { _id: '1', first_name: 'Solomon', name: 'Solomon Hailu', email: 'solomon@example.com', phone: '+251911111111', role: 'admin', createdAt: '2024-01-01' },
    { _id: '2', first_name: 'Tigist', name: 'Tigist Mengistu', email: 'tigist@example.com', phone: '+251922222222', role: 'admin', createdAt: '2024-01-02' },
    { _id: '3', first_name: 'Bereket', name: 'Bereket Tadesse', email: 'bereket@example.com', phone: '+251933333333', role: 'admin', createdAt: '2024-01-03' },
    { _id: '4', first_name: 'Almaz', name: 'Almaz Yohannes', email: 'almaz@example.com', phone: '+251944444444', role: 'admin', createdAt: '2024-01-04' },
  ];

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
      title: 'Admin created',
      description: `${formData.name} has been added as an admin.`,
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
      title: 'Admin updated',
      description: `${formData.name}'s information has been updated.`,
    });
    setIsEditModalOpen(false);
    resetForm();
  };

  const handleDelete = (admin: Admin) => {
    toast({
      title: 'Admin deleted',
      description: `${admin.name || admin.first_name} has been removed.`,
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '' });
    setSelectedAdmin(null);
  };

  const openEditModal = (admin: Admin) => {
    setSelectedAdmin(admin);
    setFormData({ name: admin.name || admin.first_name || '', email: admin.email, phone: admin.phone || '', password: '' });
    setIsEditModalOpen(true);
  };

  const columns: ColumnDef<Admin>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {(row.original.name || row.original.first_name || '?').charAt(0)}
            </span>
          </div>
          <span className="font-medium text-foreground">{row.original.name || row.original.first_name}</span>
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
          <h2 className="text-2xl font-bold text-foreground">Manage Admins</h2>
          <p className="text-muted-foreground">Add, edit, or remove admin users</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={mockAdmins}
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
        description="Create a new admin account."
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Admin</Button>
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
        title="Edit Admin"
        description="Update admin information."
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

export default AdminsList;
