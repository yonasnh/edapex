export const MOCK_USER = {
  id: 1,
  name: 'Alex Johnson',
  short_name: 'Alex',
  display_name: 'Alex Johnson',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  primary_email: 'alex.johnson@schoolapex.test',
  login_id: 'ajohnson',
  bio: 'Computer Science major, avid reader',
  locale: 'en',
  timezone: 'America/New_York',
  permissions: { become_user: true },
  enrollments: [
    { type: 'TeacherEnrollment', course_id: 1 },
    { type: 'StudentEnrollment', course_id: 2 },
    { type: 'StudentEnrollment', course_id: 3 },
    { type: 'StudentEnrollment', course_id: 4 },
  ],
}

export const MOCK_COURSES = [
  {
    id: 1, name: 'Introduction to Computer Science', course_code: 'CS 101',
    workflow_state: 'available', total_students: 45,
    teachers: [{ id: 100, display_name: 'Dr. Sarah Chen', avatar_url: '' }],
    term: { name: 'Fall 2026' }, course_image: '',
    enrollments: [{ type: 'teacher', role: 'TeacherEnrollment' }],
    course_progress: { requirement_count: 12, requirement_completed_count: 8 },
  },
  {
    id: 2, name: 'Calculus II', course_code: 'MATH 201',
    workflow_state: 'available', total_students: 38,
    teachers: [{ id: 101, display_name: 'Prof. James Miller', avatar_url: '' }],
    term: { name: 'Fall 2026' }, course_image: '',
    enrollments: [{ type: 'student', role: 'StudentEnrollment' }],
    course_progress: { requirement_count: 10, requirement_completed_count: 4 },
  },
  {
    id: 3, name: 'American Literature', course_code: 'ENGL 245',
    workflow_state: 'available', total_students: 28,
    teachers: [{ id: 102, display_name: 'Dr. Emily Walker', avatar_url: '' }],
    term: { name: 'Fall 2026' }, course_image: '',
    enrollments: [{ type: 'student', role: 'StudentEnrollment' }],
    course_progress: { requirement_count: 8, requirement_completed_count: 6 },
  },
  {
    id: 4, name: 'Physics for Engineers', course_code: 'PHYS 201',
    workflow_state: 'available', total_students: 52,
    teachers: [{ id: 103, display_name: 'Prof. Robert Kim', avatar_url: '' }],
    term: { name: 'Fall 2026' }, course_image: '',
    enrollments: [{ type: 'student', role: 'StudentEnrollment' }],
    course_progress: { requirement_count: 15, requirement_completed_count: 3 },
  },
  {
    id: 5, name: 'World History: 1500-Present', course_code: 'HIST 102',
    workflow_state: 'available', total_students: 62,
    teachers: [{ id: 104, display_name: 'Dr. Maria Garcia', avatar_url: '' }],
    term: { name: 'Fall 2026' }, course_image: '',
    enrollments: [{ type: 'student', role: 'StudentEnrollment' }],
    course_progress: { requirement_count: 6, requirement_completed_count: 5 },
  },
  {
    id: 6, name: 'Introduction to Psychology', course_code: 'PSYC 101',
    workflow_state: 'available', total_students: 75,
    teachers: [{ id: 105, display_name: 'Prof. David Thompson', avatar_url: '' }],
    term: { name: 'Fall 2026' }, course_image: '',
    enrollments: [{ type: 'student', role: 'StudentEnrollment' }],
    course_progress: { requirement_count: 9, requirement_completed_count: 9 },
  },
]

export const MOCK_FAVORITE_COURSES = [
  { id: 2, name: 'Calculus II', course_code: 'MATH 201', workflow_state: 'available', total_students: 38, term: { name: 'Fall 2026' }, course_image: '' },
  { id: 3, name: 'American Literature', course_code: 'ENGL 245', workflow_state: 'available', total_students: 28, term: { name: 'Fall 2026' }, course_image: '' },
  { id: 5, name: 'World History: 1500-Present', course_code: 'HIST 102', workflow_state: 'available', total_students: 62, term: { name: 'Fall 2026' }, course_image: '' },
  { id: 6, name: 'Introduction to Psychology', course_code: 'PSYC 101', workflow_state: 'available', total_students: 75, term: { name: 'Fall 2026' }, course_image: '' },
]

