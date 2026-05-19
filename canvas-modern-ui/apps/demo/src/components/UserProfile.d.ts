import React from 'react';
import { User } from '@schoolapex/core';
/**
 * User Profile component props
 */
interface UserProfileProps {
    user: User;
    isEditing?: boolean;
    canEdit?: boolean;
    onSave?: (updatedUser: Partial<User>) => Promise<void>;
    onCancel?: () => void;
    onAvatarUpload?: (file: File) => Promise<string>;
    className?: string;
    'data-testid'?: string;
}
/**
 * SchoolApex User Profile component
 *
 * Comprehensive user profile management with editing capabilities, avatar upload,
 * and tabbed interface for different profile sections.
 *
 * @example
 * ```tsx
 * <UserProfile
 *   user={currentUser}
 *   canEdit={true}
 *   onSave={handleSave}
 *   onAvatarUpload={handleAvatarUpload}
 * />
 * ```
 */
export declare const UserProfile: React.NamedExoticComponent<UserProfileProps>;
export {};
//# sourceMappingURL=UserProfile.d.ts.map