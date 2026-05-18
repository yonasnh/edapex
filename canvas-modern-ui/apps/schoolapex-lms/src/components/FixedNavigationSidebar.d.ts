import React from 'react';
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
export declare const NavigationSidebar: React.FC<NavigationSidebarProps>;
export default NavigationSidebar;
//# sourceMappingURL=FixedNavigationSidebar.d.ts.map