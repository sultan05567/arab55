import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // @ts-ignore - Accessing icon by string name
  const IconComponent = Icons[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
};