export const MOCK_TODO_ITEMS = [
  {
    type: 'submitting', assignment: { id: 101, name: 'Binary Search Tree Implementation', due_at: new Date(Date.now() + 86400000 * 2).toISOString(), points_possible: 100 },
    context_name: 'Introduction to Computer Science', context_type: 'Course', course_id: 1,
    html_url: '/courses/1/assignments/101',
  },
  {
    type: 'submitting', assignment: { id: 201, name: 'Integration by Parts Homework', due_at: new Date(Date.now() + 86400000 * 1).toISOString(), points_possible: 50 },
    context_name: 'Calculus II', context_type: 'Course', course_id: 2,
    html_url: '/courses/2/assignments/201',
  },
  {
    type: 'grading', assignment: { id: 301, name: 'Literary Analysis Essay', due_at: new Date(Date.now() - 86400000 * 3).toISOString(), points_possible: 200 },
    context_name: 'American Literature', context_type: 'Course', course_id: 3,
    html_url: '/courses/3/assignments/301',
  },
  {
    type: 'submitting', assignment: { id: 401, name: 'Lab Report: Pendulum Motion', due_at: new Date(Date.now() + 86400000 * 5).toISOString(), points_possible: 75 },
    context_name: 'Physics for Engineers', context_type: 'Course', course_id: 4,
    html_url: '/courses/4/assignments/401',
  },
  {
    type: 'submitting', assignment: { id: 501, name: 'Midterm Essay: The Industrial Revolution', due_at: new Date(Date.now() + 86400000 * 7).toISOString(), points_possible: 150 },
    context_name: 'World History: 1500-Present', context_type: 'Course', course_id: 5,
    html_url: '/courses/5/assignments/501',
  },
]

export const MOCK_UPCOMING_EVENTS = [
  {
    id: 1, title: 'CS 101 — Binary Search Tree Review', start_at: new Date(Date.now() + 86400000 * 1).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 1 + 3600000).toISOString(),
    context_name: 'Introduction to Computer Science', context_code: 'course_1',
  },
  {
    id: 2, title: 'MATH 201 — Office Hours', start_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
    context_name: 'Calculus II', context_code: 'course_2',
  },
  {
    id: 3, title: 'PHYS 201 — Lab Session', start_at: new Date(Date.now() + 86400000 * 3).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 3 + 5400000).toISOString(),
    context_name: 'Physics for Engineers', context_code: 'course_4',
  },
  {
    id: 4, title: 'Study Group: World History', start_at: new Date(Date.now() + 86400000 * 4).toISOString(),
    end_at: new Date(Date.now() + 86400000 * 4 + 3600000).toISOString(),
    context_name: 'World History: 1500-Present', context_code: 'course_5',
  },
]

export const MOCK_MISSING_SUBMISSIONS = [
  {
    id: 301, assignment_id: 301,
    course_id: 3, name: 'Literary Analysis Essay',
    due_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    course: { id: 3, name: 'American Literature', course_code: 'ENGL 245' },
  },
]

export const MOCK_ACTIVITY_STREAM = [
  {
    id: 1, title: 'New Announcement', message: 'Dr. Sarah Chen posted a new announcement in <b>CS 101</b>: "Midterm Project Guidelines"',
    type: 'Announcement', read_state: false, created_at: new Date(Date.now() - 3600000).toISOString(),
    html_url: '/courses/1/discussion_topics/1', course_id: 1,
  },
  {
    id: 2, title: 'Grade Posted', message: 'Your grade for "Linked Lists Assignment" has been posted — 92/100',
    type: 'Grade', read_state: false, created_at: new Date(Date.now() - 7200000).toISOString(),
    html_url: '/courses/1/assignments/102', course_id: 1,
  },
  {
    id: 3, title: 'Assignment Due Soon', message: 'Integration by Parts Homework due tomorrow in Calculus II',
    type: 'Discussion', read_state: true, created_at: new Date(Date.now() - 14400000).toISOString(),
    html_url: '/courses/2/assignments/201', course_id: 2,
  },
  {
    id: 4, title: 'New File', message: 'Prof. Robert Kim added "Lab 4: Pendulum Worksheet" to Physics for Engineers',
    type: 'File', read_state: true, created_at: new Date(Date.now() - 86400000).toISOString(),
    html_url: '/courses/4/files/1', course_id: 4,
  },
  {
    id: 5, title: 'Discussion Reply', message: 'Maria Lopez replied to your post in "Week 5 Discussion: Behaviorism"',
    type: 'Discussion', read_state: false, created_at: new Date(Date.now() - 1800000).toISOString(),
    html_url: '/courses/6/discussion_topics/5', course_id: 6,
  },
]

export const MOCK_ACTIVITY_STREAM_SUMMARY = [
  { type: 'Announcement', unread_count: 2, count: 5 },
  { type: 'Discussion', unread_count: 4, count: 12 },
  { type: 'Grade', unread_count: 1, count: 8 },
  { type: 'File', unread_count: 0, count: 3 },
  { type: 'Conversation', unread_count: 3, count: 7 },
]

