import { createElement as _createElement } from "react";
import { NavigationSidebar as OriginalNavigationSidebar } from '../../../../packages/components/dist/navigation/NavigationSidebar.js';
/**
 * Wrapper around NavigationSidebar to fix key prop warnings
 * by ensuring all child components have proper keys
 */
export const NavigationSidebar = (props) => {
    return _createElement(OriginalNavigationSidebar, { ...props, key: "navigation-sidebar" });
};
export default NavigationSidebar;
//# sourceMappingURL=FixedNavigationSidebar.js.map