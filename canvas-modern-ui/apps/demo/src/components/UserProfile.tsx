import React, { memo, useState } from 'react'
import { 
  Button, 
  TextInput, 
  TextArea, 
  Select, 
  SelectItem, 
  FileUploader,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Toggle,
  Modal
} from '@carbon/react'
import { User } from '@schoolapex/core'
import { 
  Edit,
  Save,
  Close,
  Upload,
  User as UserIcon,
  Settings,
  Notification,
  Security,
  Time
} from '@carbon/icons-react'
import clsx from 'clsx'

/**
 * User Profile component props
 */
interface UserProfileProps {
  user: User
  isEditing?: boolean
  canEdit?: boolean
  onSave?: (updatedUser: Partial<User>) => Promise<void>
  onCancel?: () => void
  onAvatarUpload?: (file: File) => Promise<string>
  className?: string
  'data-testid'?: string
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
export const UserProfile = memo<UserProfileProps>(
  ({
    user,
    isEditing = false,
    canEdit = true,
    onSave,
    onCancel,
    onAvatarUpload,
    className,
    'data-testid': testId,
  }) => {
    const [editMode, setEditMode] = useState(isEditing)
    const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      timezone: user.timezone || 'America/New_York',
      locale: user.locale || 'en',
      bio: user.bio || '',
      pronouns: user.pronouns || '',
      title: user.title || '',
    })
    const [isUploading, setIsUploading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const timezones = [
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
      { value: 'Europe/Paris', label: 'Central European Time (CET)' },
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
    ]

    const languages = [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'fr', label: 'Français' },
      { value: 'de', label: 'Deutsch' },
      { value: 'it', label: 'Italiano' },
      { value: 'pt', label: 'Português' },
      { value: 'zh', label: '中文' },
      { value: 'ja', label: '日本語' },
    ]

    const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSave = async () => {
      if (!onSave) return

      setIsSaving(true)
      try {
        await onSave(formData)
        setEditMode(false)
      } catch (error) {
        console.error('Failed to save profile:', error)
      } finally {
        setIsSaving(false)
      }
    }

    const handleCancel = () => {
      setFormData({
        name: user.name,
        email: user.email,
        timezone: user.timezone || 'America/New_York',
        locale: user.locale || 'en',
        bio: user.bio || '',
        pronouns: user.pronouns || '',
        title: user.title || '',
      })
      setEditMode(false)
      onCancel?.()
    }

    const handleAvatarUpload = async (files: FileList | null) => {
      if (!files || files.length === 0 || !onAvatarUpload) return

      const file = files[0]
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      setIsUploading(true)
      try {
        await onAvatarUpload(file)
      } catch (error) {
        console.error('Failed to upload avatar:', error)
      } finally {
        setIsUploading(false)
      }
    }

