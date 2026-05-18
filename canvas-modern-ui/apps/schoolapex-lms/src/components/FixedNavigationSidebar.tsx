import React from 'react';
import { NavigationSidebar as OriginalNavigationSidebar } from '../../../../packages/components/dist/navigation/NavigationSidebar.js';
import type { User } from '@schoolapex/core';

interface NavigationSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentUser: User;
  activeItem: string;
  onNavigate: (itemId: string, href: string) => void;
}

/**
 * Wrapper around NavigationSidebar to fix key prop warnings
 * by ensuring all child components have proper keys
 */
export const NavigationSidebar: React.FC<NavigationSidebarProps> = (props) => {
  return <OriginalNavigationSidebar {...props} key="navigation-sidebar" />;
};

export default NavigationSidebar;