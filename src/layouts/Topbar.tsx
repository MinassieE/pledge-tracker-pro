import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProject } from '@/context/ProjectContext';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectSelector } from '@/components/ProjectSelector';

interface TopbarProps {
  onMenuClick: () => void;
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick, title }) => {
  const { selectedProjectId, setSelectedProjectId } = useProject();
  const location = useLocation();
  
  // Hide project selector on these pages
  const hideProjectSelector = ['/admins', '/follow-ups', '/projects'].some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <header className="sticky top-0 z-40 h-16 bg-card/80 backdrop-blur-sm border-b border-border">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          {title && (
            <h1 className="text-lg font-semibold text-foreground hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!hideProjectSelector && (
            <ProjectSelector
              selectedProjectId={selectedProjectId}
              onProjectChange={setSelectedProjectId}
            />
          )}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search pledges..."
              className="w-64 pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
};
