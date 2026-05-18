import { createElement as _createElement } from "react";
import { SettingsPanel as OriginalSettingsPanel } from '../../../../packages/components/dist/ui/SettingsPanel/SettingsPanel.js';
/**
 * Wrapper around SettingsPanel to fix key prop warnings
 */
export const SettingsPanel = (props) => {
    return _createElement(OriginalSettingsPanel, { ...props, key: "settings-panel" });
};
export default SettingsPanel;
//# sourceMappingURL=FixedSettingsPanel.js.map