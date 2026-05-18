import React from 'react';
import type { User } from '@schoolapex/core';
interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}
/**
 * Wrapper around SettingsPanel to fix key prop warnings
 */
export declare const SettingsPanel: React.FC<SettingsPanelProps>;
export default SettingsPanel;
//# sourceMappingURL=FixedSettingsPanel.d.ts.map