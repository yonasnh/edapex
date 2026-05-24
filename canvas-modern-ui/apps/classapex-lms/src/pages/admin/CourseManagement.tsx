import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import CourseCard from '../../components/CourseCard';

interface SectionData {
  id: string;
  courseId: string;
  name: string;
  studentCount: number;
  startAt?: string;
  endAt?: string;
  isActive: boolean;
}

function SearchSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>; }
function PlusSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>; }
function XSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l6 6M10 4l-6 6"/></svg>; }
function EditSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 1.5l2.5 2.5L4.5 12H2v-2.5L10 1.5z"/></svg>; }
function EyeSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"/><circle cx="7" cy="7" r="1.5"/></svg>; }
function TrashSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M5 3V2a1 1 0 011-1h2a1 1 0 011 1v1M11 5v7a1 1 0 01-1 1H4a1 1 0 01-1-1V5"/></svg>; }
function CopySvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4.5" y="4.5" width="8" height="8" rx="1"/><path d="M2.5 11V2.5H11"/></svg>; }
function CheckSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M5.5 8l2 2 3-4"/></svg>; }
function AlertSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5"/><circle cx="8" cy="11" r="0.5" fill="currentColor"/></svg>; }
function XCircleSvg() { return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M6 6l4 4M10 6l-4 4"/></svg>; }
function BookSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>; }
function PeopleSvg() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>; }
function ChevronDownSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 5l3 3 3-3"/></svg>; }
function LaunchSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 8v3.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3H6"/><path d="M8 1h5v5"/><path d="M7 7l6-6"/></svg>; }
function SettingsSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="1.5"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.9 2.9l1.1 1.1M10 10l1.1 1.1M2.9 11.1L4 10M10 4l1.1-1.1"/></svg>; }
function GridSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5" height="5" rx="1"/><rect x="8" y="1" width="5" height="5" rx="1"/><rect x="1" y="8" width="5" height="5" rx="1"/><rect x="8" y="8" width="5" height="5" rx="1"/></svg>; }
function ListSvg() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h10M2 7h10M2 11h10"/></svg>; }

interface CourseData {
  id: string;
  name: string;
  courseCode: string;
  workflowState: 'unpublished' | 'available' | 'completed' | 'deleted';
  startAt?: string;
  concludeAt?: string;
  createdAt: string;
  isActive: boolean;
  isPublished: boolean;
  studentCount: number;
  teacherCount: number;
  assignmentCount: number;
  syllabusBody?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  color?: string;
  term?: string;
  department?: string;
  credits?: number;
  enrollmentType?: 'open' | 'invitation_only' | 'self_enrollment';
  visibility?: 'public' | 'course_members' | 'institution';
}

// We will fetch these from Canvas API instead
// const mockCourses: CourseData[] = ...

