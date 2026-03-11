import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '@/api/projects';

interface ProjectContextType {
  selectedProject: Project | null;
  selectedProjectId: string | null;
  setSelectedProject: (project: Project | null) => void;
  setSelectedProjectId: (projectId: string | null) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Load selected project ID from localStorage on mount
  useEffect(() => {
    const storedProjectId = localStorage.getItem('selectedProjectId');
    if (storedProjectId) {
      setSelectedProjectId(storedProjectId);
    }
  }, []);

  // Save selected project ID to localStorage when it changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProjectId]);

  const value: ProjectContextType = {
    selectedProject,
    selectedProjectId,
    setSelectedProject,
    setSelectedProjectId,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
