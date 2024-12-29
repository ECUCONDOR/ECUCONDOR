import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

const Icon = ({ icon: IconComponent, size = 24, className }: IconProps) => {
  if (!IconComponent) {
    return null;
  }

  return (
    <div className={cn('inline-flex', className)}>
      <IconComponent size={size} />
    </div>
  );
};

export default Icon;