    const formatLastLogin = (date: Date) => {
      if (!date || isNaN(date.getTime())) {
        return 'Never';
      }

      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 1) {
        return 'Just now'
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`
      } else if (diffInHours < 168) { // 7 days
        return `${Math.floor(diffInHours / 24)} days ago`
      } else {
        return date.toLocaleDateString()
      }
    }

    return (
      <div
        className={clsx('user-profile', className)}
        data-testid={testId}
      >
        <div className="user-profile__header">
          <div className="user-profile__avatar-section">
            <div className="user-profile__avatar-container">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.name} avatar`}
                  className="user-profile__avatar"
                />
              ) : (
                <div className="user-profile__avatar-placeholder">
                  <UserIcon size={48} />
                </div>
              )}
              
              {editMode && onAvatarUpload && (
                <div className="user-profile__avatar-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleAvatarUpload(e.target.files)}
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    disabled={isUploading}
                  />
                  <Button
                    kind="ghost"
                    size="sm"
                    renderIcon={Upload}
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={isUploading}
                    className="user-profile__avatar-upload-button"
                  >
                    {isUploading ? 'Uploading...' : 'Change'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="user-profile__info">
            <div className="user-profile__name-section">
              {editMode ? (
                <TextInput
                  id="user-name"
                  labelText="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  size="lg"
                />
              ) : (
                <h1 className="user-profile__name">{user.name}</h1>
              )}
              
              {user.pronouns && !editMode && (
                <span className="user-profile__pronouns">({user.pronouns})</span>
              )}
            </div>

            {user.title && !editMode && (
              <p className="user-profile__title">{user.title}</p>
            )}

            <div className="user-profile__meta">
              <span className="user-profile__role">
                {user.roles[0]?.charAt(0).toUpperCase() + user.roles[0]?.slice(1)}
              </span>
              <span className="user-profile__last-login">
                <Time size={16} />
                Last active {formatLastLogin(new Date(user.updated_at))}
              </span>
            </div>
          </div>

          <div className="user-profile__actions">
            {canEdit && !editMode && (
              <Button
                kind="primary"
                size="md"
                renderIcon={Edit}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}

            {editMode && (
              <div className="user-profile__edit-actions">
                <Button
                  kind="primary"
                  size="md"
                  renderIcon={Save}
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  kind="secondary"
                  size="md"
                  renderIcon={Close}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="user-profile__content">
          <Tabs>
            <TabList aria-label="Profile sections">
              <Tab>General</Tab>
              <Tab>Contact</Tab>
              <Tab>Preferences</Tab>
              <Tab>About</Tab>
            </TabList>
            
            <TabPanels>
              {/* General Tab */}
              <TabPanel>
                <div className="user-profile__section">
                  <h3>General Information</h3>
                  
                  <div className="user-profile__form-grid">
                    <TextInput
                      id="user-email"
                      labelText="Email Address"
                      value={editMode ? formData.email : user.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!editMode}
                      type="email"
                    />

                    {editMode && (
                      <>
                        <TextInput
                          id="user-pronouns"
                          labelText="Pronouns"
                          value={formData.pronouns}
                          onChange={(e) => handleInputChange('pronouns', e.target.value)}
                          placeholder="e.g., they/them, she/her, he/him"
                        />

                        <TextInput
                          id="user-title"
                          labelText="Title/Position"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="e.g., Professor, Student, Teaching Assistant"
                        />
                      </>
                    )}
                  </div>
                </div>
              </TabPanel>

              {/* Contact Tab */}
              <TabPanel>
                <div className="user-profile__section">
                  <h3>Contact Information</h3>
                  
                  <div className="user-profile__form-grid">
                    <TextInput
                      id="user-email-contact"
                      labelText="Primary Email"
                      value={editMode ? formData.email : user.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!editMode}
                      type="email"
                    />
                  </div>
                </div>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel>
                <div className="user-profile__section">
                  <h3>Preferences</h3>
                  
                  <div className="user-profile__form-grid">
                    <Select
                      id="user-timezone"
                      labelText="Timezone"
                      value={editMode ? formData.timezone : user.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      disabled={!editMode}
                    >
                      {timezones.map(tz => (
                        <SelectItem key={tz.value} value={tz.value} text={tz.label} />
                      ))}
                    </Select>

                    <Select
                      id="user-language"
                      labelText="Language"
                      value={editMode ? formData.locale : user.locale}
                      onChange={(e) => handleInputChange('locale', e.target.value)}
                      disabled={!editMode}
                    >
                      {languages.map(lang => (
                        <SelectItem key={lang.value} value={lang.value} text={lang.label} />
                      ))}
                    </Select>
                  </div>
                </div>
              </TabPanel>

              {/* About Tab */}
              <TabPanel>
                <div className="user-profile__section">
                  <h3>About</h3>
                  
                  {editMode ? (
                    <TextArea
                      id="user-bio"
                      labelText="Bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={6}
                    />
                  ) : (
                    <div className="user-profile__bio">
                      {user.bio || 'No bio provided.'}
                    </div>
                  )}
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>

        {/* Screen reader only content */}
        <div className="sr-only">
          User profile for {user.name}.
          {editMode ? 'Currently in edit mode.' : 'View mode.'}
          Role: {user.roles[0]}.
          Last active {formatLastLogin(new Date(user.updated_at))}.
        </div>
      </div>
    )
  }
)

UserProfile.displayName = 'UserProfile'
