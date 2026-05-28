import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function UserSvg() { return <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 17v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1"/><circle cx="10" cy="6" r="3"/></svg>; }
function UserGroupSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg>; }
function EyeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg>; }
function MailSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2.5" width="12" height="9" rx="1"/><path d="M1 3.5l6 4.5 6-4.5"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function AlertSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>; }
function XCircleSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M6 6l4 4M10 6l-4 4"/></svg>; }
function KeySvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4.5" cy="9.5" r="2.5"/><path d="M6.5 7.5L12 2l1 1-5.5 5.5"/><path d="M10 4l1.5 1.5"/></svg>; }
function PeopleSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function UserCheckSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M17 11l2 2 4-4"/></svg>; }
function ClockSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>; }
function ChevronDownSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg>; }
function UploadSvg() { return <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 15V4M5 9l5-5 5 5M4 17h12"/></svg>; }
function FileSvg() { return <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M13 2v7h7"/></svg>; }

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'ta' | 'observer' | 'admin' | 'designer';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  profile?: {
    bio?: string;
    timezone?: string;
    locale?: string;
    pronouns?: string;
    phone?: string;
  };
  enrollmentCount?: number;
  courseCount?: number;
  loginCount?: number;
  sisUserId?: string;
  integrationId?: string;
}

// We will fetch these from Canvas API instead
// const initialUsers = ...

const roleBadgeClass = (role: string) => {
  switch (role) {
    case 'admin': return 'cx-badge--danger';
    case 'teacher': return 'cx-badge--info';
    case 'ta': return 'cx-badge--accent';
    case 'designer': return 'cx-badge--neutral';
    case 'observer': return 'cx-badge--neutral';
    default: return 'cx-badge--success';
  }
};

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useRole } from '../../contexts/RoleContext';
import { useNotification } from '../../hooks/useNotification';
import BulkOperationsBar from '../../components/BulkOperationsBar';

