import { gql } from '@apollo/client';

// Note: Canvas LMS doesn't have a dashboardStats query, so we'll use individual queries
export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    # Canvas LMS doesn't have a single dashboardStats query
    # We'll need to aggregate data from individual queries
    __schema {
      queryType {
        name
      }
    }
  }
`;

// Canvas LMS uses allCourses query with different field structure
export const GET_COURSES = gql`
  query GetCourses {
    allCourses {
      _id
      id
      name
      courseCode
      workflowState
      createdAt
    }
  }
`;

export const GET_COURSE = gql`
  query GetCourse($id: BigInt!) {
    course(id: $id) {
      id
      name
      courseCode
      workflowState
      startAt
      concludeAt
      createdAt
      syllabusBody
      publicDescription
      isActive
      isPublished
      studentCount
      teacherCount
      assignmentCount
      imageUrl
      bannerImageUrl
      students {
        id
        name
        displayName
        avatarImageUrl
      }
      teachers {
        id
        name
        displayName
        avatarImageUrl
      }
      assignments {
        id
        title
        description
        dueAt
        pointsPossible
        workflowState
        isPublished
        isOverdue
        submissionCount
        gradedCount
        averageScore
      }
    }
  }
`;

// Canvas LMS assignments query - simplified for testing
export const GET_ASSIGNMENTS = gql`
  query GetAssignments($courseId: ID) {
    course(id: $courseId) {
      _id
      name
      assignmentsConnection {
        nodes {
          _id
          name
          description
          dueAt
          pointsPossible
          workflowState
        }
      }
    }
  }
`;

export const GET_ASSIGNMENT = gql`
  query GetAssignment($id: BigInt!) {
    assignment(id: $id) {
      id
      title
      description
      dueAt
      unlockAt
      lockAt
      pointsPossible
      gradingType
      submissionTypes
      workflowState
      createdAt
      updatedAt
      isPublished
      isOverdue
      submissionCount
      gradedCount
      averageScore
      course {
        id
        name
        courseCode
        studentCount
      }
      submissions {
        id
        userId
        submissionType
        workflowState
        grade
        score
        submittedAt
        gradedAt
        isSubmitted
        isGraded
        isLate
        user {
          id
          name
          displayName
          avatarImageUrl
        }
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      id
      name
      sortableName
      displayName
      workflowState
      timeZone
      createdAt
      avatarImageUrl
      schoolName
      schoolPosition
      isActive
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: BigInt!) {
    user(id: $id) {
      id
      name
      sortableName
      displayName
      workflowState
      timeZone
      createdAt
      updatedAt
      avatarImageUrl
      phone
      schoolName
      schoolPosition
      isActive
      courses {
        id
        name
        courseCode
        workflowState
        isActive
      }
      enrollments {
        id
        type
        workflowState
        createdAt
        isActive
        isStudent
        isTeacher
        isTA
        course {
          id
          name
          courseCode
        }
      }
    }
  }
`;

export const GET_COURSE_ANALYTICS = gql`
  query GetCourseAnalytics($courseId: BigInt!) {
    courseAnalytics(courseId: $courseId) {
      courseId
      studentEngagement
      averageGrade
      submissionRate
      activityTrend {
        date
        count
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      displayName
      avatarImageUrl
      schoolName
      schoolPosition
      isActive
    }
  }
`;

export const SEARCH_COURSES = gql`
  query SearchCourses($query: String!) {
    searchCourses(query: $query) {
      id
      name
      courseCode
      workflowState
      studentCount
      teacherCount
      isActive
      isPublished
    }
  }
`;

// New queries for additional pages

export const GET_GRADES = gql`
  query GetGrades($userId: BigInt, $courseId: BigInt) {
    grades(userId: $userId, courseId: $courseId) {
      id
      assignment {
        id
        name
        pointsPossible
        dueAt
      }
      course {
        id
        name
      }
      score
      grade
      submittedAt
      gradedAt
      feedback
      workflowState
      late
      missing
      excused
    }
  }
`;

export const GET_CALENDAR_EVENTS = gql`
  query GetCalendarEvents($startDate: String, $endDate: String, $courseId: BigInt) {
    calendarEvents(startDate: $startDate, endDate: $endDate, courseId: $courseId) {
      id
      title
      description
      startAt
      endAt
      location
      type
      course {
        id
        name
      }
      allDay
      recurring
      workflowState
    }
  }
`;

export const GET_DISCUSSIONS = gql`
  query GetDiscussions($courseId: BigInt, $limit: Int, $offset: Int) {
    discussions(courseId: $courseId, limit: $limit, offset: $offset) {
      id
      title
      message
      author {
        id
        name
        avatarUrl
      }
      course {
        id
        name
      }
      createdAt
      lastReplyAt
      replyCount
      unreadCount
      viewCount
      pinned
      locked
      workflowState
    }
  }
`;

export const GET_FILES = gql`
  query GetFiles($courseId: BigInt, $folderId: BigInt, $limit: Int, $offset: Int) {
    files(courseId: $courseId, folderId: $folderId, limit: $limit, offset: $offset) {
      id
      displayName
      filename
      contentType
      size
      url
      thumbnailUrl
      createdAt
      updatedAt
      folderId
      locked
      hidden
    }
  }
`;

export const GET_FOLDERS = gql`
  query GetFolders($courseId: BigInt, $parentFolderId: BigInt) {
    folders(courseId: $courseId, parentFolderId: $parentFolderId) {
      id
      name
      fullName
      parentFolderId
      filesCount
      foldersCount
      createdAt
      updatedAt
      locked
      hidden
    }
  }
`;

export const GET_GROUPS = gql`
  query GetGroups($courseId: BigInt, $limit: Int, $offset: Int) {
    groups(courseId: $courseId, limit: $limit, offset: $offset) {
      id
      name
      description
      course {
        id
        name
      }
      memberCount
      maxMembers
      isPublic
      workflowState
      createdAt
      updatedAt
      leader {
        id
        name
      }
    }
  }
`;

export const GET_REPORTS = gql`
  query GetReports($limit: Int, $offset: Int) {
    reports(limit: $limit, offset: $offset) {
      id
      name
      description
      type
      generatedAt
      generatedBy {
        id
        name
      }
      fileUrl
      status
      courseId
      isScheduled
      createdAt
    }
  }
`;

export const GET_ADMIN_USERS = gql`
  query GetAdminUsers($limit: Int, $offset: Int, $role: String) {
    users(limit: $limit, offset: $offset, role: $role) {
      id
      name
      email
      workflowState
      lastLogin
      createdAt
      enrollmentCount
      loginCount
    }
  }
`;

export const GET_SYSTEM_SETTINGS = gql`
  query GetSystemSettings($category: String) {
    systemSettings(category: $category) {
      id
      category
      key
      value
      description
      type
      isPublic
      updatedAt
      updatedBy {
        id
        name
      }
    }
  }
`;