export const MOCK_ASSIGNMENTS = [
  { id: 101, name: 'Binary Search Tree Implementation', due_at: new Date(Date.now() + 86400000 * 2).toISOString(), points_possible: 100, submission: { submitted: false, type: 'online_text_entry' }, score_statistics: { mean: 78, min: 45, max: 98 }, description: '<h3>Objective</h3><p>Implement a balanced binary search tree with insert, delete, and search operations.</p><h3>Requirements</h3><ul><li>Node insertion with rebalancing</li><li>Node deletion with rebalancing</li><li>Search with O(log n) complexity</li><li>Unit tests for all operations</li></ul>', has_rubric: true, grading_type: 'points' },
  { id: 102, name: 'Linked Lists Assignment', due_at: new Date(Date.now() - 86400000 * 7).toISOString(), points_possible: 100, submission: { submitted: true, score: 92, type: 'online_upload', attachments: [{ filename: 'linked_list.py', size: 2456 }] }, score_statistics: { mean: 74, min: 30, max: 100 }, description: '<h3>Objective</h3><p>Implement singly and doubly linked lists with common operations.</p>', has_rubric: false, grading_type: 'points' },
  { id: 103, name: 'Recursion Practice', due_at: new Date(Date.now() - 86400000 * 14).toISOString(), points_possible: 50, submission: { submitted: true, score: 45, type: 'online_text_entry' }, score_statistics: { mean: 36, min: 10, max: 50 }, description: '<h3>Objective</h3><p>Complete 5 recursion problems covering tree traversal, backtracking, and divide-and-conquer.</p>', has_rubric: true, grading_type: 'points' },
  { id: 104, name: 'Sorting Algorithms Comparison', due_at: new Date(Date.now() - 86400000 * 3).toISOString(), points_possible: 80, submission: { submitted: false, type: 'online_upload' }, score_statistics: { mean: 62, min: 20, max: 78 }, description: '<h3>Objective</h3><p>Implement and compare QuickSort, MergeSort, and HeapSort performance.</p>', has_rubric: true, grading_type: 'points' },
  { id: 105, name: 'Graph Traversal Project', due_at: new Date(Date.now() + 86400000 * 10).toISOString(), points_possible: 150, submission: { submitted: false, type: 'online_text_entry' }, score_statistics: null, description: '<h3>Objective</h3><p>Implement BFS, DFS, Dijkstra, and A* algorithms on a provided graph dataset.</p>', has_rubric: true, grading_type: 'points' },
  { id: 106, name: 'Weekly Quiz: Data Structures', due_at: new Date(Date.now() + 86400000 * 1).toISOString(), points_possible: 20, submission: { submitted: false, type: 'online_quiz' }, score_statistics: null, description: '<p>Weekly quiz covering arrays, linked lists, and trees.</p>', has_rubric: false, grading_type: 'points' },
]

export const MOCK_ASSIGNMENT_GROUPS = [
  { id: 1, name: 'Homework', weight: 30, assignments: [101, 103, 104] },
  { id: 2, name: 'Projects', weight: 40, assignments: [102, 105] },
  { id: 3, name: 'Quizzes', weight: 20, assignments: [106] },
  { id: 4, name: 'Participation', weight: 10, assignments: [] },
]

export const MOCK_MODULES = [
  {
    id: 1, name: 'Week 1: Introduction to Data Structures', position: 1,
    unlock_at: null, prerequisite_module_ids: [],
    items: [
      { id: 11, title: 'Course Overview', type: 'Page', content_id: 1, url: '/courses/1/pages/course-overview', completion_requirement: null },
      { id: 12, title: 'Reading: Arrays vs Linked Lists', type: 'Page', content_id: 2, url: '/courses/1/pages/arrays-vs-linked-lists', completion_requirement: { type: 'must_view', completed: true } },
      { id: 13, title: 'Lecture Video: Abstract Data Types', type: 'ExternalUrl', content_id: null, url: 'https://example.com/lecture-adt', external_url: 'https://example.com/lecture-adt', completion_requirement: { type: 'must_view', completed: true } },
      { id: 14, title: 'Discussion: What is a Data Structure?', type: 'Discussion', content_id: 1, url: '/courses/1/discussion_topics/1', completion_requirement: { type: 'must_contribute', completed: false } },
    ],
  },
  {
    id: 2, name: 'Week 2: Linked Lists', position: 2,
    unlock_at: new Date(Date.now() + 86400000 * 2).toISOString(), prerequisite_module_ids: [1],
    items: [
      { id: 21, title: 'Lecture: Linked List Operations', type: 'Page', content_id: 3, url: '/courses/1/pages/linked-list-operations', completion_requirement: { type: 'must_view', completed: false } },
      { id: 22, title: 'Assignment: Binary Search Tree Implementation', type: 'Assignment', content_id: 101, url: '/courses/1/assignments/101', completion_requirement: { type: 'must_submit', completed: false } },
      { id: 23, title: 'Lab: Linked List Practice', type: 'File', content_id: 1, url: '/courses/1/files/1', completion_requirement: null },
    ],
  },
  {
    id: 3, name: 'Week 3: Stacks & Queues', position: 3,
    unlock_at: new Date(Date.now() + 86400000 * 5).toISOString(), prerequisite_module_ids: [2],
    items: [
      { id: 31, title: 'Lecture: Stack ADT', type: 'Page', content_id: 4, url: '/courses/1/pages/stack-adt', completion_requirement: { type: 'must_view', completed: false } },
      { id: 32, title: 'Quiz: Stacks & Queues', type: 'Quiz', content_id: 1, url: '/courses/1/quizzes/1', completion_requirement: { type: 'must_submit', completed: false } },
    ],
  },
  { id: 99, name: 'Syllabus', position: 0, unlock_at: null, prerequisite_module_ids: [], items: [] },
]

