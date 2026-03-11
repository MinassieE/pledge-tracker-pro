import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Phone,
  FolderKanban,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { pledgesApi } from '@/api/pledges';
import { projectsApi } from '@/api/projects';
import { useProject } from '@/context/ProjectContext';
import { Pledge } from '@/types';

const FollowUpDashboard: React.FC = () => {
  const { selectedProjectId, setSelectedProjectId } = useProject();

  // Fetch user's assigned projects to validate access
  const { data: userProjects = [] } = useQuery({
    queryKey: ['userProjects'],
    queryFn: projectsApi.getAll,
  });

  // Clear selectedProjectId if user doesn't have access to it
  React.useEffect(() => {
    if (selectedProjectId && userProjects.length > 0) {
      const hasAccess = userProjects.some(p => p._id === selectedProjectId);
      if (!hasAccess) {
        setSelectedProjectId(null);
      }
    }
  }, [selectedProjectId, userProjects, setSelectedProjectId]);

  // Fetch selected project details
  const { data: selectedProject } = useQuery({
    queryKey: ['project', selectedProjectId],
    queryFn: () => projectsApi.getById(selectedProjectId!),
    enabled: !!selectedProjectId && userProjects.some(p => p._id === selectedProjectId),
  });

  // Fetch assigned pledges
  const { data: pledges = [], isLoading, error } = useQuery({
    queryKey: ['myPledges', selectedProjectId],
    queryFn: pledgesApi.getMyPledges,
    enabled: !!selectedProjectId,
  });

  // Fetch overdue pledges
  const { data: overduePledges = [] } = useQuery({
    queryKey: ['overduePledges', selectedProjectId],
    queryFn: pledgesApi.getOverdue,
    enabled: !!selectedProjectId,
  });

  // Fetch due monthly pledges
  const { data: dueMonthlyPledges = [] } = useQuery({
    queryKey: ['dueMonthlyPledges', selectedProjectId],
    queryFn: pledgesApi.getDueMonthly,
    enabled: !!selectedProjectId,
  });

  // Calculate stats from fetched data
  const stats = {
    assignedPledges: pledges.length,
    completedPledges: pledges.filter((p: Pledge) => p.status === 'paid').length,
    pendingPledges: pledges.filter((p: Pledge) => p.status === 'pending' || p.status === 'partial').length,
    overduePledges: overduePledges.length,
  };

  const formatCurrency = (value: number, currency: string = 'ETB') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select a project to view dashboard</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  const recentPledges = pledges.slice(0, 5);
  const progressPercentage = stats.assignedPledges > 0 
    ? (stats.completedPledges / stats.assignedPledges) * 100 
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Project Header */}
      {selectedProject && (
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{selectedProject.name}</h2>
              {selectedProject.description && (
                <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              selectedProject.status === 'active'
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : selectedProject.status === 'inactive'
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Pledges"
          value={stats.assignedPledges}
          icon={FileText}
          iconColor="text-primary"
        />
        <StatCard
          title="Completed"
          value={stats.completedPledges}
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Pending"
          value={stats.pendingPledges}
          icon={Clock}
          iconColor="text-warning"
        />
        <StatCard
          title="Overdue"
          value={stats.overduePledges}
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
      </div>

      {/* Progress Overview */}
      <div className="stat-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">Your Progress</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Collection Progress</span>
            <span className="text-sm font-bold text-foreground">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-success">{stats.completedPledges}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{stats.pendingPledges}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{stats.overduePledges}</p>
            <p className="text-xs text-muted-foreground">Need Action</p>
          </div>
        </div>
      </div>

      {/* Due This Month Alert */}
      {dueMonthlyPledges.length > 0 && (
        <div className="stat-card border-warning/50 bg-warning/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Due This Month</h3>
              <p className="text-muted-foreground mt-1">
                You have {dueMonthlyPledges.length} pledge(s) due this month.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assigned Pledges Table */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Your Assigned Pledges</h3>
          <Link to="/my-pledges">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {recentPledges.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-muted-foreground uppercase">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentPledges.map((pledge: Pledge) => (
                  <tr key={pledge._id} className="table-row-hover">
                    <td className="py-3 font-medium text-foreground">
                      {pledge.fullName || pledge.full_name || 'N/A'}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {pledge.phone || pledge.phone_number || 'N/A'}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {pledge.pledgeType === 'cash' || pledge.pledge_type === 'cash'
                        ? formatCurrency(pledge.amount || 0, pledge.currency || 'ETB')
                        : pledge.materialType || pledge.material_type || 'Material'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={pledge.status || 'pending'} />
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {pledge.promisedDate || pledge.promised_date
                        ? new Date(pledge.promisedDate || pledge.promised_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Link to={`/pledges/${pledge._id}`}>
                          <Button size="sm" variant="outline" className="h-8">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">No pledges assigned yet.</p>
        )}
      </div>

      {/* Urgent Actions */}
      {stats.overduePledges > 0 && (
        <div className="stat-card border-destructive/50 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">Urgent Action Required</h3>
              <p className="text-muted-foreground mt-1">
                You have {stats.overduePledges} overdue pledge(s) that need immediate attention.
              </p>
              <Link to="/pledges/overdue" className="inline-block mt-3">
                <Button variant="destructive" size="sm">
                  View Overdue Pledges
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpDashboard;
