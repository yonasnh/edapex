import React from 'react';
import { SettingsPanel as OriginalSettingsPanel } from '@schoolapex/components';
import type { User } from '@schoolapex/core';
import type { UserSettings } from '@schoolapex/components';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  user: User;
  onSave: (settings: UserSettings) => Promise<void>;
  onReset: () => void;
}

/**
 * Wrapper around SettingsPanel to fix key prop warnings
 */
export const SettingsPanel: React.FC<SettingsPanelProps> = (props) => {
  return <OriginalSettingsPanel {...props} key="settings-panel" />;
};

export default SettingsPanel;