import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { memo, useState } from 'react';
import { Button, TextInput, TextArea, Select, SelectItem, Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { Edit, Save, Close, Upload, User as UserIcon, Time } from '@carbon/icons-react';
import clsx from 'clsx';
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
export const UserProfile = memo(({ user, isEditing = false, canEdit = true, onSave, onCancel, onAvatarUpload, className, 'data-testid': testId, }) => {
    const [editMode, setEditMode] = useState(isEditing);
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        timezone: user.timezone || 'America/New_York',
        locale: user.locale || 'en',
        bio: user.bio || '',
        pronouns: user.pronouns || '',
        title: user.title || '',
    });
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const timezones = [
        { value: 'America/New_York', label: 'Eastern Time (ET)' },
        { value: 'America/Chicago', label: 'Central Time (CT)' },
        { value: 'America/Denver', label: 'Mountain Time (MT)' },
        { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
        { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
        { value: 'Europe/Paris', label: 'Central European Time (CET)' },
        { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
        { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
    ];
    const languages = [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'it', label: 'Italiano' },
        { value: 'pt', label: 'Português' },
        { value: 'zh', label: '中文' },
        { value: 'ja', label: '日本語' },
    ];
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    const handleSave = async () => {
        if (!onSave)
            return;
        setIsSaving(true);
        try {
            await onSave(formData);
            setEditMode(false);
        }
        catch (error) {
            console.error('Failed to save profile:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleCancel = () => {
        setFormData({
            name: user.name,
            email: user.email,
            timezone: user.timezone || 'America/New_York',
            locale: user.locale || 'en',
            bio: user.bio || '',
            pronouns: user.pronouns || '',
            title: user.title || '',
        });
        setEditMode(false);
        onCancel?.();
    };
    const handleAvatarUpload = async (files) => {
        if (!files || files.length === 0 || !onAvatarUpload)
            return;
        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        setIsUploading(true);
        try {
            await onAvatarUpload(file);
        }
        catch (error) {
            console.error('Failed to upload avatar:', error);
        }
        finally {
            setIsUploading(false);
        }
    };
    const formatLastLogin = (date) => {
        if (!date || isNaN(date.getTime())) {
            return 'Never';
        }
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
        if (diffInHours < 1) {
            return 'Just now';
        }
        else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} hours ago`;
        }
        else if (diffInHours < 168) { // 7 days
            return `${Math.floor(diffInHours / 24)} days ago`;
        }
        else {
            return date.toLocaleDateString();
        }
    };
    return (_jsxs("div", { className: clsx('user-profile', className), "data-testid": testId, children: [_jsxs("div", { className: "user-profile__header", children: [_jsx("div", { className: "user-profile__avatar-section", children: _jsxs("div", { className: "user-profile__avatar-container", children: [user.avatar_url ? (_jsx("img", { src: user.avatar_url, alt: `${user.name} avatar`, className: "user-profile__avatar" })) : (_jsx("div", { className: "user-profile__avatar-placeholder", children: _jsx(UserIcon, { size: 48 }) })), editMode && onAvatarUpload && (_jsxs("div", { className: "user-profile__avatar-upload", children: [_jsx("input", { type: "file", accept: "image/*", onChange: (e) => handleAvatarUpload(e.target.files), style: { display: 'none' }, id: "avatar-upload", disabled: isUploading }), _jsx(Button, { kind: "ghost", size: "sm", renderIcon: Upload, onClick: () => document.getElementById('avatar-upload')?.click(), disabled: isUploading, className: "user-profile__avatar-upload-button", children: isUploading ? 'Uploading...' : 'Change' })] }))] }) }), _jsxs("div", { className: "user-profile__info", children: [_jsxs("div", { className: "user-profile__name-section", children: [editMode ? (_jsx(TextInput, { id: "user-name", labelText: "Full Name", value: formData.name, onChange: (e) => handleInputChange('name', e.target.value), size: "lg" })) : (_jsx("h1", { className: "user-profile__name", children: user.name })), user.pronouns && !editMode && (_jsxs("span", { className: "user-profile__pronouns", children: ["(", user.pronouns, ")"] }))] }), user.title && !editMode && (_jsx("p", { className: "user-profile__title", children: user.title })), _jsxs("div", { className: "user-profile__meta", children: [_jsx("span", { className: "user-profile__role", children: user.roles[0]?.charAt(0).toUpperCase() + user.roles[0]?.slice(1) }), _jsxs("span", { className: "user-profile__last-login", children: [_jsx(Time, { size: 16 }), "Last active ", formatLastLogin(new Date(user.updated_at))] })] })] }), _jsxs("div", { className: "user-profile__actions", children: [canEdit && !editMode && (_jsx(Button, { kind: "primary", size: "md", renderIcon: Edit, onClick: () => setEditMode(true), children: "Edit Profile" })), editMode && (_jsxs("div", { className: "user-profile__edit-actions", children: [_jsx(Button, { kind: "primary", size: "md", renderIcon: Save, onClick: handleSave, disabled: isSaving, children: isSaving ? 'Saving...' : 'Save' }), _jsx(Button, { kind: "secondary", size: "md", renderIcon: Close, onClick: handleCancel, disabled: isSaving, children: "Cancel" })] }))] })] }), _jsx("div", { className: "user-profile__content", children: _jsxs(Tabs, { children: [_jsxs(TabList, { "aria-label": "Profile sections", children: [_jsx(Tab, { children: "General" }), _jsx(Tab, { children: "Contact" }), _jsx(Tab, { children: "Preferences" }), _jsx(Tab, { children: "About" })] }), _jsxs(TabPanels, { children: [_jsx(TabPanel, { children: _jsxs("div", { className: "user-profile__section", children: [_jsx("h3", { children: "General Information" }), _jsxs("div", { className: "user-profile__form-grid", children: [_jsx(TextInput, { id: "user-email", labelText: "Email Address", value: editMode ? formData.email : user.email, onChange: (e) => handleInputChange('email', e.target.value), disabled: !editMode, type: "email" }), editMode && (_jsxs(_Fragment, { children: [_jsx(TextInput, { id: "user-pronouns", labelText: "Pronouns", value: formData.pronouns, onChange: (e) => handleInputChange('pronouns', e.target.value), placeholder: "e.g., they/them, she/her, he/him" }), _jsx(TextInput, { id: "user-title", labelText: "Title/Position", value: formData.title, onChange: (e) => handleInputChange('title', e.target.value), placeholder: "e.g., Professor, Student, Teaching Assistant" })] }))] })] }) }), _jsx(TabPanel, { children: _jsxs("div", { className: "user-profile__section", children: [_jsx("h3", { children: "Contact Information" }), _jsx("div", { className: "user-profile__form-grid", children: _jsx(TextInput, { id: "user-email-contact", labelText: "Primary Email", value: editMode ? formData.email : user.email, onChange: (e) => handleInputChange('email', e.target.value), disabled: !editMode, type: "email" }) })] }) }), _jsx(TabPanel, { children: _jsxs("div", { className: "user-profile__section", children: [_jsx("h3", { children: "Preferences" }), _jsxs("div", { className: "user-profile__form-grid", children: [_jsx(Select, { id: "user-timezone", labelText: "Timezone", value: editMode ? formData.timezone : user.timezone, onChange: (e) => handleInputChange('timezone', e.target.value), disabled: !editMode, children: timezones.map(tz => (_jsx(SelectItem, { value: tz.value, text: tz.label }, tz.value))) }), _jsx(Select, { id: "user-language", labelText: "Language", value: editMode ? formData.locale : user.locale, onChange: (e) => handleInputChange('locale', e.target.value), disabled: !editMode, children: languages.map(lang => (_jsx(SelectItem, { value: lang.value, text: lang.label }, lang.value))) })] })] }) }), _jsx(TabPanel, { children: _jsxs("div", { className: "user-profile__section", children: [_jsx("h3", { children: "About" }), editMode ? (_jsx(TextArea, { id: "user-bio", labelText: "Bio", value: formData.bio, onChange: (e) => handleInputChange('bio', e.target.value), placeholder: "Tell us about yourself...", rows: 6 })) : (_jsx("div", { className: "user-profile__bio", children: user.bio || 'No bio provided.' }))] }) })] })] }) }), _jsxs("div", { className: "sr-only", children: ["User profile for ", user.name, ".", editMode ? 'Currently in edit mode.' : 'View mode.', "Role: ", user.roles[0], ". Last active ", formatLastLogin(new Date(user.updated_at)), "."] })] }));
});
UserProfile.displayName = 'UserProfile';
//# sourceMappingURL=UserProfile.js.map