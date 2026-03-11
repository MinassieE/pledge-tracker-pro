import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { toast } from '@/hooks/use-toast';
import { projectsApi, Project } from '@/api/projects';
import { adminsApi } from '@/api/admins';
import { followUpsApi } from '@/api/followUps';
import { Admin, FollowUpUser } from '@/types';

const UserAssignment: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId!),
    enabled: !!projectId,
  });

  const { data: admins = [], isLoading: adminsLoading } = useQuery({
    queryKey: ['allAdmins'],
    queryFn: () => adminsApi.getAll({ all: true }),
  });

  const { data: followUps = [], isLoading: followUpsLoading } = useQuery({
    queryKey: ['allFollowUps'],
    queryFn: () => followUpsApi.getAll({ all: true }),
  });

  const { data: assignedUsers = [], isLoading: assignedLoading } = useQuery({
    queryKey: ['projectAssignments', projectId],
    queryFn: () => projectsApi.getAssignedUsers(projectId!),
    enabled: !!projectId,
  });

  const assignMutation = useMutation({
    mutationFn: (userIds: string[]) => projectsApi.assignUsers(projectId!, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssignments', projectId] });
      toast({
        title: 'Success',
        description: 'Users assigned successfully. Notification emails have been sent.',
      });
      setSelectedUserIds([]);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to assign users.',
        variant: 'destructive',
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeUser(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectAssignments', projectId] });
      toast({ title: 'Success', description: 'User removed from project.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to remove user.',
        variant: 'destructive',
      });
    },
  });

  const allUsers = [
    ...admins.map(a => ({ ...a, userType: 'admin' as const })),
    ...followUps.map(f => ({ ...f, userType: 'followUp' as const })),
  ];

  const assignedUserIds = new Set(assignedUsers.map((u: any) => u.user_id || u._id));
  const availableUsers = allUsers.filter(u => !assignedUserIds.has(u._id));

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAssign = () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one user.',
        variant: 'destructive',
      });
      return;
    }
    assignMutation.mutate(selectedUserIds);
  };

  const handleRemove = (userId: string) => {
    removeMutation.mutate(userId);
  };

  if (projectLoading || adminsLoading || followUpsLoading || assignedLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Assignment</h2>
          <p className="text-muted-foreground">Assign users to {project.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Users */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Available Users</h3>
              <Button
                onClick={handleAssign}
                disabled={selectedUserIds.length === 0 || assignMutation.isPending}
                size="sm"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Selected ({selectedUserIds.length})
              </Button>
            </div>

            {availableUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">All users are already assigned to this project.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent cursor-pointer"
                    onClick={() => handleToggleUser(user._id)}
                  >
                    <Checkbox
                      checked={selectedUserIds.includes(user._id)}
                      onCheckedChange={() => handleToggleUser(user._id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {user.first_name} {user.middle_name || ''}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.userType === 'admin'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-green-500/10 text-green-500'
                    }`}>
                      {user.userType === 'admin' ? 'Admin' : 'Follow-Up'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Assigned Users */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assigned Users ({assignedUsers.length})</h3>

            {assignedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users assigned yet.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {assignedUsers.map((assignment: any) => {
                  const user = allUsers.find(u => u._id === (assignment.user_id || assignment._id));
                  if (!user) return null;

                  return (
                    <div
                      key={assignment._id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.first_name} {user.middle_name || ''}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {assignment.assigned_at && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.userType === 'admin'
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {user.userType === 'admin' ? 'Admin' : 'Follow-Up'}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(user._id)}
                          disabled={removeMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAssignment;
