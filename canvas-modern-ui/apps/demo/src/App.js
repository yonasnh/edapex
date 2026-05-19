import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, Suspense } from 'react';
import { Theme, Grid, Column, Header, HeaderName, HeaderGlobalBar, HeaderGlobalAction, Button, Tag } from '@carbon/react';
import { Notification, Settings, User as UserIcon, Information } from '@carbon/icons-react';
import { useFeatureFlags, LTIProvider, useLTI } from '@schoolapex/core';
import { NavigationSidebar, CourseCard, AssignmentCard, DiscussionCard, CalendarEventCard, FileCard, LoadingSpinner, SkeletonCard, APIErrorHandler, LaunchInfo, ErrorBoundary, SettingsPanel, } from '@schoolapex/components';
import { GradebookSummary } from './components/GradebookSummary';
import { GlobalSearch } from './components/GlobalSearch';
import { EmptyCoursesState } from './components/EmptyStates';
import { UserProfile } from './components/UserProfile';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { BulkOperations } from './components/BulkOperations';
import { ToastContainer, useToasts } from './components/Toast';
/**
 * SchoolApex Modern UI Demo Application
 *
 * Showcases the modern Canvas LMS interface with:
 * - Beautiful Carbon Design System components
 * - Performance monitoring integration
 * - Security audit capabilities
 * - Accessibility compliance
 * - Production-ready architecture
 */
