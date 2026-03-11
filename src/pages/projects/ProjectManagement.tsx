import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, MoreHorizontal, Edit, Power, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { projectsApi, Project, ProjectStatus, CreateProjectPayload, UpdateProjectPayload } from '@/api/projects';

const ProjectManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<CreateProjectPayload>({
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
  });

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectPayload) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Success', description: 'Project created successfully.' });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create project.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({ title: 'Success', description: 'Project updated successfully.' });
      setIsEditModalOpen(false);
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update project.',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = () => {
    if (!formData.name || !formData.start_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    updateMutation.mutate({
      id: selectedProject._id,
      data: {
        name: formData.name,
        description: formData.description,
      },
    });
  };

  const handleStatusChange = (project: Project, newStatus: ProjectStatus) => {
    updateMutation.mutate({
      id: project._id,
      data: { status: newStatus },
    });
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      start_date: project.start_date.split('T')[0],
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground">{row.original.description}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors = {
          active: 'bg-green-500/10 text-green-500 border-green-500/20',
          inactive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          closed: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'total_promised_amount',
      header: 'Total Promised',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.total_promised_amount)}
        </span>
      ),
    },
    {
      accessorKey: 'total_collected_amount',
      header: 'Total Collected',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.total_collected_amount)}
        </span>
      ),
    },
    {
      accessorKey: 'collection_percentage',
      header: 'Collection %',
      cell: ({ row }) => {
        const promised = row.original.total_promised_amount || 0;
        const collected = row.original.total_collected_amount || 0;
        const percentage = promised > 0 ? Math.round((collected / promised) * 100) : 0;
        
        // Color coding based on percentage
        const getColor = (pct: number) => {
          if (pct >= 75) return 'text-green-600 bg-green-50 border-green-200';
          if (pct >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
          if (pct >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
          return 'text-red-600 bg-red-50 border-red-200';
        };
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor(percentage)}`}>
            {percentage}%
          </span>
        );
      },
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.start_date).toLocaleDateString()}
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
            <DropdownMenuItem onClick={() => navigate(`/projects/${row.original._id}/assignments`)}>
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditModal(row.original)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original, 'active')}
              disabled={row.original.status === 'active'}
            >
              <Power className="h-4 w-4 mr-2" />
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original, 'inactive')}
              disabled={row.original.status === 'inactive'}
            >
              <Power className="h-4 w-4 mr-2" />
              Set Inactive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange(row.original, 'closed')}
              disabled={row.original.status === 'closed'}
            >
              <Power className="h-4 w-4 mr-2" />
              Set Closed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <p className="text-destructive">Failed to load projects. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Projects</h2>
          <p className="text-muted-foreground">Create and manage fundraising projects</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        searchPlaceholder="Search projects..."
      />

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Create New Project"
        description="Create a new fundraising project"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        title="Edit Project"
        description="Update project details"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setSelectedProject(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Project'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_name">Project Name *</Label>
            <Input
              id="edit_name"
              placeholder="Enter project name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectManagement;