const AdminUsersPage: React.FC = () => {
  const { showConfirm, showToast } = useNotification();
  const { masqueradeAs } = useRole();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSisLinked, setFilterSisLinked] = useState<'all' | 'sis' | 'manual'>('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [pageSize, _setPageSize] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);

  // Bulk import states
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [bulkImportLoading, setBulkImportLoading] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{ success: boolean; message: string; importId?: number } | null>(null);

  // Communication channels states
  const [commChannels, setCommChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [showAddChannelForm, setShowAddChannelForm] = useState(false);
  const [newChannelAddress, setNewChannelAddress] = useState('');
  const [newChannelType, setNewChannelType] = useState('email');
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  // Observer/Student linking states
  const [linkedUsers, setLinkedUsers] = useState<any[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [showAddObserverForm, setShowAddObserverForm] = useState(false);
  const [selectedLinkUserId, setSelectedLinkUserId] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Send message states
  const [sendMessageUser, setSendMessageUser] = useState<UserData | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Accommodations states
  interface UserAccommodations {
    timeMultiplier: string;
    allowLate: boolean;
  }
  const [accommodations, setAccommodations] = useState<UserAccommodations>({ timeMultiplier: '1', allowLate: false });
  const [savingAccommodations, setSavingAccommodations] = useState(false);

  // Refs for cleanup and debounce
  const mountedRef = useRef(true);
  const accommodationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (accommodationDebounceRef.current) {
        clearTimeout(accommodationDebounceRef.current);
      }
    };
  }, []);

  const [users, setUsers] = useState<UserData[]>([]);
  // Persistent map of userId → role for users we explicitly created/assigned.
  // Survives refetch cycles because Canvas /accounts/:id/users often returns
  // empty enrollments for newly-created users, causing them to default to 'student'.
  const knownRolesRef = useRef<Record<string, UserData['role']>>({});

  const { data: canvasUsers, refetch } = useCanvasQuery<any[]>('/api/v1/accounts/1/users', { include: ['email', 'last_login', 'enrollments'], per_page: 50 } as any);
  const { data: canvasAdmins } = useCanvasQuery<any[]>('/api/v1/accounts/1/admins', {} as any);

  React.useEffect(() => {
    if (Array.isArray(canvasUsers)) {
      const adminUserIds = new Set<string>();
      if (Array.isArray(canvasAdmins)) {
        canvasAdmins.forEach(admin => {
          if (admin.user && admin.user.id) {
            adminUserIds.add(String(admin.user.id));
          }
        });
      }

      setUsers(canvasUsers.map(u => {
        const id = String(u.id);
        const email = u.email || u.login_id || 'no-email@example.com';
        const loginId = u.login_id || '';
        const name = u.name || u.short_name || 'Unknown User';

        // Role determination from actual Canvas enrollments + admin list + knownRoles fallback
        let role: UserData['role'] = 'student';
        if (adminUserIds.has(id)) {
          role = 'admin';
        } else if (Array.isArray(u.enrollments) && u.enrollments.length > 0) {
          const types = u.enrollments.map((e: any) => e.type || e.role);
          if (types.includes('TeacherEnrollment')) role = 'teacher';
          else if (types.includes('TaEnrollment')) role = 'ta';
          else if (types.includes('DesignerEnrollment')) role = 'designer';
          else if (types.includes('ObserverEnrollment')) role = 'observer';
          else if (types.includes('StudentEnrollment')) role = 'student';
        } else if (knownRolesRef.current[id]) {
          // Canvas did not return enrollments but we know the role from creation
          role = knownRolesRef.current[id];
        }

        // Determine last login — use Canvas API value only; do not synthesize fake data.
        const lastLogin = u.last_login || null;

        return {
          id,
          name,
          email,
          role,
          isActive: true,
          lastLogin,
          createdAt: u.created_at || new Date().toISOString(),
          sisUserId: u.sis_user_id || undefined,
          integrationId: u.integration_id || undefined,
          profile: {
            phone: u.phone || undefined,
            timezone: u.time_zone || 'America/New_York'
          }
        };
      }));
    }
  }, [canvasUsers, canvasAdmins]);

  // Fetch communication channels
  const fetchCommChannels = useCallback(async (userId: string) => {
    setLoadingChannels(true);
    try {
      const data = await canvasFetch(`/api/v1/users/${userId}/communication_channels`);
      if (mountedRef.current) setCommChannels(data);
    } catch (err) {
      console.error('Error fetching communication channels:', err);
    } finally {
      if (mountedRef.current) setLoadingChannels(false);
    }
  }, []);

  // Fetch observer links
  const fetchObserverLinks = useCallback(async (user: UserData) => {
    setLoadingLinks(true);
    try {
      const endpoint = user.role === 'student' 
        ? `/api/v1/users/${user.id}/observers` 
        : `/api/v1/users/${user.id}/observees`;

      const data = await canvasFetch(endpoint);
      if (mountedRef.current) setLinkedUsers(data);
    } catch (err) {
      console.error('Error fetching observer links:', err);
    } finally {
      if (mountedRef.current) setLoadingLinks(false);
    }
  }, []);

  const fetchAccommodations = useCallback(async (userId: string) => {
    try {
      const response = await canvasFetch(`/api/v1/users/${userId}/custom_data/classapex_accommodations`);
      if (mountedRef.current) {
        if (response && response.data) {
          setAccommodations(response.data as UserAccommodations);
        } else {
          setAccommodations({ timeMultiplier: '1', allowLate: false });
        }
      }
    } catch {
      if (mountedRef.current) {
        setAccommodations({ timeMultiplier: '1', allowLate: false });
      }
    }
  }, []);

  const handleSaveAccommodations = useCallback((userId: string, updates: Partial<UserAccommodations>) => {
    const next = { ...accommodations, ...updates };
    setAccommodations(next);

    // Debounce API call to avoid firing on every keystroke/checkbox toggle
    if (accommodationDebounceRef.current) {
      clearTimeout(accommodationDebounceRef.current);
    }
    accommodationDebounceRef.current = setTimeout(async () => {
      if (!mountedRef.current) return;
      setSavingAccommodations(true);
      try {
        await canvasFetch(`/api/v1/users/${userId}/custom_data/classapex_accommodations`, {
          method: 'PUT',
          body: { data: next }
        });
        if (mountedRef.current) {
          showToast({ title: 'Saved', message: 'Accommodations updated successfully.', type: 'success' });
        }
      } catch (err: any) {
        if (mountedRef.current) {
          showToast({ title: 'Error', message: err.message || 'Failed to save accommodations.', type: 'error' });
        }
      } finally {
        if (mountedRef.current) setSavingAccommodations(false);
      }
    }, 600);
  }, [accommodations, showToast]);

  useEffect(() => {
    if (selectedUser) {
      fetchCommChannels(selectedUser.id);
      fetchObserverLinks(selectedUser);
      fetchAccommodations(selectedUser.id);
      setShowAddChannelForm(false);
      setShowAddObserverForm(false);
      setNewChannelAddress('');
      setSelectedLinkUserId('');
    }
  }, [selectedUser, fetchCommChannels, fetchObserverLinks, fetchAccommodations]);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newChannelAddress) return;
    setIsAddingChannel(true);
    try {
      const payload = {
        communication_channel: {
          address: newChannelAddress,
          type: newChannelType
        },
        skip_confirmation: true
      };
      await canvasFetch(`/api/v1/users/${selectedUser.id}/communication_channels`, {
        method: 'POST',
        body: payload
      });
      showToast({
        title: 'Channel Added',
        message: `Successfully added communication channel "${newChannelAddress}"`,
        type: 'success'
      });
      setNewChannelAddress('');
      setShowAddChannelForm(false);
      await fetchCommChannels(selectedUser.id);
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to add channel',
        message: err.message || 'An error occurred while adding the communication channel.',
        type: 'error'
      });
    } finally {
      setIsAddingChannel(false);
    }
  };

  const handleDeleteChannel = async (channelId: number) => {
    if (!selectedUser) return;
    const confirmed = await showConfirm({
      title: 'Delete Channel',
      message: 'Are you sure you want to delete this communication channel?',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/users/${selectedUser.id}/communication_channels/${channelId}`, {
        method: 'DELETE'
      });
      showToast({
        title: 'Channel Deleted',
        message: 'Successfully deleted communication channel.',
        type: 'success'
      });
      await fetchCommChannels(selectedUser.id);
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to delete channel',
        message: err.message || 'An error occurred while deleting the communication channel.',
        type: 'error'
      });
    }
  };

  const handleAddObserverLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedLinkUserId) return;
    setIsAddingLink(true);
    try {
      const observerId = selectedUser.role === 'student' ? selectedLinkUserId : selectedUser.id;
      const studentId = selectedUser.role === 'student' ? selectedUser.id : selectedLinkUserId;

      await canvasFetch(`/api/v1/users/${observerId}/observees/${studentId}`, {
        method: 'PUT'
      });
      showToast({
        title: 'Link Added',
        message: 'Successfully created observer link.',
        type: 'success'
      });
      setSelectedLinkUserId('');
      setShowAddObserverForm(false);
      await fetchObserverLinks(selectedUser);
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to create link',
        message: err.message || 'An error occurred while creating the observer link.',
        type: 'error'
      });
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDeleteObserverLink = async (linkedUserId: string) => {
    if (!selectedUser) return;
    const confirmed = await showConfirm({
      title: 'Remove Observer Link',
      message: 'Are you sure you want to remove this observer link?',
      confirmLabel: 'Remove Link',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      const observerId = selectedUser.role === 'student' ? linkedUserId : selectedUser.id;
      const studentId = selectedUser.role === 'student' ? selectedUser.id : linkedUserId;

      await canvasFetch(`/api/v1/users/${observerId}/observees/${studentId}`, {
        method: 'DELETE'
      });
      showToast({
        title: 'Link Removed',
        message: 'Successfully removed observer link.',
        type: 'success'
      });
      await fetchObserverLinks(selectedUser);
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to remove link',
        message: err.message || 'An error occurred while removing the link.',
        type: 'error'
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendMessageUser || !messageBody) return;
    setIsSendingMessage(true);
    try {
      const payload = {
        recipients: [sendMessageUser.id],
        subject: messageSubject || `Message from Admin`,
        body: messageBody,
        force_new: true
      };
      await canvasFetch('/api/v1/conversations', {
        method: 'POST',
        body: payload
      });
      showToast({
        title: 'Message Sent',
        message: 'Message sent successfully!',
        type: 'success'
      });
      setMessageSubject('');
      setMessageBody('');
      setSendMessageUser(null);
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to send message',
        message: err.message || 'An error occurred while sending the message.',
        type: 'error'
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'student', isActive: true,
    sendWelcomeEmail: true, temporaryPassword: '',
    timezone: 'America/New_York', locale: 'en', courseId: ''
  });

  // Fetch courses for role assignment during user creation
  const { data: adminCourses } = useCanvasQuery<any[]>(
    '/api/v1/courses',
    { per_page: 100, enrollment_state: 'active' } as any
  );

  const [editUser, setEditUser] = useState<Partial<UserData>>({});

  const filteredUsers = useMemo(() => {
    let filtered = users;
    if (searchTerm) filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterRole !== 'all') filtered = filtered.filter(user => user.role === filterRole);
    if (filterStatus !== 'all') filtered = filtered.filter(user => {
      switch (filterStatus) {
        case 'active': return user.isActive;
        case 'inactive': return !user.isActive;
        case 'recent': const week = new Date(); week.setDate(week.getDate() - 7); return user.lastLogin && new Date(user.lastLogin) > week;
        default: return true;
      }
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'email': return a.email.localeCompare(b.email);
        case 'role': return a.role.localeCompare(b.role);
        case 'lastLogin': return (b.lastLogin ? new Date(b.lastLogin).getTime() : 0) - (a.lastLogin ? new Date(a.lastLogin).getTime() : 0);
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default: return 0;
      }
    });
    return filtered;
  }, [users, searchTerm, filterRole, filterStatus, sortBy]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const students = users.filter(u => u.role === 'student').length;
    const week = new Date(); week.setDate(week.getDate() - 7);
    const recent = users.filter(u => u.lastLogin && new Date(u.lastLogin) > week).length;
    const sisLinked = users.filter(u => !!u.sisUserId).length;
    return { total, active, students, recent, sisLinked };
  }, [users]);

  const getStatusIcon = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) return <XCircleSvg />;
    if (lastLogin) { const w = new Date(); w.setDate(w.getDate() - 7); if (new Date(lastLogin) > w) return <CheckSvg />; }
    return <AlertSvg />;
  };

  const getStatusBadge = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) return 'cx-badge--danger';
    if (lastLogin) { const w = new Date(); w.setDate(w.getDate() - 7); if (new Date(lastLogin) > w) return 'cx-badge--success'; }
    return 'cx-badge--warning';
  };

  const handleBulkImport = async () => {
    if (!bulkImportFile) {
      showToast({ title: 'No file selected', message: 'Please select a CSV file to import.', type: 'warning' });
      return;
    }
    setBulkImportLoading(true);
    setBulkImportResult(null);
    try {
      const formData = new FormData();
      formData.append('attachment', bulkImportFile);
      formData.append('import_type', 'instructure_csv');

      const result = await canvasFetch('/api/v1/accounts/1/sis_imports', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header; browser will set it with boundary for FormData
      });

      if (result?.id) {
        setBulkImportResult({
          success: true,
          message: `SIS import #${result.id} queued successfully. Track progress on the SIS Imports page.`,
          importId: result.id,
        });
        showToast({
          title: 'Import Queued',
          message: `SIS import #${result.id} has been started.`,
          type: 'success'
        });
        setBulkImportFile(null);
      } else {
        throw new Error('Import did not return an ID');
      }
    } catch (err: any) {
      setBulkImportResult({
        success: false,
        message: err.message || 'Failed to start SIS import. Ensure the CSV is in Instructure format.',
      });
      showToast({
        title: 'Import Failed',
        message: err.message || 'Failed to start SIS import.',
        type: 'error'
      });
    } finally {
      setBulkImportLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast({ title: 'Name and email are required', type: 'error' });
      return;
    }
    if (newUser.role !== 'admin' && !newUser.courseId) {
      showToast({ title: 'Course is required for this role', type: 'error' });
      return;
    }
    try {
      const payload = {
        user: {
          name: newUser.name
        },
        pseudonym: {
          unique_id: newUser.email,
          password: newUser.temporaryPassword || 'Canvas123!',
          send_confirmation: newUser.sendWelcomeEmail ? '1' : '0'
        },
        communication_channel: {
          type: 'email',
          address: newUser.email
        }
      };

      const created = await canvasFetch('/api/v1/accounts/1/users', {
        method: 'POST',
        body: payload
      }) as any;
      const userId = created?.id;

      // Assign role
      if (newUser.role === 'admin' && userId) {
        await canvasFetch('/api/v1/accounts/1/admins', {
          method: 'POST',
          body: { user_id: userId, role: 'AccountAdmin', send_confirmation: false }
        });
      } else if (newUser.role !== 'admin' && userId && newUser.courseId) {
        const enrollmentTypeMap: Record<string, string> = {
          student: 'StudentEnrollment',
          teacher: 'TeacherEnrollment',
          ta: 'TaEnrollment',
          observer: 'ObserverEnrollment',
          designer: 'DesignerEnrollment',
        };
        await canvasFetch(`/api/v1/courses/${newUser.courseId}/enrollments`, {
          method: 'POST',
          body: {
            enrollment: {
              user_id: userId,
              type: enrollmentTypeMap[newUser.role] || 'StudentEnrollment',
              enrollment_state: 'active',
            }
          }
        });
      }

      // Persist the explicitly-assigned role so it survives refetch cycles
      if (userId) {
        knownRolesRef.current[String(userId)] = newUser.role as UserData['role'];
        setUsers(prev => [{
          id: String(userId),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role as UserData['role'],
          isActive: true,
          lastLogin: undefined,
          createdAt: new Date().toISOString(),
          profile: { timezone: newUser.timezone },
          enrollmentCount: newUser.courseId ? 1 : 0,
        }, ...prev]);
      }

      setNewUser({ name: '', email: '', role: 'student', isActive: true, sendWelcomeEmail: true, temporaryPassword: '', timezone: 'America/New_York', locale: 'en', courseId: '' });
      setShowCreateModal(false);
      showToast({
        title: 'User Created',
        message: `Successfully created user with ${newUser.role} role.`,
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to create user',
        message: err.message || 'An error occurred while creating the user.',
        type: 'error'
      });
    }
  };

  const handleEditUser = async () => {
    if (!editUser.id) return;
    try {
      const payload: Record<string, any> = {};
      if (editUser.name) {
        payload.user = { name: editUser.name };
      }
      if (editUser.email) {
        if (!payload.user) payload.user = {};
        payload.user.email = editUser.email;
      }

      await canvasFetch(`/api/v1/users/${editUser.id}`, {
        method: 'PUT',
        body: payload
      });

      setEditUser({});
      setShowEditModal(false);
      showToast({
        title: 'User Updated',
        message: 'Successfully updated user details.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to update user',
        message: err.message || 'An error occurred while updating the user.',
        type: 'error'
      });
    }
  };
  const handleUserClick = (user: UserData) => { setSelectedUser(user); setShowUserModal(true); };
  const handleEditClick = (user: UserData) => { setEditUser(user); setShowEditModal(true); };
  const handleDeleteUser = async (userId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/accounts/1/users/${userId}`, {
        method: 'DELETE'
      });
      showToast({
        title: 'User Deleted',
        message: 'Successfully deleted the user.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to delete user',
        message: err.message || 'An error occurred while deleting the user.',
        type: 'error'
      });
    }
  };

  const handleMasquerade = (user: UserData) => {
    masqueradeAs({
      id: user.id,
      name: user.name,
      displayName: user.name,
      email: user.email,
      avatarSeed: user.name,
      role: user.role === 'admin' ? 'admin' : (user.role === 'teacher' || user.role === 'ta' || user.role === 'designer' ? 'teacher' : 'student'),
      title: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} (Act As)`,
    });
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const logins = await canvasFetch(`/api/v1/users/${userId}/logins`);
      if (!Array.isArray(logins) || logins.length === 0) {
        throw new Error('No logins found for this user.');
      }
      const loginId = logins[0].id;
      await canvasFetch(`/api/v1/logins/${loginId}`, {
        method: 'PUT',
        body: { login: { password: 'CanvasReset123!' } }
      });
      showToast({
        title: 'Password reset',
        message: 'Temporary password: CanvasReset123!',
        type: 'success'
      });
    } catch (err: any) {
      showToast({
        title: 'Password reset failed',
        message: err?.message || 'This action may require server-level admin access.',
        type: 'error'
      });
    }
  };

  const handleBulkActivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => canvasFetch(`/api/v1/users/${id}`, { method: 'PUT', body: { user: { event: 'unsuspend' } } })))
      showToast({ title: `${ids.length} user(s) activated`, type: 'success' })
      setSelectedUsers([])
      refetch()
    } catch (err: any) {
      showToast({ title: 'Bulk activate failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleBulkDeactivate = async (ids: string[]) => {
    try {
      await Promise.all(ids.map(id => canvasFetch(`/api/v1/users/${id}`, { method: 'PUT', body: { user: { event: 'suspend' } } })))
      showToast({ title: `${ids.length} user(s) deactivated`, type: 'success' })
      setSelectedUsers([])
      refetch()
    } catch (err: any) {
      showToast({ title: 'Bulk deactivate failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const handleBulkDeleteUsers = async (ids: string[]) => {
    const confirmed = await showConfirm({
      title: 'Delete Users?',
      message: `This will permanently delete ${ids.length} user(s).`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger',
    })
    if (!confirmed) return
    try {
      await Promise.all(ids.map(id => canvasFetch(`/api/v1/accounts/1/users/${id}`, { method: 'DELETE' })))
      showToast({ title: `${ids.length} user(s) deleted`, type: 'success' })
      setSelectedUsers([])
      refetch()
    } catch (err: any) {
      showToast({ title: 'Bulk delete failed', message: err.message || 'Unknown error', type: 'error' })
    }
  }

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (selectedUsers.length === paginatedUsers.length) setSelectedUsers([]);
    else setSelectedUsers(paginatedUsers.map(u => u.id));
  };

  const inpStyle: React.CSSProperties = { border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 };
  const _selStyle: React.CSSProperties = { width: '100%', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '7px 8px', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', fontFamily: 'inherit', fontSize: '0.8125rem' };
  const toggleLabelStyle: React.CSSProperties = { fontSize: '0.8125rem', color: 'var(--cx-text-primary)' };

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">User Management</h1>
          <p className="cx-page__subtitle">Create, edit, and manage user accounts, roles, and permissions across the platform.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowBulkImportModal(true)}><UploadSvg /> Bulk Import</button>
          <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}><PlusSvg /> Add User</button>
        </div>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Users', value: stats.total, icon: <UserGroupSvg /> },
          { label: 'Active Users', value: stats.active, icon: <UserCheckSvg />, desc: `${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% active` },
          { label: 'Students', value: stats.students, icon: <PeopleSvg /> },
          { label: 'SIS Linked', value: stats.sisLinked, icon: <UploadSvg />, desc: `${stats.total ? Math.round((stats.sisLinked / stats.total) * 100) : 0}% via SIS` },
        ].map((s, i) => (
          <div key={i} className="cx-stat-card">
            <div className="cx-stat-card__icon">{s.icon}</div>
            <div className="cx-stat-card__body">
              <div className="cx-stat-card__label">{s.label}</div>
              <div className="cx-stat-card__value">{s.value}</div>
              {s.desc && <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{s.desc}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="cx-section">
        <div className="cx-toolbar">
          <div className="cx-search">
            <SearchSvg />
            <input type="search" className="cx-search__input" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="cx-select" value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1); }}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="ta">Teaching Assistants</option>
            <option value="admin">Administrators</option>
            <option value="designer">Designers</option>
            <option value="observer">Observers</option>
          </select>
          <select className="cx-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="recent">Recent Logins</option>
          </select>
          <select className="cx-select" value={filterSisLinked} onChange={e => { setFilterSisLinked(e.target.value as any); setPage(1); }}>
            <option value="all">All Sources</option>
            <option value="sis">SIS Linked</option>
            <option value="manual">Manually Created</option>
          </select>
          <select className="cx-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
            <option value="name">Name A-Z</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
            <option value="lastLogin">Last Login</option>
            <option value="created">Date Created</option>
          </select>
        </div>

        <BulkOperationsBar<UserData>
          items={paginatedUsers}
          selectedIds={selectedUsers}
          onSelectAll={toggleAll}
          onSelectNone={() => setSelectedUsers([])}
          itemName="users"
          actions={[
            { id: 'activate', label: 'Activate', variant: 'primary', onClick: handleBulkActivate },
            { id: 'deactivate', label: 'Deactivate', variant: 'secondary', onClick: handleBulkDeactivate },
            { id: 'delete', label: 'Delete', variant: 'danger', confirmMessage: 'Are you sure you want to delete the selected users?', onClick: handleBulkDeleteUsers },
          ]}
        />

        {paginatedUsers.length === 0 ? (
          <div className="cx-empty">
            <UserSvg />
            <h3>No users found</h3>
            <p>Try adjusting your search or filters.</p>
            <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => { setSearchTerm(''); setFilterRole('all'); setFilterStatus('all'); setFilterSisLinked('all'); setPage(1); }}>Clear Filters</button>
          </div>
        ) : (
          <div className="cx-table-container">
            <table className="cx-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0} onChange={toggleAll} style={{ accentColor: 'var(--cx-accent)' }} /></th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>SIS ID</th>
                  <th>Enrollments</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => (
                  <tr key={user.id} className={clsx('cx-table__row', selectedUsers.includes(user.id) && 'cx-table__row--selected')}>
                    <td className="cx-table__cell" style={{ width: 40 }}><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} style={{ accentColor: 'var(--cx-accent)' }} /></td>
                    <td className="cx-table__cell cx-table__cell--name">{user.name}</td>
                    <td className="cx-table__cell cx-table__cell--muted">{user.email}</td>
                    <td className="cx-table__cell"><span className={clsx('cx-badge', roleBadgeClass(user.role))}>{user.role}</span></td>
                    <td className="cx-table__cell"><span className={clsx('cx-badge', getStatusBadge(user.isActive, user.lastLogin))} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{getStatusIcon(user.isActive, user.lastLogin)}{user.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td className="cx-table__cell cx-table__cell--muted">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td className="cx-table__cell cx-table__cell--muted">{user.sisUserId ? <span className="cx-badge cx-badge--info" style={{ fontSize: '0.7rem' }}>{user.sisUserId}</span> : '—'}</td>
                    <td className="cx-table__cell cx-table__cell--muted">{user.enrollmentCount || 0}</td>
                    <td className="cx-table__cell cx-table__cell--muted">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="cx-table__cell cx-table__cell--actions" style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleUserClick(user)} title="View Profile"><EyeSvg /></button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleEditClick(user)} title="Edit User"><EditSvg /></button>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowActions(showActions === user.id ? null : user.id)} title="More"><ChevronDownSvg /></button>
                      </div>
                      {showActions === user.id && (
                        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 160, padding: 4 }}>
                          <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleUserClick(user); setShowActions(null); }}><EyeSvg /> View Profile</button>
                          <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleEditClick(user); setShowActions(null); }}><EditSvg /> Edit User</button>
                          <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleMasquerade(user); setShowActions(null); }}><UserCheckSvg /> Act As User</button>
                          <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleResetPassword(user.id); setShowActions(null); }}><KeySvg /> Reset Password</button>
                          <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { setSendMessageUser(user); setShowActions(null); }}><MailSvg /> Send Message</button>
                          <div style={{ borderTop: '1px solid var(--cx-border-subtle)', margin: '4px 0' }} />
                          <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-accent-error)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleDeleteUser(user.id); setShowActions(null); }}><TrashSvg /> Delete User</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', borderTop: '1px solid var(--cx-border-subtle)' }}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="cx-pagination" style={{ marginTop: 16 }}>
            <span className="cx-pagination__info">Page {page} of {totalPages}</span>
            <div className="cx-pagination__controls">
              <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3L5 7l4 4"/></svg>
              </button>
              <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 3l4 4-4 4"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Add New User</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" style={inpStyle} placeholder="Enter user's full name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" style={inpStyle} placeholder="Enter email address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select className="cx-select" style={{ width: '100%' }} value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value, courseId: ''})}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="ta">Teaching Assistant</option>
                    <option value="observer">Observer</option>
                    <option value="designer">Designer</option>
                    <option value="admin">Administrator</option>
                  </select>
                  {newUser.role !== 'admin' && (
                    <p style={{ fontSize: '0.72rem', color: 'var(--cx-color-warning, #d97706)', margin: '4px 0 0 0' }}>Required: select a course to assign this role.</p>
                  )}
                </div>
                {newUser.role !== 'admin' && (
                  <div>
                    <label style={labelStyle}>Course <span style={{ color: 'var(--cx-color-danger, #dc2626)' }}>*</span></label>
                    <select className="cx-select" style={{ width: '100%' }} value={newUser.courseId} onChange={e => setNewUser({...newUser, courseId: e.target.value})}>
                      <option value="">Select a course...</option>
                      {(adminCourses || []).map((c: any) => (
                        <option key={c.id} value={String(c.id)}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label style={labelStyle}>Temporary Password (optional)</label>
                  <input type="password" style={inpStyle} placeholder="Leave blank to auto-generate" value={newUser.temporaryPassword} onChange={e => setNewUser({...newUser, temporaryPassword: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Timezone</label>
                  <select className="cx-select" style={{ width: '100%' }} value={newUser.timezone} onChange={e => setNewUser({...newUser, timezone: e.target.value})}>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newUser.isActive} onChange={e => setNewUser({...newUser, isActive: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={toggleLabelStyle}>Active Account</span>
                  </label>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newUser.sendWelcomeEmail} onChange={e => setNewUser({...newUser, sendWelcomeEmail: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={toggleLabelStyle}>Send Welcome Email</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleCreateUser}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="cx-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Edit User</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowEditModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" style={inpStyle} value={editUser.name || ''} onChange={e => setEditUser({...editUser, name: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" style={inpStyle} value={editUser.email || ''} onChange={e => setEditUser({...editUser, email: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select className="cx-select" style={{ width: '100%' }} value={editUser.role || 'student'} onChange={e => setEditUser({...editUser, role: e.target.value as any})}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="ta">Teaching Assistant</option>
                    <option value="observer">Observer</option>
                    <option value="designer">Designer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <label className="cx-toggle">
                  <input type="checkbox" checked={editUser.isActive || false} onChange={e => setEditUser({...editUser, isActive: e.target.checked})} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Active Account</span>
                </label>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleEditUser}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && selectedUser && (
        <div className="cx-modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedUser.name}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowUserModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--cx-border-subtle)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--cx-bg-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><UserSvg /></div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: 0 }}>{selectedUser.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '2px 0 8px' }}>{selectedUser.email}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={clsx('cx-badge', roleBadgeClass(selectedUser.role))}>{selectedUser.role}</span>
                    <span className={clsx('cx-badge', getStatusBadge(selectedUser.isActive, selectedUser.lastLogin))} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {getStatusIcon(selectedUser.isActive, selectedUser.lastLogin)}{selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {selectedUser.sisUserId && (
                      <span className="cx-badge cx-badge--info" style={{ fontSize: '0.75rem' }}>SIS: {selectedUser.sisUserId}</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedUser.profile?.bio && (
                <div style={{ marginBottom: 24 }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 8px' }}>Bio</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', lineHeight: 1.6, margin: 0 }}>{selectedUser.profile.bio}</p>
                </div>
              )}

              <div className="cx-detail-section">
                <h4>Account Information</h4>
                <div className="cx-detail-grid">
                  <div><span className="cx-detail-label">Created</span><span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
                  <div><span className="cx-detail-label">Last Login</span><span>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</span></div>
                  <div><span className="cx-detail-label">Login Count</span><span>{selectedUser.loginCount || 0}</span></div>
                  <div><span className="cx-detail-label">Timezone</span><span>{selectedUser.profile?.timezone || 'Not set'}</span></div>
                  {selectedUser.profile?.pronouns && <div><span className="cx-detail-label">Pronouns</span><span>{selectedUser.profile.pronouns}</span></div>}
                  {selectedUser.profile?.phone && <div><span className="cx-detail-label">Phone</span><span>{selectedUser.profile.phone}</span></div>}
                </div>
              </div>
              <div className="cx-detail-section">
                <h4>Communication Channels</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {loadingChannels ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', padding: '4px 8px' }}>Loading...</div>
                  ) : commChannels.length === 0 ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', padding: '6px 12px', background: 'var(--cx-bg-canvas)', borderRadius: 6 }}>
                      <div>
                        <span style={{ fontWeight: 500 }}>{selectedUser.email}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)', marginLeft: 8 }}>(Primary Email)</span>
                      </div>
                      <span className="cx-badge cx-badge--success" style={{ padding: '2px 6px', fontSize: '0.6875rem' }}>Active</span>
                    </div>
                  ) : (
                    commChannels.map(cc => (
                      <div key={cc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', padding: '6px 12px', background: 'var(--cx-bg-canvas)', borderRadius: 6 }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{cc.address}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)', marginLeft: 8 }}>({cc.type})</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={clsx("cx-badge", cc.workflow_state === 'active' ? "cx-badge--success" : "cx-badge--warning")} style={{ padding: '2px 6px', fontSize: '0.6875rem', textTransform: 'capitalize' }}>
                            {cc.workflow_state}
                          </span>
                          <button className="cx-btn cx-btn--ghost cx-btn--sm" style={{ padding: 2, color: 'var(--cx-text-secondary)' }} onClick={() => handleDeleteChannel(cc.id)} title="Delete Channel">
                            <XSvg />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {showAddChannelForm ? (
                    <form onSubmit={handleAddChannel} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--cx-bg-canvas)', borderRadius: 6, marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <select className="cx-select" style={{ flex: 1 }} value={newChannelType} onChange={e => setNewChannelType(e.target.value)}>
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                        </select>
                        <input type={newChannelType === 'email' ? 'email' : 'text'} className="cx-select" style={{ flex: 2, padding: '6px 12px', background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 6, color: 'var(--cx-text-primary)' }} placeholder={newChannelType === 'email' ? 'email@example.com' : '+1 (555) 123-4567'} value={newChannelAddress} onChange={e => setNewChannelAddress(e.target.value)} required />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button type="button" className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowAddChannelForm(false)}>Cancel</button>
                        <button type="submit" className="cx-btn cx-btn--primary cx-btn--sm" disabled={isAddingChannel}>{isAddingChannel ? 'Adding...' : 'Add'}</button>
                      </div>
                    </form>
                  ) : (
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setShowAddChannelForm(true)}>
                      <PlusSvg /> Add Communication Channel
                    </button>
                  )}
                </div>
              </div>
              <div className="cx-detail-section">
                <h4>Activity Summary</h4>
                <div className="cx-detail-grid">
                  {selectedUser.enrollmentCount !== undefined && <div><span className="cx-detail-label">Enrollments</span><span>{selectedUser.enrollmentCount}</span></div>}
                  {selectedUser.courseCount !== undefined && <div><span className="cx-detail-label">Courses Teaching</span><span>{selectedUser.courseCount}</span></div>}
                </div>
              </div>

              <div className="cx-detail-section">
                <h4>Parent / Observer Linking</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  {loadingLinks ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', padding: '4px 8px' }}>Loading...</div>
                  ) : linkedUsers.length === 0 ? (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', fontStyle: 'italic', padding: '4px 8px' }}>
                      No linked {selectedUser.role === 'student' ? 'observers' : 'students'} currently established.
                    </div>
                  ) : (
                    linkedUsers.map(link => (
                      <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', padding: '8px 12px', background: 'var(--cx-bg-canvas)', borderRadius: 6 }}>
                        <div>
                          <span style={{ fontWeight: 500 }}>{link.name}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--cx-text-tertiary)', marginLeft: 8 }}>({link.email})</span>
                        </div>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" style={{ padding: 2, color: 'var(--cx-text-secondary)' }} onClick={() => handleDeleteObserverLink(String(link.id))} title="Remove Link">
                          <XSvg />
                        </button>
                      </div>
                    ))
                  )}
                  {showAddObserverForm ? (
                    <form onSubmit={handleAddObserverLink} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--cx-bg-canvas)', borderRadius: 6, marginTop: 8 }}>
                      <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--cx-text-secondary)', display: 'block', marginBottom: 4 }}>
                          Select {selectedUser.role === 'student' ? 'Observer' : 'Student'}
                        </label>
                        <select className="cx-select" style={{ width: '100%' }} value={selectedLinkUserId} onChange={e => setSelectedLinkUserId(e.target.value)} required>
                          <option value="">-- Choose User --</option>
                          {users
                            .filter(u => u.id !== selectedUser.id)
                            .filter(u => selectedUser.role === 'student' ? u.role === 'observer' : u.role === 'student')
                            .map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))
                          }
                        </select>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <button type="button" className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowAddObserverForm(false)}>Cancel</button>
                        <button type="submit" className="cx-btn cx-btn--primary cx-btn--sm" disabled={isAddingLink || !selectedLinkUserId}>{isAddingLink ? 'Linking...' : 'Link'}</button>
                      </div>
                    </form>
                  ) : (
                    <button className="cx-btn cx-btn--ghost cx-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setShowAddObserverForm(true)}>
                      <PlusSvg /> Link New {selectedUser.role === 'student' ? 'Observer' : 'Student'}
                    </button>
                  )}
                </div>
              </div>

              <div className="cx-detail-section">
                <h4>Accommodations & Accessibility (IEP/504)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                  <div style={{ padding: 12, background: 'var(--cx-bg-canvas)', borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Quiz Time Multiplier</span>
                      <select 
                        className="cx-select" 
                        style={{ padding: '2px 8px', fontSize: '0.75rem' }} 
                        value={accommodations.timeMultiplier}
                        disabled={savingAccommodations}
                        onChange={(e) => selectedUser && handleSaveAccommodations(selectedUser.id, { timeMultiplier: e.target.value })}
                      >
                        <option value="1">None (1x)</option>
                        <option value="1.5">Time and a half (1.5x)</option>
                        <option value="2">Double time (2x)</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Due Date Extensions</span>
                      <label className="cx-toggle" style={{ margin: 0 }}>
                        <input 
                          type="checkbox" 
                          checked={accommodations.allowLate}
                          disabled={savingAccommodations}
                          onChange={(e) => selectedUser && handleSaveAccommodations(selectedUser.id, { allowLate: e.target.checked })}
                        />
                        <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                        <span className="cx-toggle__label" style={{ fontSize: '0.75rem' }}>Allow Late</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cx-detail-section">
                <h4>User Activity & Page Views Log</h4>
                <div style={{ padding: 16, background: 'var(--cx-bg-canvas)', borderRadius: 6, color: 'var(--cx-text-tertiary)', fontSize: '0.8125rem' }}>
                  <p>Granular page-view and participation logs require the Canvas Data Services API or an analytics pipeline integration.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: 8 }}>Standard REST endpoints do not expose per-user activity timelines.</p>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer" style={{ display: 'flex', gap: 8 }}>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setShowUserModal(false); handleEditClick(selectedUser); }}><EditSvg /> Edit User</button>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setSendMessageUser(selectedUser)}><MailSvg /> Send Message</button>
              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleResetPassword(selectedUser.id)}><KeySvg /> Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {sendMessageUser && (
        <div className="cx-modal-overlay" onClick={() => setSendMessageUser(null)}>
          <form className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()} onSubmit={handleSendMessage}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Send Message to {sendMessageUser.name}</h2>
              <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setSendMessageUser(null)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Subject</label>
                  <input type="text" style={inpStyle} placeholder="Enter message subject" value={messageSubject} onChange={e => setMessageSubject(e.target.value)} required />
                </div>
                <div>
                  <label style={labelStyle}>Message Body</label>
                  <textarea style={{ ...inpStyle, minHeight: 120, resize: 'vertical' }} placeholder="Type your message here..." value={messageBody} onChange={e => setMessageBody(e.target.value)} required />
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button type="button" className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setSendMessageUser(null)}>Cancel</button>
              <button type="submit" className="cx-btn cx-btn--primary cx-btn--sm" disabled={isSendingMessage}>{isSendingMessage ? 'Sending...' : 'Send Message'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <div className="cx-modal-overlay" onClick={() => { setShowBulkImportModal(false); setBulkImportResult(null); setBulkImportFile(null); }}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Bulk Import Users</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => { setShowBulkImportModal(false); setBulkImportResult(null); setBulkImportFile(null); }}><XSvg /></button>
            </div>
            <div className="cx-modal__body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', margin: 0 }}>
                Upload a CSV file in <strong>Instructure format</strong> to bulk create users, courses, and enrollments via the Canvas SIS Import API.
              </p>

              <div style={{
                border: '2px dashed var(--cx-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 32,
                textAlign: 'center',
                background: 'var(--cx-bg-surface-raised)'
              }}>
                <FileSvg />
                <h4 style={{ margin: '12px 0 6px', color: 'var(--cx-text-primary)', fontSize: '1rem' }}>{bulkImportFile ? bulkImportFile.name : 'Select a CSV or ZIP file'}</h4>
                <p style={{ color: 'var(--cx-text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
                  {bulkImportFile ? `${(bulkImportFile.size / 1024).toFixed(1)} KB` : 'Instructure CSV format required'}
                </p>
                <label className="cx-btn cx-btn--secondary" style={{ cursor: 'pointer' }}>
                  Choose File
                  <input type="file" accept=".csv,.zip" style={{ display: 'none' }} onChange={e => { setBulkImportFile(e.target.files?.[0] || null); setBulkImportResult(null); }} />
                </label>
              </div>

              {bulkImportResult && (
                <div className={`cx-notification cx-notification--${bulkImportResult.success ? 'success' : 'danger'}`} style={{ marginTop: 4 }}>
                  <div>
                    <div className="cx-notification__title">{bulkImportResult.success ? 'Import Started' : 'Import Failed'}</div>
                    <div className="cx-notification__subtitle">{bulkImportResult.message}</div>
                    {bulkImportResult.importId && (
                      <div style={{ marginTop: 8 }}>
                        <a href="/sis-imports" className="cx-btn cx-btn--ghost cx-btn--sm" style={{ textDecoration: 'none' }}>View on SIS Imports Page →</a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => { setShowBulkImportModal(false); setBulkImportResult(null); setBulkImportFile(null); }}>Close</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!bulkImportFile || bulkImportLoading} onClick={handleBulkImport}>
                {bulkImportLoading ? 'Uploading...' : 'Start Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