// Mock data for demonstration
const mockUser = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    roles: ['student'],
    locale: 'en',
    timezone: 'UTC',
    created_at: new Date(),
    updated_at: new Date(),
};
const mockCourses = [
    {
        id: '1',
        name: 'Advanced Web Development',
        course_code: 'CS4550',
        workflow_state: 'available',
        enrollments: [{
                id: '1',
                user_id: '1',
                course_id: '1',
                role: 'student',
                enrollment_state: 'active',
                created_at: new Date(),
                updated_at: new Date(),
            }],
        term: {
            id: '1',
            name: 'Fall 2024',
            start_at: new Date('2024-08-15'),
            end_at: new Date('2024-12-15'),
            workflow_state: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        settings: {
            allow_student_discussion_topics: true,
            allow_student_forum_attachments: false,
            allow_student_discussion_editing: true,
            grading_standard_enabled: false,
            grading_standard_id: null,
            allow_final_grade_override: false,
            hide_final_grades: false,
            hide_distribution_graphs: false,
            lock_all_announcements: false,
            restrict_enrollments_to_course_dates: false,
        },
        permissions: {
            create_discussion_topic: true,
            create_announcement: false,
            manage_grades: false,
            manage_students: false,
            manage_content: false,
            manage_course: false,
            read_roster: true,
            send_messages: true,
        },
        start_at: new Date('2024-08-15'),
        end_at: new Date('2024-12-15'),
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: '2',
        name: 'Data Structures & Algorithms',
        course_code: 'CS3200',
        workflow_state: 'available',
        enrollments: [{
                id: '2',
                user_id: '1',
                course_id: '2',
                role: 'student',
                enrollment_state: 'active',
                created_at: new Date(),
                updated_at: new Date(),
            }],
        term: {
            id: '1',
            name: 'Fall 2024',
            start_at: new Date('2024-08-15'),
            end_at: new Date('2024-12-15'),
            workflow_state: 'active',
            created_at: new Date(),
            updated_at: new Date(),
        },
        settings: {
            allow_student_discussion_topics: true,
            allow_student_forum_attachments: false,
            allow_student_discussion_editing: true,
            grading_standard_enabled: false,
            grading_standard_id: null,
            allow_final_grade_override: false,
            hide_final_grades: false,
            hide_distribution_graphs: false,
            lock_all_announcements: false,
            restrict_enrollments_to_course_dates: false,
        },
        permissions: {
            create_discussion_topic: true,
            create_announcement: false,
            manage_grades: false,
            manage_students: false,
            manage_content: false,
            manage_course: false,
            read_roster: true,
            send_messages: true,
        },
        start_at: new Date('2024-08-15'),
        end_at: new Date('2024-12-15'),
        created_at: new Date(),
        updated_at: new Date(),
    },
];
const mockAssignments = [
    {
        id: '1',
        name: 'React Component Architecture',
        description: 'Build a complex React application using modern component patterns and state management.',
        due_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Due in 2 days
        unlock_at: null,
        lock_at: null,
        points_possible: 100,
        grading_type: 'points',
        submission_types: ['online_upload', 'online_text_entry'],
        workflow_state: 'published',
        course_id: '1',
        assignment_group_id: '1',
        position: 1,
        peer_reviews: false,
        automatic_peer_reviews: false,
        grade_group_students_individually: false,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: '2',
        name: 'Database Design Project',
        description: 'Design and implement a normalized database schema for a real-world application.',
        due_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue by 1 day
        unlock_at: null,
        lock_at: null,
        points_possible: 150,
        grading_type: 'points',
        submission_types: ['online_upload'],
        workflow_state: 'published',
        course_id: '2',
        assignment_group_id: '2',
        position: 1,
        peer_reviews: false,
        automatic_peer_reviews: false,
        grade_group_students_individually: false,
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: '3',
        name: 'Algorithm Analysis Report',
        description: 'Analyze the time and space complexity of various sorting algorithms.',
        due_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
        unlock_at: null,
        lock_at: null,
        points_possible: 75,
        grading_type: 'points',
        submission_types: ['online_text_entry', 'online_upload'],
        workflow_state: 'published',
        course_id: '2',
        assignment_group_id: '2',
        position: 2,
        peer_reviews: false,
        automatic_peer_reviews: false,
        grade_group_students_individually: false,
        created_at: new Date(),
        updated_at: new Date(),
    },
];
const mockSubmissions = {
    '3': {
        id: '1',
        assignment_id: '3',
        user_id: '1',
        submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        score: 68,
        grade: '68',
        workflow_state: 'graded',
        submission_type: 'online_text_entry',
        body: 'Analysis of sorting algorithms...',
        url: undefined,
        attachments: [],
        created_at: new Date(),
        updated_at: new Date(),
    }
};
const mockStudents = [
    {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice.johnson@university.edu',
        avatar_url: undefined,
        roles: ['student'],
        locale: 'en',
        timezone: 'America/New_York',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: '2',
        name: 'Bob Smith',
        email: 'bob.smith@university.edu',
        avatar_url: undefined,
        roles: ['student'],
        locale: 'en',
        timezone: 'America/New_York',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: '3',
        name: 'Carol Davis',
        email: 'carol.davis@university.edu',
        avatar_url: undefined,
        roles: ['student'],
        locale: 'en',
        timezone: 'America/New_York',
        created_at: new Date(),
        updated_at: new Date(),
    },
    {
        id: '4',
        name: 'David Wilson',
        email: 'david.wilson@university.edu',
        avatar_url: undefined,
        roles: ['student'],
        locale: 'en',
        timezone: 'America/New_York',
        created_at: new Date(),
        updated_at: new Date(),
    },
];
const mockGradebookSubmissions = {
    '1': [
        {
            id: '1-1',
            assignment_id: '1',
            user_id: '1',
            submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            score: 95,
            grade: '95',
            workflow_state: 'graded',
            submission_type: 'online_text_entry',
            body: 'Excellent React component implementation...',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: '1-2',
            assignment_id: '2',
            user_id: '1',
            submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            score: 142,
            grade: '142',
            workflow_state: 'graded',
            submission_type: 'online_upload',
            body: '',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
    ],
    '2': [
        {
            id: '2-1',
            assignment_id: '1',
            user_id: '2',
            submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            score: 78,
            grade: '78',
            workflow_state: 'graded',
            submission_type: 'online_text_entry',
            body: 'Good React component implementation...',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: '2-3',
            assignment_id: '3',
            user_id: '2',
            submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            score: 65,
            grade: '65',
            workflow_state: 'graded',
            submission_type: 'online_text_entry',
            body: 'Algorithm analysis report...',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
    ],
    '3': [
        {
            id: '3-1',
            assignment_id: '1',
            user_id: '3',
            submitted_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            score: 62,
            grade: '62',
            workflow_state: 'graded',
            submission_type: 'online_text_entry',
            body: 'Basic React component implementation...',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
        // Missing assignment 2 submission
    ],
    '4': [
        {
            id: '4-2',
            assignment_id: '2',
            user_id: '4',
            submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            score: 88,
            grade: '88',
            workflow_state: 'graded',
            submission_type: 'online_upload',
            body: '',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: '4-3',
            assignment_id: '3',
            user_id: '4',
            submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            score: 72,
            grade: '72',
            workflow_state: 'graded',
            submission_type: 'online_text_entry',
            body: 'Algorithm analysis report...',
            url: undefined,
            attachments: [],
            created_at: new Date(),
            updated_at: new Date(),
        },
    ],
};
const mockDiscussions = [
    {
        id: '1',
        title: 'Welcome to Advanced Web Development!',
        message: '<p>Welcome everyone! Please introduce yourself and share what you hope to learn in this course.</p>',
        html_url: '/courses/1/discussion_topics/1',
        posted_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        last_reply_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        require_initial_post: true,
        user_can_see_posts: true,
        discussion_subentry_count: 24,
        read_state: 'unread',
        unread_count: 3,
        subscribed: true,
        published: true,
        locked: false,
        pinned: true,
        locked_for_user: false,
        lock_at: null,
        delayed_post_at: null,
        user_name: 'Prof. Sarah Johnson',
        topic_children: [],
        group_topic_children: [],
        discussion_type: 'threaded',
        attachments: [],
        permissions: {
            attach: false,
            update: false,
            reply: true,
            delete: false,
        },
        allow_rating: false,
        only_graders_can_rate: false,
        sort_by_rating: false,
        is_announcement: true,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
        id: '2',
        title: 'React Hooks vs Class Components',
        message: '<p>What are your thoughts on using React Hooks versus Class Components? Share your experiences and preferences.</p>',
        html_url: '/courses/1/discussion_topics/2',
        posted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        last_reply_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        require_initial_post: false,
        user_can_see_posts: true,
        discussion_subentry_count: 18,
        read_state: 'read',
        unread_count: 0,
        subscribed: false,
        published: true,
        locked: false,
        pinned: false,
        locked_for_user: false,
        lock_at: null,
        delayed_post_at: null,
        user_name: 'Prof. Sarah Johnson',
        topic_children: [],
        group_topic_children: [],
        discussion_type: 'threaded',
        attachments: [],
        permissions: {
            attach: false,
            update: false,
            reply: true,
            delete: false,
        },
        allow_rating: true,
        only_graders_can_rate: false,
        sort_by_rating: false,
        is_announcement: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: '3',
        title: 'Assignment 1: Component Architecture Discussion',
        message: '<p>Discuss your approach to the React Component Architecture assignment. Share challenges and solutions.</p>',
        html_url: '/courses/1/discussion_topics/3',
        posted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        last_reply_at: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        require_initial_post: true,
        user_can_see_posts: true,
        discussion_subentry_count: 12,
        read_state: 'unread',
        unread_count: 5,
        subscribed: true,
        assignment_id: '1',
        published: true,
        locked: false,
        pinned: false,
        locked_for_user: false,
        lock_at: null,
        delayed_post_at: null,
        user_name: 'Prof. Sarah Johnson',
        topic_children: [],
        group_topic_children: [],
        discussion_type: 'threaded',
        attachments: [],
        permissions: {
            attach: true,
            update: false,
            reply: true,
            delete: false,
        },
        allow_rating: false,
        only_graders_can_rate: false,
        sort_by_rating: false,
        is_announcement: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
];
const mockCalendarEvents = [
    {
        id: '1',
        title: 'React Component Architecture - Assignment Due',
        description: 'Submit your React component architecture assignment including component hierarchy and state management.',
        start_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        end_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        all_day: false,
        context_code: 'course_1',
        context_name: 'Advanced Web Development',
        workflow_state: 'active',
        hidden: false,
        child_events_count: 0,
        child_events: [],
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        own_reservation: false,
        reserved: false,
        important_dates: true,
        series_head: false,
        blackout_date: false,
        event_type: 'assignment',
        assignment: mockAssignments[0],
        assignment_overrides: [],
        duplicates: [],
        lock_at: null,
        delayed_post_at: null,
    },
    {
        id: '2',
        title: 'Office Hours - React Q&A Session',
        description: 'Drop-in office hours for React questions and assignment help.',
        start_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // Tomorrow at 2 PM
        end_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // Tomorrow at 4 PM
        all_day: false,
        location_name: 'Computer Science Building',
        location_address: 'Room 204, 123 University Ave',
        context_code: 'course_1',
        context_name: 'Advanced Web Development',
        workflow_state: 'active',
        hidden: false,
        child_events_count: 0,
        child_events: [],
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        appointment_group_id: 'ag_1',
        own_reservation: false,
        reserved: false,
        participants_per_appointment: 5,
        available_slots: 3,
        important_dates: false,
        series_head: false,
        blackout_date: false,
        event_type: 'appointment_group',
        assignment_overrides: [],
        duplicates: [],
        user: {
            id: 'prof_1',
            name: 'Prof. Sarah Johnson',
            email: 'sarah.johnson@university.edu',
            avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            roles: ['teacher'],
            locale: 'en',
            timezone: 'America/New_York',
            created_at: new Date(),
            updated_at: new Date(),
        },
        lock_at: null,
        delayed_post_at: null,
    },
    {
        id: '3',
        title: 'Midterm Exam',
        description: 'Comprehensive midterm covering React, state management, and component patterns.',
        start_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Next week at 10 AM
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000), // Next week at 12 PM
        all_day: false,
        location_name: 'Main Auditorium',
        location_address: 'Student Center, 456 Campus Drive',
        context_code: 'course_1',
        context_name: 'Advanced Web Development',
        workflow_state: 'active',
        hidden: false,
        child_events_count: 0,
        child_events: [],
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        own_reservation: false,
        reserved: false,
        important_dates: true,
        series_head: false,
        blackout_date: false,
        event_type: 'quiz',
        assignment_overrides: [],
        duplicates: [],
        lock_at: null,
        delayed_post_at: null,
    },
    {
        id: '4',
        title: 'Spring Break',
        description: 'University closed for spring break. No classes scheduled.',
        start_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        end_at: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        all_day: true,
        context_code: 'course_1',
        context_name: 'Advanced Web Development',
        workflow_state: 'active',
        hidden: false,
        child_events_count: 0,
        child_events: [],
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        own_reservation: false,
        reserved: false,
        important_dates: true,
        series_head: false,
        blackout_date: true,
        event_type: 'calendar_event',
        assignment_overrides: [],
        duplicates: [],
        lock_at: null,
        delayed_post_at: null,
    },
];
const mockFiles = [
    {
        id: '1',
        uuid: 'file-uuid-1',
        folder_id: 'folder-1',
        display_name: 'Assignment 1 - Component Architecture.pdf',
        filename: 'assignment-1-component-architecture.pdf',
        content_type: 'application/pdf',
        url: '/files/assignment-1.pdf',
        size: 2048576, // 2MB
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        unlock_at: null,
        locked: false,
        hidden: false,
        lock_at: null,
        locked_for_user: false,
        hidden_for_user: false,
        thumbnail_url: '/thumbnails/assignment-1-thumb.jpg',
        modified_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        mime_class: 'pdf',
        category: 'document',
    },
    {
        id: '2',
        uuid: 'file-uuid-2',
        display_name: 'React Hooks Presentation.pptx',
        filename: 'react-hooks-presentation.pptx',
        content_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        url: '/files/react-hooks-presentation.pptx',
        size: 5242880, // 5MB
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        unlock_at: null,
        locked: false,
        hidden: false,
        lock_at: null,
        locked_for_user: false,
        hidden_for_user: false,
        modified_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        mime_class: 'ppt',
        category: 'document',
    },
    {
        id: '3',
        uuid: 'file-uuid-3',
        display_name: 'Course Syllabus.docx',
        filename: 'course-syllabus.docx',
        content_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '/files/course-syllabus.docx',
        size: 1048576, // 1MB
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        unlock_at: null,
        locked: true,
        hidden: false,
        lock_at: null,
        locked_for_user: true,
        hidden_for_user: false,
        modified_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        mime_class: 'doc',
        category: 'document',
    },
];
const mockFolders = [
    {
        id: 'folder-1',
        name: 'Assignments',
        full_name: 'Course Files/Assignments',
        context_id: 'course_1',
        context_type: 'Course',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        lock_at: null,
        unlock_at: null,
        locked: false,
        folders_url: '/api/v1/folders/folder-1/folders',
        files_url: '/api/v1/folders/folder-1/files',
        files_count: 5,
        folders_count: 2,
        hidden: false,
        locked_for_user: false,
        hidden_for_user: false,
        for_submissions: false,
        can_upload: true,
    },
    {
        id: 'folder-2',
        name: 'Lecture Materials',
        full_name: 'Course Files/Lecture Materials',
        context_id: 'course_1',
        context_type: 'Course',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lock_at: null,
        unlock_at: null,
        locked: false,
        folders_url: '/api/v1/folders/folder-2/folders',
        files_url: '/api/v1/folders/folder-2/files',
        files_count: 12,
        folders_count: 0,
        hidden: false,
        locked_for_user: false,
        hidden_for_user: false,
        for_submissions: false,
        can_upload: false,
    },
];
function AppContent() {
    const { flags, isEnabled } = useFeatureFlags();
    const { toasts, addToast, removeToast } = useToasts();
    const lti = useLTI();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showBulkOps, setShowBulkOps] = useState(false);
    const [showLaunchInfo, setShowLaunchInfo] = useState(false);
    const [selectedAssignments, setSelectedAssignments] = useState([]);
    const [apiError, setApiError] = useState(null);
    const getItemName = (item) => {
        // Folder objects have 'folders_url'; Files have 'display_name'
        const isFolder = 'folders_url' in item;
        return isFolder ? item.name : item.display_name;
    };
    return (_jsx(ErrorBoundary, { level: "page", onError: (error, errorInfo, errorId) => {
            console.error('Application Error:', { error, errorInfo, errorId });
            addToast({
                type: 'error',
                title: 'Application Error',
                message: `An unexpected error occurred. Error ID: ${errorId}`,
            });
        }, children: _jsx(Theme, { theme: "g100", children: _jsxs("div", { className: "schoolapex-app", "data-testid": "app-container", children: [_jsx(NavigationSidebar, { currentUser: mockUser, activeItem: "dashboard", isCollapsed: sidebarCollapsed, onToggleCollapse: setSidebarCollapsed, onNavigate: (itemId, href) => {
                            if (itemId === 'lti-info') {
                                setShowLaunchInfo(true);
                            }
                            else {
                                addToast({
                                    type: 'info',
                                    title: 'Navigation',
                                    message: `Navigating to ${itemId}`,
                                });
                            }
                        }, showBadges: true }), _jsxs(Header, { "aria-label": "SchoolApex", children: [_jsx(HeaderName, { href: "#", prefix: "", children: _jsxs("span", { className: "schoolapex-brand", children: ["SchoolApex", lti.context && (_jsxs("span", { className: "context-info", children: [" - ", lti.context.title] })), lti.isLTILaunch && (_jsx(Tag, { type: "blue", size: "sm", style: { marginLeft: '8px' }, children: "LTI" }))] }) }), _jsxs(HeaderGlobalBar, { children: [_jsx(HeaderGlobalAction, { "aria-label": "Notifications", tooltipAlignment: "end", children: _jsx(Notification, { size: 20 }) }), _jsx(HeaderGlobalAction, { "aria-label": "LTI Launch Info", tooltipAlignment: "end", onClick: () => setShowLaunchInfo(true), children: _jsx(Information, { size: 20 }) }), _jsx(HeaderGlobalAction, { "aria-label": "User Settings", tooltipAlignment: "end", onClick: () => setShowSettings(true), children: _jsx(Settings, { size: 20 }) }), _jsx(HeaderGlobalAction, { "aria-label": "User Profile", tooltipAlignment: "end", onClick: () => setShowUserProfile(true), children: _jsx(UserIcon, { size: 20 }) })] })] }), _jsx("main", { className: "schoolapex-main", children: _jsxs(Grid, { className: "schoolapex-content", children: [_jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-hero", children: [_jsxs("h1", { className: "schoolapex-title", children: ["Welcome to ", _jsx("span", { className: "schoolapex-highlight", children: "SchoolApex" })] }), _jsx("p", { className: "schoolapex-subtitle", children: "Experience the future of educational technology with our revolutionary, modern interface that transforms the traditional Canvas LMS experience." }), isEnabled('debug_mode') && (_jsxs("div", { className: "schoolapex-debug", children: [_jsx("h3", { children: "\uD83D\uDE80 SchoolApex Features Enabled:" }), _jsx("ul", { children: Object.entries(flags).filter(([_, enabled]) => enabled).map(([flag]) => (_jsx("li", { children: flag.replace(/_/g, ' ').toUpperCase() }, flag))) })] }))] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Your Courses" }), _jsx("p", { children: "Beautiful, intuitive course management that makes learning effortless" }), _jsx("div", { className: "schoolapex-courses", children: mockCourses.map(course => (_jsx(CourseCard, { course: course, currentUser: mockUser, variant: "dashboard", showQuickActions: true }, course.id))) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Your Assignments" }), _jsx("p", { children: "Smart assignment management with due date tracking and submission status" }), _jsx("div", { className: "assignment-card-grid", children: mockAssignments.map(assignment => (_jsx(AssignmentCard, { assignment: assignment, currentUser: mockUser, submission: mockSubmissions[assignment.id], variant: "dashboard", showQuickActions: true, onSubmit: async (assignmentId) => {
                                                        console.log('Submit assignment:', assignmentId);
                                                        alert(`Submitting assignment: ${assignment.name}`);
                                                    } }, assignment.id))) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Gradebook Overview" }), _jsx("p", { children: "Smart grade tracking with analytics and insights for better learning outcomes" }), _jsx(GradebookSummary, { courseId: "1", courseName: "Advanced Web Development", students: mockStudents, assignments: mockAssignments, submissions: mockGradebookSubmissions, variant: "detailed", onViewFullGradebook: () => {
                                                    console.log('Navigate to full gradebook');
                                                    alert('Full gradebook view would open here');
                                                } })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Discussion Forums" }), _jsx("p", { children: "Engage in meaningful conversations with modern threaded discussions" }), _jsx("div", { className: "discussion-card-grid", children: mockDiscussions.map(discussion => (_jsx(DiscussionCard, { discussion: discussion, currentUser: mockUser, variant: "dashboard", showQuickActions: true, onReply: async (discussionId) => {
                                                        console.log('Reply to discussion:', discussionId);
                                                        alert(`Replying to discussion: ${discussion.title}`);
                                                    }, onMarkAsRead: async (discussionId) => {
                                                        console.log('Mark as read:', discussionId);
                                                        alert(`Marked discussion as read: ${discussion.title}`);
                                                    } }, discussion.id))) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Calendar Integration" }), _jsx("p", { children: "Stay organized with intelligent calendar views and event management" }), _jsx("div", { className: "calendar-event-card-grid", children: mockCalendarEvents.map(event => (_jsx(CalendarEventCard, { event: event, currentUser: mockUser, variant: "dashboard", showQuickActions: true, onJoin: async (eventId) => {
                                                        console.log('Join event:', eventId);
                                                        alert(`Joining event: ${event.title}`);
                                                    }, onEdit: async (eventId) => {
                                                        console.log('Edit event:', eventId);
                                                        alert(`Editing event: ${event.title}`);
                                                    }, onDelete: async (eventId) => {
                                                        console.log('Delete event:', eventId);
                                                        alert(`Deleting event: ${event.title}`);
                                                    } }, event.id))) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "File Management" }), _jsx("p", { children: "Modern file browser with drag-drop upload and intelligent organization" }), _jsx("div", { className: "file-browser-demo", children: _jsx("div", { className: "file-card-grid", children: [...mockFolders, ...mockFiles].slice(0, 4).map(item => (_jsx(FileCard, { item: item, currentUser: mockUser, variant: "grid", showActions: true, onOpen: (item) => {
                                                            const itemType = 'folders_url' in item ? 'folder' : 'file';
                                                            addToast({
                                                                type: 'info',
                                                                title: `Opening ${itemType}`,
                                                                message: `Opening ${getItemName(item)}...`,
                                                            });
                                                        }, onDownload: async (file) => {
                                                            addToast({
                                                                type: 'success',
                                                                title: 'Download started',
                                                                message: `Downloading ${file.display_name}...`,
                                                            });
                                                        }, onEdit: async (item) => {
                                                            addToast({
                                                                type: 'info',
                                                                title: 'Edit mode',
                                                                message: `Editing ${getItemName(item)}...`,
                                                            });
                                                        }, onDelete: async (item) => {
                                                            addToast({
                                                                type: 'warning',
                                                                title: 'Item deleted',
                                                                message: `${getItemName(item)} has been deleted.`,
                                                            });
                                                        }, onShare: async (item) => {
                                                            addToast({
                                                                type: 'success',
                                                                title: 'Share link created',
                                                                message: `Share link for ${getItemName(item)} copied to clipboard.`,
                                                            });
                                                        } }, item.id))) }) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Navigation & Search" }), _jsx("p", { children: "Modern navigation sidebar with global search capabilities" }), _jsxs("div", { className: "demo-controls", children: [_jsxs(Button, { kind: "primary", onClick: () => setSidebarCollapsed(!sidebarCollapsed), children: [sidebarCollapsed ? 'Expand' : 'Collapse', " Sidebar"] }), _jsx(Button, { kind: "secondary", onClick: () => setShowUserProfile(true), children: "View Profile" }), _jsx(Button, { kind: "tertiary", onClick: () => setShowSettings(true), children: "Settings" }), _jsx(Button, { kind: "ghost", onClick: () => {
                                                            setIsLoading(true);
                                                            setTimeout(() => setIsLoading(false), 3000);
                                                        }, children: "Demo Loading States" })] }), _jsx("div", { className: "global-search-demo", children: _jsx(GlobalSearch, { currentUser: mockUser, onSearch: async (query, filters) => {
                                                        addToast({
                                                            type: 'info',
                                                            title: 'Search executed',
                                                            message: `Searching for "${query}" with ${Object.keys(filters).length} filters`,
                                                        });
                                                        return [];
                                                    }, onResultClick: (result) => {
                                                        addToast({
                                                            type: 'success',
                                                            title: 'Result clicked',
                                                            message: `Opening: ${result.title}`,
                                                        });
                                                    }, showFilters: true, showRecentSearches: true }) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Loading & Empty States" }), _jsx("p", { children: "Skeleton screens and engaging empty state designs" }), _jsx("div", { className: "loading-states-demo", children: isLoading ? (_jsxs("div", { children: [_jsx("h3", { children: "Loading States Demo" }), _jsx(LoadingSpinner, { size: "lg", description: "Loading SchoolApex components..." }), _jsxs("div", { className: "skeleton-demo", children: [_jsx(SkeletonCard, { showAvatar: true, showActions: true, count: 1 }), _jsx(SkeletonCard, { showAvatar: false, showActions: true, count: 1 })] })] })) : (_jsxs("div", { children: [_jsx("h3", { children: "Empty States Demo" }), _jsx(EmptyCoursesState, { onBrowseCourses: () => {
                                                                addToast({
                                                                    type: 'info',
                                                                    title: 'Browse Courses',
                                                                    message: 'Redirecting to course catalog...',
                                                                });
                                                            }, onCreateCourse: () => {
                                                                addToast({
                                                                    type: 'success',
                                                                    title: 'Create Course',
                                                                    message: 'Opening course creation wizard...',
                                                                });
                                                            }, userRole: "teacher" })] })) })] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Phase 2: Advanced Features" }), _jsx("p", { children: "Production-ready features for enterprise Canvas deployments" }), _jsxs("div", { className: "demo-controls", children: [_jsx(Button, { kind: "primary", onClick: () => setShowAnalytics(true), children: "Analytics Dashboard" }), _jsx(Button, { kind: "secondary", onClick: () => setShowBulkOps(true), children: "Bulk Operations" }), _jsx(Button, { kind: "tertiary", onClick: () => setApiError(new Error('Demo API Error')), children: "Trigger API Error" }), _jsx(Button, { kind: "ghost", onClick: () => setApiError(null), children: "Clear Error" })] }), apiError && (_jsx("div", { className: "api-error-demo", children: _jsx(APIErrorHandler, { error: apiError, onRetry: () => {
                                                        addToast({
                                                            type: 'info',
                                                            title: 'Retrying',
                                                            message: 'Attempting to retry the operation...',
                                                        });
                                                        setApiError(null);
                                                    }, onDismiss: () => setApiError(null), showDetails: true }) }))] }) }), _jsx(Column, { lg: 16, md: 8, sm: 4, children: _jsxs("div", { className: "schoolapex-section", children: [_jsx("h2", { children: "Experience the Difference" }), _jsxs("div", { className: "schoolapex-features", children: [_jsxs("div", { className: "schoolapex-feature", children: [_jsx("h3", { children: "\uD83C\uDFA8 Beautiful Design" }), _jsx("p", { children: "Modern, clean interface that makes learning enjoyable" })] }), _jsxs("div", { className: "schoolapex-feature", children: [_jsx("h3", { children: "\uD83D\uDCF1 Mobile-First" }), _jsx("p", { children: "Perfect experience on any device, anywhere" })] }), _jsxs("div", { className: "schoolapex-feature", children: [_jsx("h3", { children: "\u26A1 Lightning Fast" }), _jsx("p", { children: "Optimized performance for instant interactions" })] }), _jsxs("div", { className: "schoolapex-feature", children: [_jsx("h3", { children: "\u267F Accessible" }), _jsx("p", { children: "WCAG 2.1 AA compliant for inclusive education" })] })] }), _jsxs("div", { className: "schoolapex-cta", children: [_jsx(Button, { kind: "primary", size: "lg", children: "Explore SchoolApex Features" }), _jsx(Button, { kind: "secondary", size: "lg", children: "View Documentation" })] })] }) })] }) }), _jsx(ToastContainer, { toasts: toasts, position: "top-right", onDismiss: removeToast }), showUserProfile && (_jsx("div", { className: "modal-overlay", onClick: () => setShowUserProfile(false), children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsx(UserProfile, { user: mockUser, canEdit: true, onSave: async (updatedUser) => {
                                        addToast({
                                            type: 'success',
                                            title: 'Profile Updated',
                                            message: 'Your profile has been successfully updated.',
                                        });
                                        setShowUserProfile(false);
                                    }, onCancel: () => setShowUserProfile(false), onAvatarUpload: async (file) => {
                                        addToast({
                                            type: 'success',
                                            title: 'Avatar Updated',
                                            message: 'Your profile picture has been updated.',
                                        });
                                        return '/mock-avatar-url.jpg';
                                    } }), _jsx("button", { className: "modal-close", onClick: () => setShowUserProfile(false), "aria-label": "Close profile", children: "\u00D7" })] }) })), showSettings && (_jsx("div", { className: "modal-overlay", onClick: () => setShowSettings(false), children: _jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [_jsx(SettingsPanel, { user: mockUser, onSave: async (settings) => {
                                        addToast({
                                            type: 'success',
                                            title: 'Settings Saved',
                                            message: 'Your settings have been successfully updated.',
                                        });
                                        setShowSettings(false);
                                    }, onReset: () => {
                                        addToast({
                                            type: 'info',
                                            title: 'Settings Reset',
                                            message: 'Settings have been reset to defaults.',
                                        });
                                    } }), _jsx("button", { className: "modal-close", onClick: () => setShowSettings(false), "aria-label": "Close settings", children: "\u00D7" })] }) })), showAnalytics && (_jsx("div", { className: "modal-overlay", onClick: () => setShowAnalytics(false), children: _jsxs("div", { className: "modal-content modal-content--large", onClick: (e) => e.stopPropagation(), children: [_jsx(Suspense, { fallback: _jsx(LoadingSpinner, {}), children: _jsx(AnalyticsDashboard, { metrics: [
                                            {
                                                id: 'engagement',
                                                label: 'Student Engagement',
                                                value: 87.5,
                                                change: 12.3,
                                                changeType: 'increase',
                                                format: 'percentage',
                                            },
                                            {
                                                id: 'performance',
                                                label: 'Average Grade',
                                                value: 84.2,
                                                change: -2.1,
                                                changeType: 'decrease',
                                                format: 'percentage',
                                            },
                                            {
                                                id: 'activity',
                                                label: 'Daily Active Users',
                                                value: 156,
                                                change: 8.7,
                                                changeType: 'increase',
                                                format: 'number',
                                            },
                                            {
                                                id: 'time',
                                                label: 'Avg. Session Time',
                                                value: 45,
                                                change: 15.2,
                                                changeType: 'increase',
                                                format: 'duration',
                                            },
                                        ], chartData: {
                                            engagement: {
                                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                                datasets: [{ label: 'Engagement', data: [85, 87, 89, 86, 88] }],
                                            },
                                            performance: {
                                                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                                                datasets: [{ label: 'Performance', data: [82, 84, 83, 85] }],
                                            },
                                            activity: {
                                                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                                datasets: [{ label: 'Activity', data: [145, 156, 162, 148, 159] }],
                                            },
                                            grades: {
                                                labels: ['A', 'B', 'C', 'D', 'F'],
                                                datasets: [{ label: 'Grade Distribution', data: [25, 35, 20, 15, 5] }],
                                            },
                                        }, filters: {
                                            dateRange: { start: new Date(), end: new Date() },
                                        }, onFiltersChange: () => { }, onExport: (format) => {
                                            addToast({
                                                type: 'success',
                                                title: 'Export Started',
                                                message: `Exporting analytics data as ${format.toUpperCase()}...`,
                                            });
                                        } }) }), _jsx("button", { className: "modal-close", onClick: () => setShowAnalytics(false), "aria-label": "Close analytics", children: "\u00D7" })] }) })), showBulkOps && (_jsx("div", { className: "modal-overlay", onClick: () => setShowBulkOps(false), children: _jsxs("div", { className: "modal-content modal-content--large", onClick: (e) => e.stopPropagation(), children: [_jsx(BulkOperations, { items: mockAssignments, selectedItems: selectedAssignments, onSelectionChange: setSelectedAssignments, operations: [
                                        {
                                            id: 'delete',
                                            label: 'Delete',
                                            icon: () => null,
                                            description: 'Permanently delete selected assignments.',
                                            confirmationRequired: true,
                                            destructive: true,
                                        },
                                        {
                                            id: 'grade',
                                            label: 'Bulk Grade',
                                            icon: () => null,
                                            description: 'Apply the same grade to all selected assignments.',
                                            confirmationRequired: true,
                                            destructive: false,
                                            requiresInput: true,
                                            inputType: 'number',
                                        },
                                    ], onExecuteOperation: async (operation, items, input) => {
                                        await new Promise(resolve => setTimeout(resolve, 2000));
                                        addToast({
                                            type: 'success',
                                            title: 'Bulk Operation Complete',
                                            message: `${operation} completed for ${items.length} items.`,
                                        });
                                    }, getItemId: (item) => item.id, getItemLabel: (item) => item.name }), _jsx("button", { className: "modal-close", onClick: () => setShowBulkOps(false), "aria-label": "Close bulk operations", children: "\u00D7" })] }) })), showLaunchInfo && (_jsx("div", { className: "modal-overlay", onClick: () => setShowLaunchInfo(false), children: _jsx("div", { className: "modal-content modal-content--large", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }, children: [_jsx("h2", { children: "LTI Launch Information" }), _jsx(Button, { kind: "ghost", size: "sm", onClick: () => setShowLaunchInfo(false), children: "Close" })] }), _jsx(LaunchInfo, {})] }) }) }))] }) }) }));
}
function App() {
    return (_jsx(LTIProvider, { ltiServiceUrl: "http://localhost:4001", fallbackToMock: true, children: _jsx(AppContent, {}) }));
}
export default App;
//# sourceMappingURL=App.js.map