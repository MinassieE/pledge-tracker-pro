import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, Project } from '@/api/projects';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';

interface ProjectSelectorProps {
  selectedProjectId: string | null;
  onProjectChange: (projectId: string) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  selectedProjectId,
  onProjectChange,
}) => {
  const { role } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  useEffect(() => {
    if (data) {
      setProjects(data);
      
      // Auto-select first project if none selected
      if (!selectedProjectId && data.length > 0) {
        onProjectChange(data[0]._id);
      }
    }
  }, [data, selectedProjectId, onProjectChange]);

  if (isLoading) {
    return (
      <div className="w-64">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading projects..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 text-sm text-red-500">
        Failed to load projects
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-64 text-sm text-muted-foreground">
        No projects assigned. Contact your administrator.
      </div>
    );
  }

  return (
    <div className="w-64">
      <Select value={selectedProjectId || undefined} onValueChange={onProjectChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project._id} value={project._id}>
              <div className="flex items-center gap-2">
                <span>{project.name}</span>
                {project.status !== 'active' && (
                  <span className="text-xs text-muted-foreground">
                    ({project.status})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
