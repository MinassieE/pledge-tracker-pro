import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-3',
  lg: 'h-12 w-12 border-4',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );
};
