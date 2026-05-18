import React from 'react';
import { SettingsPanel as OriginalSettingsPanel } from '../../../../packages/components/dist/ui/SettingsPanel/SettingsPanel.js';
import type { User } from '@schoolapex/core';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

/**
 * Wrapper around SettingsPanel to fix key prop warnings
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = (props) => {
  return <OriginalSettingsPanel {...props} key="settings-panel" />;
};

export default SettingsPanel;