export const MOCK_SEARCH_COURSES = [
  { id: 1, name: 'Introduction to Computer Science', course_code: 'CS 101', term: { name: 'Fall 2026' } },
  { id: 2, name: 'Calculus II', course_code: 'MATH 201', term: { name: 'Fall 2026' } },
  { id: 3, name: 'American Literature', course_code: 'ENGL 245', term: { name: 'Fall 2026' } },
]

export const MOCK_SEARCH_PEOPLE = [
  { id: 100, full_name: 'Dr. Sarah Chen', avatar_url: '', common_courses_count: 2 },
  { id: 101, full_name: 'Prof. James Miller', avatar_url: '', common_courses_count: 1 },
  { id: 102, full_name: 'Maria Lopez', avatar_url: '', common_courses_count: 3 },
]

export const MOCK_STUDENTS_GRADES = [
  { id: 1, name: 'Alex Johnson', grades: { current_score: 91.5, current_grade: 'A-', final_score: 89.7 } },
  { id: 2, name: 'Maria Lopez', grades: { current_score: 85.0, current_grade: 'B', final_score: 83.2 } },
  { id: 3, name: 'James Wilson', grades: { current_score: 72.3, current_grade: 'C', final_score: 74.1 } },
]

export const MOCK_SYLLABUS = {
  id: 1, course_id: 1,
  syllabus_body: '<h2>CS 101: Introduction to Computer Science</h2><p><strong>Instructor:</strong> Dr. Sarah Chen</p><p><strong>Office:</strong> Room 301, STEM Building</p><p><strong>Office Hours:</strong> Mon/Wed 2-4pm</p><hr><h3>Course Description</h3><p>This course provides a comprehensive introduction to the fundamental concepts of computer science. Topics include data structures, algorithms, computational thinking, and the theoretical foundations of computing.</p><h3>Prerequisites</h3><p>None. This is an introductory course.</p><h3>Required Materials</h3><ul><li>Introduction to Algorithms, 4th Edition — CLRS</li><li>Laptop with a C/C++ compiler or IDE</li></ul><h3>Grading Policy</h3><ul><li>Assignments: 40%</li><li>Quizzes: 20%</li><li>Midterm: 20%</li><li>Final Project: 20%</li></ul>',
}

export const MOCK_COURSE_PEOPLE = [
  { id: 100, display_name: 'Dr. Sarah Chen', avatar_url: '', email: 'sarah.chen@schoolapex.test', enrollments: [{ role: 'TeacherEnrollment', type: 'teacher' }], bio: 'Professor of Computer Science' },
  { id: 201, display_name: 'Alex Johnson', avatar_url: '', email: 'alex.johnson@schoolapex.test', enrollments: [{ role: 'StudentEnrollment', type: 'student' }], bio: '' },
  { id: 202, display_name: 'Maria Lopez', avatar_url: '', email: 'maria.lopez@schoolapex.test', enrollments: [{ role: 'StudentEnrollment', type: 'student' }], bio: '' },
  { id: 203, display_name: 'James Wilson', avatar_url: '', email: 'james.wilson@schoolapex.test', enrollments: [{ role: 'StudentEnrollment', type: 'student' }], bio: '' },
  { id: 204, display_name: 'Emily Davis', avatar_url: '', email: 'emily.davis@schoolapex.test', enrollments: [{ role: 'StudentEnrollment', type: 'student' }], bio: '' },
  { id: 205, display_name: 'Michael Brown', avatar_url: '', email: 'michael.brown@schoolapex.test', enrollments: [{ role: 'StudentEnrollment', type: 'student' }], bio: '' },
]

export const MOCK_DASHBOARD_STATS = {
  totalUsers: 1250, activeCourses: 48, pendingAssignments: 234,
  submissionsThisWeek: 891, avgGrade: 81.5, completionRate: 73,
}