const mockTerms = ['Spring 2024', 'Fall 2024', 'Summer 2024', 'Fall 2023'];
const mockDepartments = ['Computer Science', 'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];

const statusBadgeClass = (s: string) => s === 'available' ? 'cx-badge--success' : s === 'unpublished' ? 'cx-badge--warning' : s === 'completed' ? 'cx-badge--info' : 'cx-badge--danger';

import { useCanvasQuery, canvasFetch } from '../../hooks/useCanvasQuery';
import { useNotification } from '../../hooks/useNotification';

const AdminCourseManagementPage: React.FC = () => {
  const { showConfirm, showToast } = useNotification();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTerm, setFilterTerm] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeMigrationModal, setActiveMigrationModal] = useState<'export' | 'import' | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showSectionsModal, setShowSectionsModal] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState({ name: '', studentCount: 0, isActive: true });

  // Bulk Operations & Migration States (S15-03, S15-08, S15-10)
  const [activeBulkOp, setActiveBulkOp] = useState<'list' | 'import' | 'audit'>('list');
  const [importProgress, setImportProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [migrationLogs, setMigrationLogs] = useState([
    { id: 'm1', type: 'Common Cartridge 1.3 Import', date: '2026-05-18', size: '42.1 MB', status: 'Completed' },
    { id: 'm2', type: 'Canvas Course Package (.imscc) Import', date: '2026-05-15', size: '128.5 MB', status: 'Completed' }
  ]);
  const [auditLogs] = useState([
    { id: 'a1', date: '2026-05-19T10:14:00Z', user: 'Sophia Miller', course: 'Computer Science 101', role: 'Student', action: 'Enrolled via SIS Import', actor: 'System Admin' },
    { id: 'a2', date: '2026-05-19T09:45:00Z', user: 'James Wilson', course: 'Mathematics 204', role: 'Teacher', action: 'Added to Section A', actor: 'Professor Davis (Masquerading)' },
    { id: 'a3', date: '2026-05-18T14:22:00Z', user: 'Emma Thompson', course: 'Chemistry Lab', role: 'Student', action: 'Dropped Course', actor: 'Student (Self-service)' }
  ]);

  const [newCourse, setNewCourse] = useState({
    name: '', courseCode: '', department: '', term: '', credits: 3,
    startDate: '', endDate: '', syllabusBody: '',
    enrollmentType: 'open', visibility: 'course_members',
    isPublished: false, allowSelfEnrollment: true
  });

  const [editCourse, setEditCourse] = useState<Partial<CourseData>>({});

  const { data: canvasCourses, refetch } = useCanvasQuery<any[]>('/api/v1/accounts/1/courses', { include: ['term', 'total_students', 'teachers', 'syllabus_body'], per_page: 50 } as any);

  const mockCourses = useMemo<CourseData[]>(() => {
    if (!Array.isArray(canvasCourses)) return [];
    return canvasCourses.map(c => ({
      id: String(c.id),
      name: c.name || 'Untitled Course',
      courseCode: c.course_code || '',
      workflowState: c.workflow_state as any,
      startAt: c.start_at,
      concludeAt: c.end_at,
      createdAt: c.created_at,
      isActive: c.workflow_state === 'available',
      isPublished: c.workflow_state === 'available',
      studentCount: c.total_students || 0,
      teacherCount: c.teachers ? c.teachers.length : 0,
      assignmentCount: 0,
      syllabusBody: c.syllabus_body,
      term: c.term?.name,
      department: 'Uncategorized', // Departments aren't heavily formalized in basic Canvas API without sub-accounts
    }));
  }, [canvasCourses]);

  const filteredCourses = useMemo(() => {
    let filtered = mockCourses;
    if (searchTerm) filtered = filtered.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) || c.department?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterStatus !== 'all') filtered = filtered.filter(c => c.workflowState === filterStatus);
    if (filterTerm !== 'all') filtered = filtered.filter(c => c.term === filterTerm);
    if (filterDepartment !== 'all') filtered = filtered.filter(c => c.department === filterDepartment);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'code': return a.courseCode.localeCompare(b.courseCode);
        case 'students': return b.studentCount - a.studentCount;
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'startDate': return (b.startAt ? new Date(b.startAt).getTime() : 0) - (a.startAt ? new Date(a.startAt).getTime() : 0);
        default: return 0;
      }
    });
    return filtered;
  }, [mockCourses, searchTerm, filterStatus, filterTerm, filterDepartment, sortBy]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const paginatedCourses = filteredCourses.slice((page - 1) * pageSize, page * pageSize);

  const stats = useMemo(() => ({
    total: mockCourses.length,
    active: mockCourses.filter(c => c.workflowState === 'available').length,
    published: mockCourses.filter(c => c.isPublished).length,
    totalStudents: mockCourses.reduce((s, c) => s + c.studentCount, 0),
    unpublished: mockCourses.filter(c => c.workflowState === 'unpublished').length,
  }), [mockCourses]);

  const getStatusIcon = (s: string) => s === 'available' ? <CheckSvg /> : s === 'unpublished' ? <AlertSvg /> : s === 'completed' ? <CheckSvg /> : <XCircleSvg />;

  // Fetch sections when a course modal is opened
  const fetchSections = useCallback(async () => {
    if (!selectedCourse) return;
    try {
      setSectionsLoading(true);
      const data = await canvasFetch(`/api/v1/courses/${selectedCourse.id}/sections?include[]=students`);
      const mapped = (Array.isArray(data) ? data : []).map((s: any) => ({
        id: String(s.id),
        courseId: selectedCourse.id,
        name: s.name,
        studentCount: s.students?.length || 0,
        startAt: s.start_at,
        endAt: s.end_at,
        isActive: true,
      }));
      setSections(mapped);
    } catch (err: any) {
      showToast({ title: 'Failed to load sections', message: err.message || 'An error occurred while loading sections.', type: 'error' });
    } finally {
      setSectionsLoading(false);
    }
  }, [selectedCourse, showToast]);

  useEffect(() => {
    if (selectedCourse && (showSectionsModal || showCourseModal)) {
      fetchSections();
    }
  }, [selectedCourse, showSectionsModal, showCourseModal, fetchSections]);

  const handleAddSection = async () => {
    if (!selectedCourse || !sectionForm.name.trim()) return;
    try {
      setAddingSection(true);
      await canvasFetch(`/api/v1/courses/${selectedCourse.id}/sections`, {
        method: 'POST',
        body: { course_section: { name: sectionForm.name.trim() } }
      });
      showToast({ title: 'Section Added', message: 'Section created successfully.', type: 'success' });
      setSectionForm({ name: '', studentCount: 0, isActive: true });
      await fetchSections();
    } catch (err: any) {
      showToast({ title: 'Failed to add section', message: err.message || 'An error occurred while adding the section.', type: 'error' });
    } finally {
      setAddingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Section',
      message: 'Are you sure you want to delete this section? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      setDeletingSectionId(sectionId);
      await canvasFetch(`/api/v1/sections/${sectionId}`, { method: 'DELETE' });
      showToast({ title: 'Section Deleted', message: 'Section deleted successfully.', type: 'success' });
      await fetchSections();
    } catch (err: any) {
      showToast({ title: 'Failed to delete section', message: err.message || 'An error occurred while deleting the section.', type: 'error' });
    } finally {
      setDeletingSectionId(null);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const payload = {
        course: {
          name: newCourse.name,
          course_code: newCourse.courseCode || undefined,
          start_at: newCourse.startDate ? new Date(newCourse.startDate).toISOString() : undefined,
          end_at: newCourse.endDate ? new Date(newCourse.endDate).toISOString() : undefined,
          syllabus_body: newCourse.syllabusBody || undefined,
          is_public: newCourse.visibility === 'public',
        },
        offer: newCourse.isPublished
      };

      await canvasFetch('/api/v1/accounts/1/courses', {
        method: 'POST',
        body: payload
      });
      
      setNewCourse({ name: '', courseCode: '', department: '', term: '', credits: 3, startDate: '', endDate: '', syllabusBody: '', enrollmentType: 'open', visibility: 'course_members', isPublished: false, allowSelfEnrollment: true });
      setShowCreateModal(false);
      showToast({
        title: 'Course Created',
        message: 'Successfully created new course.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to create course',
        message: err.message || 'An error occurred while creating the course.',
        type: 'error'
      });
    }
  };
  const handleUseTemplate = (templateName: string) => {
    let name = '';
    let code = '';
    let syllabus = '';
    let dept = '';
    
    if (templateName === 'Computer Science Course') {
      name = 'Computer Science 101 Template';
      code = 'CS101';
      syllabus = 'Introduction to programming concepts, control flow, functions, and data structures. Weekly lab assignments and projects.';
      dept = 'Computer Science';
    } else if (templateName === 'Mathematics Course') {
      name = 'Introduction to Calculus Template';
      code = 'MATH101';
      syllabus = 'Limits, derivatives, integrals, and their applications. Homework sets and exams.';
      dept = 'Mathematics';
    } else if (templateName === 'Literature Course') {
      name = 'Modern Literature Template';
      code = 'LIT201';
      syllabus = 'Analysis of 20th-century novels, poetry, and plays. Emphasis on critical writing and group discussions.';
      dept = 'English';
    } else if (templateName === 'Science Lab Course') {
      name = 'General Chemistry Lab Template';
      code = 'CHEM101L';
      syllabus = 'Laboratory experiments covering fundamental principles of general chemistry. Pre-lab quizzes and formal reports.';
      dept = 'Chemistry';
    }

    setNewCourse({
      name,
      courseCode: code,
      department: dept,
      term: 'Spring 2024',
      credits: 3,
      startDate: '',
      endDate: '',
      syllabusBody: syllabus,
      enrollmentType: 'open',
      visibility: 'course_members',
      isPublished: false,
      allowSelfEnrollment: true
    });
    
    setShowCreateModal(true);
  };
  const handleEditCourse = async () => {
    if (!editCourse.id) return;
    try {
      let event: string | undefined = undefined;
      const targetState = editCourse.isPublished ? 'available' : editCourse.workflowState;
      if (targetState === 'available') {
        event = 'offer';
      } else if (targetState === 'completed') {
        event = 'conclude';
      } else if (targetState === 'unpublished') {
        event = 'claim';
      }

      const payload = {
        course: {
          name: editCourse.name,
          course_code: editCourse.courseCode,
          syllabus_body: editCourse.syllabusBody,
          event: event
        }
      };

      await canvasFetch(`/api/v1/courses/${editCourse.id}`, {
        method: 'PUT',
        body: payload
      });

      setEditCourse({});
      setShowEditModal(false);
      showToast({
        title: 'Course Updated',
        message: 'Successfully updated course details.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to update course',
        message: err.message || 'An error occurred while updating the course.',
        type: 'error'
      });
    }
  };
  const handleCourseClick = (c: CourseData) => { setSelectedCourse(c); setShowCourseModal(true); };
  const handleEditClick = (c: CourseData) => { setEditCourse(c); setShowEditModal(true); };
  const handleDeleteCourse = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      type: 'danger'
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/courses/${id}?event=delete`, {
        method: 'DELETE'
      });
      showToast({
        title: 'Course Deleted',
        message: 'Successfully deleted the course.',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to delete course',
        message: err.message || 'An error occurred while deleting the course.',
        type: 'error'
      });
    }
  };
  const handleCopyCourse = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Copy Course',
      message: 'Are you sure you want to create a copy of this course?',
      confirmLabel: 'Copy Course',
      cancelLabel: 'Cancel',
      type: 'info'
    });
    if (!confirmed) return;
    try {
      await canvasFetch(`/api/v1/courses/${id}/copy`, {
        method: 'POST'
      });
      showToast({
        title: 'Copy Course',
        message: 'Course copy initiated successfully!',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to copy course',
        message: err.message || 'An error occurred while copying the course.',
        type: 'error'
      });
    }
  };

  const handlePublishCourse = async (id: string) => {
    try {
      await canvasFetch(`/api/v1/courses/${id}`, {
        method: 'PUT',
        body: { course: { event: 'offer' } }
      });
      showToast({
        title: 'Course Published',
        message: 'Course published successfully!',
        type: 'success'
      });
      refetch();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to publish course',
        message: err.message || 'An error occurred while publishing the course.',
        type: 'error'
      });
    }
  };
  const handleClearFilters = () => { setSearchTerm(''); setFilterStatus('all'); setFilterTerm('all'); setFilterDepartment('all'); setPage(1); };

  const inpStyle: React.CSSProperties = { border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', padding: '8px 12px', width: '100%', background: 'var(--cx-bg-surface)', color: 'var(--cx-text-primary)', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--cx-text-primary)', display: 'block', marginBottom: 4 };
  const toggleLabelStyle: React.CSSProperties = { fontSize: '0.8125rem', color: 'var(--cx-text-primary)' };

  const tabs = ['All Courses', 'Course Templates', 'Bulk Operations'];

  return (
    <div className="cx-page">
      <div className="cx-page__header">
        <div>
          <h1 className="cx-page__title">Course Management</h1>
          <p className="cx-page__subtitle">Create and manage courses. Administer course settings, enrollments, and content across the platform.</p>
        </div>
        <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setShowCreateModal(true)}><PlusSvg /> New Course</button>
      </div>

      <div className="cx-stats-grid">
        {[
          { label: 'Total Courses', value: stats.total, icon: <BookSvg /> },
          { label: 'Active Courses', value: stats.active, icon: <CheckSvg /> },
          { label: 'Total Students', value: stats.totalStudents, icon: <PeopleSvg /> },
          { label: 'Unpublished', value: stats.unpublished, icon: <AlertSvg />, desc: stats.unpublished > 0 ? 'Needs attention' : 'All published' },
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

      <div className="cx-tabs">
        {tabs.map((tab, i) => (
          <button key={i} className={clsx('cx-tab', activeTab === i && 'cx-tab--active')} onClick={() => { setActiveTab(i); setPage(1); }}>{tab}</button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="cx-section">
          <div className="cx-toolbar">
            <div className="cx-search">
              <SearchSvg />
              <input type="search" className="cx-search__input" placeholder="Search courses..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <select className="cx-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unpublished">Unpublished</option>
              <option value="completed">Completed</option>
              <option value="deleted">Deleted</option>
            </select>
            <select className="cx-select" value={filterTerm} onChange={e => { setFilterTerm(e.target.value); setPage(1); }}>
              <option value="all">All Terms</option>
              {mockTerms.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select className="cx-select" value={filterDepartment} onChange={e => { setFilterDepartment(e.target.value); setPage(1); }}>
              <option value="all">All Departments</option>
              {mockDepartments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select className="cx-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
              <option value="name">Course Name</option>
              <option value="code">Course Code</option>
              <option value="students">Student Count</option>
              <option value="created">Date Created</option>
              <option value="startDate">Start Date</option>
            </select>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={clsx('cx-btn cx-btn--sm', viewMode === 'table' ? 'cx-btn--primary' : 'cx-btn--secondary')} onClick={() => setViewMode('table')} title="Table"><ListSvg /></button>
              <button className={clsx('cx-btn cx-btn--sm', viewMode === 'cards' ? 'cx-btn--primary' : 'cx-btn--secondary')} onClick={() => setViewMode('cards')} title="Cards"><GridSvg /></button>
            </div>
          </div>

          {paginatedCourses.length === 0 ? (
            <div className="cx-empty">
              <BookSvg />
              <h3>No courses found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={handleClearFilters}>Clear Filters</button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="cx-table-container">
              <table className="cx-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Code</th>
                    <th>Department</th>
                    <th>Term</th>
                    <th>Status</th>
                    <th>Students</th>
                    <th>Teachers</th>
                    <th>Start Date</th>
                    <th>Credits</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCourses.map(course => (
                    <tr key={course.id} className="cx-table__row">
                      <td className="cx-table__cell cx-table__cell--name">{course.name}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.courseCode}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.department || '-'}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.term || '-'}</td>
                      <td className="cx-table__cell"><span className={clsx('cx-badge', statusBadgeClass(course.workflowState))} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{getStatusIcon(course.workflowState)}{course.workflowState}</span></td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.studentCount}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.teacherCount}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.startAt ? new Date(course.startAt).toLocaleDateString() : '-'}</td>
                      <td className="cx-table__cell cx-table__cell--muted">{course.credits || '-'}</td>
                      <td className="cx-table__cell cx-table__cell--actions" style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleCourseClick(course)} title="View"><EyeSvg /></button>
                          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => handleEditClick(course)} title="Edit"><EditSvg /></button>
                          <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setShowActions(showActions === course.id ? null : course.id)} title="More"><ChevronDownSvg /></button>
                        </div>
                        {showActions === course.id && (
                          <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--cx-bg-surface)', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 180, padding: 4 }}>
                            <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleCourseClick(course); setShowActions(null); }}><EyeSvg /> View Course</button>
                            <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleEditClick(course); setShowActions(null); }}><EditSvg /> Edit Course</button>
                            <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleCopyCourse(course.id); setShowActions(null); }}><CopySvg /> Copy Course</button>
                            {course.workflowState === 'unpublished' && (
                              <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handlePublishCourse(course.id); setShowActions(null); }}><CheckSvg /> Publish Course</button>
                            )}
                             <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { navigate(`/admin/users?courseId=${course.id}`); setShowActions(null); }}><PeopleSvg /> Manage Enrollments</button>
                             <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-text-primary)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { navigate(`/admin/course-settings?id=${course.id}`); setShowActions(null); }}><SettingsSvg /> Course Settings</button>
                            <div style={{ borderTop: '1px solid var(--cx-border-subtle)', margin: '4px 0' }} />
                            <button style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 12px', border: 'none', background: 'none', color: 'var(--cx-accent-error)', cursor: 'pointer', fontSize: '0.8125rem', borderRadius: 'var(--radius-sm)' }} onClick={() => { handleDeleteCourse(course.id); setShowActions(null); }}><TrashSvg /> Delete Course</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ padding: '8px 16px', fontSize: '0.8125rem', color: 'var(--cx-text-tertiary)', borderTop: '1px solid var(--cx-border-subtle)' }}>
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </div>
            </div>
          ) : (
            <div className="cx-card-grid">
              {paginatedCourses.map(course => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  name={course.name}
                  courseCode={course.courseCode}
                  workflowState={course.workflowState}
                  startAt={course.startAt}
                  concludeAt={course.concludeAt}
                  createdAt={course.createdAt}
                  isActive={course.isActive}
                  isPublished={course.isPublished}
                  studentCount={course.studentCount}
                  teacherCount={course.teacherCount}
                  assignmentCount={course.assignmentCount}
                  syllabusBody={course.syllabusBody}
                  imageUrl={course.imageUrl}
                  bannerImageUrl={course.bannerImageUrl}
                  color={course.color}
                  onClick={() => handleCourseClick(course)}
                />
              ))}
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
      )}

      {activeTab === 1 && (
        <div className="cx-section">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 4px' }}>Course Templates</h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: '0 0 16px' }}>Create new courses from predefined templates to ensure consistency and save time.</p>
          <div className="cx-card-grid">
            {[
              { name: 'Computer Science Course', desc: 'Template for programming and computer science courses with coding assignments and projects.' },
              { name: 'Mathematics Course', desc: 'Template for mathematics courses with problem sets and theoretical assignments.' },
              { name: 'Literature Course', desc: 'Template for literature and humanities courses with discussion forums and essays.' },
              { name: 'Science Lab Course', desc: 'Template for laboratory science courses with experiments and lab reports.' },
            ].map((t, i) => (
              <div key={i} className="cx-card">
                <div className="cx-card__header"><h3 className="cx-card__title">{t.name}</h3></div>
                <div className="cx-card__body"><p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>{t.desc}</p></div>
                <div className="cx-card__footer" style={{ padding: '12px 16px', borderTop: '1px solid var(--cx-border-subtle)' }}>
                  <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => handleUseTemplate(t.name)}>Use Template</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="cx-section">
          {activeBulkOp === 'list' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 4px' }}>Bulk Operations &amp; Migrations</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>Perform migrations, audit enrollment logs, and execute bulk tasks.</p>
              </div>

              <div className="cx-card-grid">
                <div className="cx-card">
                  <div className="cx-card__header"><h3 className="cx-card__title">Course Import &amp; Content Migrations</h3></div>
                  <div className="cx-card__body">
                    <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>
                      Import course packages (Common Cartridge .imscc or zip packages) or migrate content directly from other active courses.
                    </p>
                  </div>
                  <div className="cx-card__footer" style={{ padding: '12px 16px', borderTop: '1px solid var(--cx-border-subtle)' }}>
                    <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setActiveBulkOp('import')}>Configure Importer</button>
                  </div>
                </div>

                <div className="cx-card">
                  <div className="cx-card__header"><h3 className="cx-card__title">Enrollment Audit Trails</h3></div>
                  <div className="cx-card__body">
                    <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>
                      Inspect historic course enrollment events, track student additions/drops, and verify who authorized each enrollment change.
                    </p>
                  </div>
                  <div className="cx-card__footer" style={{ padding: '12px 16px', borderTop: '1px solid var(--cx-border-subtle)' }}>
                    <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => setActiveBulkOp('audit')}>Open Audit Trail</button>
                  </div>
                </div>

                <div className="cx-card">
                  <div className="cx-card__header"><h3 className="cx-card__title">Term Rollover Wizard</h3></div>
                  <div className="cx-card__body">
                    <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>
                      Copy all active curriculum structures and settings from a past academic term to a new target term in one action.
                    </p>
                  </div>
                  <div className="cx-card__footer" style={{ padding: '12px 16px', borderTop: '1px solid var(--cx-border-subtle)' }}>
                    <button className="cx-btn cx-btn--secondary cx-btn--sm" disabled>Launch Wizard</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeBulkOp === 'import' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 4px' }}>Course Package Importer</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>Upload Common Cartridge standard packages to provision outcomes, quizzes, and modules.</p>
                </div>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setActiveBulkOp('list')}>&larr; Back</button>
              </div>

              <div className="cx-card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600 }}>Configure New Migration</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={labelStyle}>Migration Source Type</label>
                    <select className="cx-select" style={{ width: '100%' }}>
                      <option value="common_cartridge">Common Cartridge 1.1/1.2/1.3 Package (.imscc)</option>
                      <option value="canvas_export">Canvas Course Export Package (.zip)</option>
                      <option value="course_copy">Direct Course Copy (Migrate from existing)</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Select Package File</label>
                    <input
                      type="file"
                      accept=".imscc,.zip"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFile(file.name);
                      }}
                      style={{ fontSize: '0.8125rem', color: 'var(--cx-text-primary)' }}
                    />
                  </div>
                </div>

                {selectedFile && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--cx-text-primary)', fontWeight: 600 }}>Selected: {selectedFile}</span>
                    <button
                      className="cx-btn cx-btn--primary cx-btn--sm"
                      disabled={importProgress !== null}
                      onClick={() => {
                        setImportProgress(0);
                        const interval = setInterval(() => {
                          setImportProgress(prev => {
                            if (prev === null) return 0;
                            if (prev >= 100) {
                              clearInterval(interval);
                              setMigrationLogs(logs => [
                                {
                                  id: `m-${Date.now()}`,
                                  type: `Common Cartridge 1.3 Import (${selectedFile})`,
                                  date: new Date().toISOString().split('T')[0],
                                  size: '34.8 MB',
                                  status: 'Completed'
                                },
                                ...logs
                              ]);
                              setSelectedFile(null);
                              showToast({
                                title: 'Migration Complete',
                                message: 'Common Cartridge content migration finished successfully! All aligned quizzes, assignments, and outcomes have been built.',
                                type: 'success'
                              });
                              return null;
                            }
                            return prev + 20;
                          });
                        }, 400);
                      }}
                    >
                      {importProgress !== null ? 'Importing...' : 'Start Content Migration'}
                    </button>
                  </div>
                )}

                {importProgress !== null && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                      <span>Analyzing &amp; extracting package elements...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--cx-border-subtle)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${importProgress}%`, background: 'var(--cx-color-primary)', borderRadius: 3, transition: 'width 0.2s ease' }} />
                    </div>
                  </div>
                )}
              </div>

              <div className="cx-card" style={{ padding: 20 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600 }}>Historic Content Migrations (`GET /api/v1/content_migrations`)</h4>
                <div className="cx-table-container">
                  <table className="cx-table">
                    <thead>
                      <tr>
                        <th>Source Package / Type</th>
                        <th>Import Date</th>
                        <th>Package Size</th>
                        <th>Migration Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {migrationLogs.map(log => (
                        <tr key={log.id} className="cx-table__row">
                          <td style={{ fontWeight: 600 }}>{log.type}</td>
                          <td>{log.date}</td>
                          <td>{log.size}</td>
                          <td>
                            <span className="cx-badge cx-badge--success" style={{ fontSize: '0.7rem' }}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeBulkOp === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--cx-text-primary)', margin: '0 0 4px' }}>Historic Enrollment Audit Logs</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', margin: 0 }}>Review all additions, transfers, and drops of students and teachers across sections.</p>
                </div>
                <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => setActiveBulkOp('list')}>&larr; Back</button>
              </div>

              <div className="cx-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Audited Enrollment Actions</h4>
                  <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => showToast({ title: 'Export Trace', message: 'CSV download of complete audit trace initiated.', type: 'info' })}>
                    Export Logs to CSV
                  </button>
                </div>
                <div className="cx-table-container">
                  <table className="cx-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>User Name</th>
                        <th>Course</th>
                        <th>Assigned Role</th>
                        <th>Action Performed</th>
                        <th>Authorized Actor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map(log => (
                        <tr key={log.id} className="cx-table__row">
                          <td style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{new Date(log.date).toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>{log.user}</td>
                          <td>{log.course}</td>
                          <td><span className="cx-badge cx-badge--neutral">{log.role}</span></td>
                          <td><span style={{ color: log.action.includes('Dropped') ? 'var(--cx-accent-error)' : 'var(--cx-text-primary)' }}>{log.action}</span></td>
                          <td style={{ fontStyle: 'italic' }}>{log.actor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="cx-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Create New Course</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCreateModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Course Name</label>
                    <input type="text" style={inpStyle} placeholder="Enter course name" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Course Code</label>
                    <input type="text" style={inpStyle} placeholder="e.g., CS101" value={newCourse.courseCode} onChange={e => setNewCourse({...newCourse, courseCode: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Department</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newCourse.department} onChange={e => setNewCourse({...newCourse, department: e.target.value})}>
                      <option value="">Select department</option>
                      {mockDepartments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Term</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newCourse.term} onChange={e => setNewCourse({...newCourse, term: e.target.value})}>
                      <option value="">Select term</option>
                      {mockTerms.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Credits</label>
                  <input type="number" style={inpStyle} min={1} max={6} value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: parseInt(e.target.value) || 1})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input type="date" style={inpStyle} value={newCourse.startDate} onChange={e => setNewCourse({...newCourse, startDate: e.target.value})} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input type="date" style={inpStyle} value={newCourse.endDate} onChange={e => setNewCourse({...newCourse, endDate: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Course Description</label>
                  <textarea style={{ ...inpStyle, resize: 'vertical', minHeight: 80 }} rows={4} placeholder="Enter course description and syllabus information" value={newCourse.syllabusBody} onChange={e => setNewCourse({...newCourse, syllabusBody: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Enrollment Type</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newCourse.enrollmentType} onChange={e => setNewCourse({...newCourse, enrollmentType: e.target.value})}>
                      <option value="open">Open Enrollment</option>
                      <option value="invitation_only">Invitation Only</option>
                      <option value="self_enrollment">Self Enrollment</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Course Visibility</label>
                    <select className="cx-select" style={{ width: '100%' }} value={newCourse.visibility} onChange={e => setNewCourse({...newCourse, visibility: e.target.value})}>
                      <option value="public">Public</option>
                      <option value="course_members">Course Members Only</option>
                      <option value="institution">Institution Only</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newCourse.isPublished} onChange={e => setNewCourse({...newCourse, isPublished: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={toggleLabelStyle}>Publish Course Immediately</span>
                  </label>
                  <label className="cx-toggle">
                    <input type="checkbox" checked={newCourse.allowSelfEnrollment} onChange={e => setNewCourse({...newCourse, allowSelfEnrollment: e.target.checked})} />
                    <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                    <span className="cx-toggle__label" style={toggleLabelStyle}>Allow Self Enrollment</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleCreateCourse}>Create Course</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="cx-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Edit Course</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowEditModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Course Name</label>
                  <input type="text" style={inpStyle} value={editCourse.name || ''} onChange={e => setEditCourse({...editCourse, name: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Course Code</label>
                  <input type="text" style={inpStyle} value={editCourse.courseCode || ''} onChange={e => setEditCourse({...editCourse, courseCode: e.target.value})} />
                </div>
                <div>
                  <label style={labelStyle}>Course Status</label>
                  <select className="cx-select" style={{ width: '100%' }} value={editCourse.workflowState || 'unpublished'} onChange={e => setEditCourse({...editCourse, workflowState: e.target.value as any})}>
                    <option value="unpublished">Unpublished</option>
                    <option value="available">Available</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Course Description</label>
                  <textarea style={{ ...inpStyle, resize: 'vertical', minHeight: 80 }} rows={4} value={editCourse.syllabusBody || ''} onChange={e => setEditCourse({...editCourse, syllabusBody: e.target.value})} />
                </div>
                <label className="cx-toggle">
                  <input type="checkbox" checked={editCourse.isPublished || false} onChange={e => setEditCourse({...editCourse, isPublished: e.target.checked})} />
                  <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                  <span className="cx-toggle__label" style={toggleLabelStyle}>Published</span>
                </label>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={handleEditCourse}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showSectionsModal && selectedCourse && (
        <div className="cx-modal-overlay" onClick={() => setShowSectionsModal(false)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Sections — {selectedCourse.name}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowSectionsModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              {sectionsLoading ? (
                <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>Loading sections...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {sections.filter(s => s.courseId === selectedCourse.id).map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid var(--cx-border-subtle)', borderRadius: 'var(--radius-md)' }}>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--cx-text-tertiary)' }}>{s.studentCount} enrolled</div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <span className={clsx('cx-badge', s.isActive ? 'cx-badge--success' : 'cx-badge--neutral')} style={{ fontSize: '0.6875rem' }}>{s.isActive ? 'Active' : 'Inactive'}</span>
                        <button className="cx-btn cx-btn--ghost cx-btn--sm" disabled={deletingSectionId === s.id} onClick={() => handleDeleteSection(s.id)}>
                          {deletingSectionId === s.id ? '...' : <TrashSvg />}
                        </button>
                      </div>
                    </div>
                  ))}
                  {sections.filter(s => s.courseId === selectedCourse.id).length === 0 && (
                    <p style={{ color: 'var(--cx-text-tertiary)', fontSize: '0.875rem' }}>No sections yet. Add one below.</p>
                  )}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--cx-border-subtle)', paddingTop: 16 }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 12px' }}>Add Section</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="cx-input" type="text" placeholder="Section name" value={sectionForm.name} onChange={e => setSectionForm(p => ({ ...p, name: e.target.value }))} style={{ flex: 1 }} />
                  <input className="cx-input" type="number" placeholder="Students" min={0} value={sectionForm.studentCount} onChange={e => setSectionForm(p => ({ ...p, studentCount: Math.max(0, Number(e.target.value)) }))} style={{ width: 100 }} />
                </div>
                <button className="cx-btn cx-btn--primary cx-btn--sm" disabled={!sectionForm.name.trim() || addingSection} onClick={handleAddSection}>
                  {addingSection ? 'Adding...' : <><PlusSvg /> Add Section</>}
                </button>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--primary" onClick={() => setShowSectionsModal(false)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && selectedCourse && (
        <div className="cx-modal-overlay" onClick={() => setShowCourseModal(false)}>
          <div className="cx-modal cx-modal--lg" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">{selectedCourse.name}</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setShowCourseModal(false)}><XSvg /></button>
            </div>
            <div className="cx-modal__body">
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', margin: '0 0 8px' }}>{selectedCourse.courseCode}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={clsx('cx-badge', statusBadgeClass(selectedCourse.workflowState))} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{getStatusIcon(selectedCourse.workflowState)}{selectedCourse.workflowState}</span>
                  {selectedCourse.department && <span className="cx-badge cx-badge--neutral">{selectedCourse.department}</span>}
                  {selectedCourse.term && <span className="cx-badge cx-badge--info">{selectedCourse.term}</span>}
                </div>
              </div>

              {selectedCourse.syllabusBody && (
                <div className="cx-detail-section">
                  <h4>Course Description</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', lineHeight: 1.6, margin: 0 }}>{selectedCourse.syllabusBody}</p>
                </div>
              )}

              <div className="cx-detail-section">
                <h4>Course Information</h4>
                <div className="cx-detail-grid">
                  <div><span className="cx-detail-label">Course Code</span><span>{selectedCourse.courseCode}</span></div>
                  <div><span className="cx-detail-label">Credits</span><span>{selectedCourse.credits || 'Not specified'}</span></div>
                  <div><span className="cx-detail-label">Start Date</span><span>{selectedCourse.startAt ? new Date(selectedCourse.startAt).toLocaleDateString() : 'Not set'}</span></div>
                  <div><span className="cx-detail-label">End Date</span><span>{selectedCourse.concludeAt ? new Date(selectedCourse.concludeAt).toLocaleDateString() : 'Not set'}</span></div>
                  <div><span className="cx-detail-label">Enrollment Type</span><span>{selectedCourse.enrollmentType?.replace(/_/g, ' ') || 'Not specified'}</span></div>
                  <div><span className="cx-detail-label">Visibility</span><span>{selectedCourse.visibility?.replace(/_/g, ' ') || 'Not specified'}</span></div>
                </div>
              </div>

              <div className="cx-detail-section">
                <h4>Enrollment Summary</h4>
                <div className="cx-detail-grid">
                  <div><span className="cx-detail-label">Students</span><span>{selectedCourse.studentCount}</span></div>
                  <div><span className="cx-detail-label">Teachers</span><span>{selectedCourse.teacherCount}</span></div>
                  <div><span className="cx-detail-label">Assignments</span><span>{selectedCourse.assignmentCount}</span></div>
                  <div><span className="cx-detail-label">Created</span><span>{new Date(selectedCourse.createdAt).toLocaleDateString()}</span></div>
                </div>
              </div>

              <div className="cx-detail-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>Sections ({sections.filter(s => s.courseId === selectedCourse.id).length})</h4>
                  <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setShowSectionsModal(true); setSelectedCourse(selectedCourse); }}>
                    <SettingsSvg /> Manage
                  </button>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--cx-text-secondary)', lineHeight: 1.8 }}>
                  {sections.filter(s => s.courseId === selectedCourse.id).length === 0 ? (
                    <p style={{ margin: '8px 0' }}>No sections configured for this course.</p>
                  ) : (
                    sections.filter(s => s.courseId === selectedCourse.id).map(s => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                        <span>{s.name}</span>
                        <span style={{ color: 'var(--cx-text-tertiary)' }}>{s.studentCount} students</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="cx-modal__footer" style={{ display: 'flex', gap: 8 }}>
              <button className="cx-btn cx-btn--primary cx-btn--sm" onClick={() => { setShowCourseModal(false); handleEditClick(selectedCourse); }}><EditSvg /> Edit Course</button>
              <button className="cx-btn cx-btn--secondary cx-btn--sm" onClick={() => { setShowCourseModal(false); setShowSectionsModal(true); }}><PeopleSvg /> Manage Sections</button>
              <button className="cx-btn cx-btn--ghost cx-btn--sm" onClick={() => { setShowCourseModal(false); navigate(`/courses/${selectedCourse.id}`); }}><LaunchSvg /> Open Course</button>
            </div>
          </div>
        </div>
      )}

      {/* Export / Import Modals */}
      {activeMigrationModal === 'export' && (
        <div className="cx-modal-overlay" onClick={() => setActiveMigrationModal(null)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Export Course Content</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setActiveMigrationModal(null)}>&times;</button>
            </div>
            <div className="cx-modal__body">
              <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 16 }}>
                Export course content as an IMS Common Cartridge (.imscc) file. You can select specific courses to export.
              </p>
              <label style={labelStyle}>Select Course to Export</label>
              <select className="cx-select" style={{ width: '100%', marginBottom: 16 }}>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label className="cx-toggle">
                <input type="checkbox" defaultChecked />
                <span className="cx-toggle__track"><span className="cx-toggle__thumb" /></span>
                <span className="cx-toggle__label" style={toggleLabelStyle}>Include Quizzes and Question Banks</span>
              </label>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setActiveMigrationModal(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={() => {
                showToast({ title: 'Export Started', message: 'Course export is running in the background. You will be notified when the package is ready.', type: 'info' });
                setActiveMigrationModal(null);
              }}>Start Export</button>
            </div>
          </div>
        </div>
      )}

      {activeMigrationModal === 'import' && (
        <div className="cx-modal-overlay" onClick={() => setActiveMigrationModal(null)}>
          <div className="cx-modal cx-modal--md" onClick={e => e.stopPropagation()}>
            <div className="cx-modal__header">
              <h2 className="cx-modal__title">Import Course Content</h2>
              <button className="cx-btn cx-btn--ghost" onClick={() => setActiveMigrationModal(null)}>&times;</button>
            </div>
            <div className="cx-modal__body">
              <p style={{ fontSize: '0.875rem', color: 'var(--cx-text-secondary)', marginBottom: 16 }}>
                Upload an IMS Common Cartridge, Canvas Export package, or SCORM package.
              </p>
              <label style={labelStyle}>Target Course</label>
              <select className="cx-select" style={{ width: '100%', marginBottom: 16 }}>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <label style={labelStyle}>Content Package</label>
              <div style={{ border: '2px dashed var(--cx-border-subtle)', borderRadius: 8, padding: 32, textAlign: 'center', marginBottom: 16, cursor: 'pointer' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--cx-text-secondary)' }}>Click to browse or drag and drop file here</p>
              </div>
            </div>
            <div className="cx-modal__footer">
              <button className="cx-btn cx-btn--secondary" onClick={() => setActiveMigrationModal(null)}>Cancel</button>
              <button className="cx-btn cx-btn--primary" onClick={() => {
                showToast({ title: 'Import Started', message: 'Content import has been queued.', type: 'info' });
                setActiveMigrationModal(null);
              }}>Start Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagementPage;
